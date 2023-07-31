import * as d3 from 'd3';
import React from 'react';
import { createPortal } from 'react-dom';
import { dagStratify, sugiyama, decrossOpt, Dag } from 'd3-dag';
import { GraphNodeProps } from '@base/components/GraphNode/interface';
import GraphNode from '@base/components/GraphNode';
import { NodeData } from '../interface';
import { renderTitleOnNodes } from './GraphNode.helper';

const defaultNodeHeight = 50;
const defaultNodeWidth = 50;
const confortHorizontalSpacing = 40;
const confortVerticalSpacing = 40;
const overflowCharLimit = 15;
const overflowPaddingValuePerLetter = 5;

// eslint-disable-next-line no-unused-vars
type NodeClickHandler = (id: string) => void;

export default class NetworkGraph {
  componentRef?: SVGSVGElement = undefined;

  private height: number = 0;

  private width: number = 0;

  private dag?: Dag<NodeData, undefined>;

  private nodeWidth = defaultNodeWidth;

  private nodeHeight = defaultNodeHeight;

  // eslint-disable-next-line class-methods-use-this
  private handleNodeClick: NodeClickHandler = () => {};

  private renderNode: React.FC<GraphNodeProps> = GraphNode;

  private portals: React.ReactPortal[] = [];

  constructor(
    data: NodeData[],
    componentRef?: SVGSVGElement,
    nodeWidth?: number,
    nodeHeight?: number,
    renderNode?: React.FC<GraphNodeProps>
  ) {
    this.componentRef = componentRef != null ? componentRef : undefined;
    this.nodeWidth = nodeWidth || defaultNodeWidth;
    this.nodeHeight = nodeHeight || defaultNodeHeight;
    this.renderNode = renderNode || GraphNode;

    const {
      localDag: dag,
      layoutData: { height, width },
    } = this.generateDagStructureAndLayout(data);

    this.dag = dag;
    this.height = height;
    this.width = width;
  }

  private calculateNodeDimensions = (node?: {
    data: NodeData;
  }): [number, number] => {
    const { name, kpis } = node?.data ?? ({} as NodeData);

    const biggestName = [
      name,
      ...(kpis ?? []).map(({ value }) => `${name} ${value}`),
    ].reduce((acc, curr) => (acc.length > curr.length ? acc : curr));

    const overflowPadding =
      biggestName?.length > overflowCharLimit
        ? (biggestName.length - overflowCharLimit) *
          overflowPaddingValuePerLetter
        : 0;
    return [this.nodeWidth + overflowPadding, this.nodeHeight];
  };

  private generateDagStructureAndLayout(data: NodeData[]) {
    const stratify = dagStratify()
      .id((d: NodeData) => d.id)
      .parentIds((d: NodeData) => d.parentIds);

    const localDag = stratify(data);

    const layout = sugiyama() // base layout
      .decross(decrossOpt())
      .nodeSize((node) => {
        const [width, height] = this.calculateNodeDimensions(node);
        return [
          width + confortHorizontalSpacing,
          height + confortVerticalSpacing,
        ];
      });

    // type manipulation due to weird typing in d3-dag
    const layoutData = layout(localDag as unknown as Dag<never, never>);

    return {
      localDag,
      layoutData,
    };
  }

  private drawNodesAndLines(
    componentRef: SVGSVGElement,
    dag: Dag<NodeData, undefined>
  ) {
    const selectedSVG = d3.select(componentRef);
    selectedSVG.attr('viewBox', [0, 0, this.width, this.height].join(' '));

    const defs = selectedSVG.append('defs');

    const line = d3
      .line<{ x: number; y: number }>()
      .curve(d3.curveCatmullRom)
      .x((d) => d.x)
      .y((d) => d.y);

    // Draw the lines
    selectedSVG
      .append('g')
      .selectAll('path')
      .data(dag.links())
      .enter()
      .append('path')
      .attr('d', ({ points }) => line(points))
      .attr('fill', 'none')
      .attr('stroke-width', 3)
      .attr('stroke', ({ source, target }) => {
        const gradId = encodeURIComponent(
          `${source.data.id}--${target.data.id}`
        );

        const grad = defs
          .append('linearGradient')
          .attr('id', gradId)
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', source.x ?? 0)
          .attr('x2', target.x ?? 0)
          .attr('y1', source.y ?? 0)
          .attr('y2', target.y ?? 0);
        grad
          .append('stop')
          .attr('offset', '0%')
          .attr('stop-color', source.data.color);
        grad
          .append('stop')
          .attr('offset', '60%')
          .attr('stop-color', target.data.color);
        return `url(#${gradId})`;
      });

    const nodes = selectedSVG
      .append('g')
      .selectAll('g')
      .data(dag.descendants())
      .enter()
      .append('g')
      .attr('transform', ({ x, y }) => `translate(${x}, ${y})`);

    // generate the containers for the nodes
    nodes
      .append('rect')
      // .attr('r', this.nodeRadius)
      .attr('width', (node) => this.calculateNodeDimensions(node)[0])
      .attr('height', (node) => this.calculateNodeDimensions(node)[1])
      .attr('x', (node) => 0 - this.calculateNodeDimensions(node)[0] / 2)
      .attr('y', (node) => 0 - this.calculateNodeDimensions(node)[1] / 2)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', ({ data: { color } }) => color)
      .on('click', (_, d) => this.handleNodeClick(d.data.id));

    // const { calculateNodeDimensions, renderNode, portals } = this;
    // generates the portals to render the content of the nodes.
    // it mixes both d3 and react, so it can be a bit confusing
    // nodes
    //   .append('foreignObject')
    //   .attr('width', (node) => calculateNodeDimensions(node)[0])
    //   .attr('height', (node) => calculateNodeDimensions(node)[1])
    //   .attr('x', (node) => 0 - calculateNodeDimensions(node)[0] / 2)
    //   .attr('y', (node) => 0 - calculateNodeDimensions(node)[1] / 2)
    //   .attr('rx', 5)
    //   .attr('ry', 5)
    //   .each(function (node) {
    //     console.log('node', node);
    //     const [width, height] = calculateNodeDimensions(node);
    //     const nodeElement = d3.select(this);
    //     console.log('node element', nodeElement.node());
    //     console.log(
    //       'node rendered',
    //       renderNode({
    //         width,
    //         height,
    //       })
    //     );
    //     portals.push(
    //       createPortal(
    //         renderNode({
    //           width,
    //           height,
    //         }),
    //         nodeElement.node() as Element
    //       )
    //     );
    //   });
    // add texts
    renderTitleOnNodes(nodes, this.handleNodeClick);

    // add kpis
  }

  isRefReady() {
    return !!this.componentRef;
  }

  render() {
    const { dag, componentRef } = this;

    if (!componentRef || !dag)
      throw new Error('componentRef or dag is undefined, please set it first');

    this.drawNodesAndLines(componentRef, dag);
  }

  unmount() {
    if (this.componentRef) {
      d3.select(this.componentRef).selectAll('*').remove();
    }
  }

  setOnNodeClickEventHandler(handleClick: NodeClickHandler) {
    this.handleNodeClick = handleClick;
  }

  getPortals() {
    return this.portals;
  }
}
