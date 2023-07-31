import * as d3 from 'd3';
import { DagNode } from 'd3-dag';
import { NodeData } from '../interface';

export const fontSize = 5;

export const renderTitleOnNodes = (
  nodes: d3.Selection<
    SVGGElement,
    DagNode<NodeData, undefined>,
    SVGGElement,
    unknown
  >,
  // eslint-disable-next-line no-unused-vars
  handleClick: (id: string) => void
) => {
  nodes
    .append('text')
    .text((d) => d.data.name)
    .attr('font-weight', 'bold')
    .attr('font-family', 'sans-serif')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('fill', 'white')
    .attr('font-size', () => {
      return `${fontSize}px`;
    })
    .on('click', (_, d) => handleClick(d.data.id));
};

// export const renderNodeValueLine = (
//   nodes: d3.Selection<
//     SVGGElement,
//     DagNode<NodeData, undefined>,
//     SVGGElement,
//     unknown
//   >,
//   // eslint-disable-next-line no-unused-vars
//   handleClick: (id: string) => void,
//   nodeDimensions:
// ) => {
//   nodes.each((node) => {
//   })
// };
