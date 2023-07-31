import { ReactPortal, useEffect, useMemo, useState } from 'react';
import { HierarchicalNetworkProps, NodeData } from './interface';
import NetworkGraph from './NetworkGraph/NetworkGraph.class';
import { traverseDown } from './dagTraversal.utils';

const ERROR_COLOR = 'red';

function HierarchicalNetwork({
  data: initialData,
  height = 400,
  width = 400,
}: HierarchicalNetworkProps) {
  const [portals, setPortals] = useState<ReactPortal[]>([]);
  const [svgRef, setSvgRef] = useState<SVGSVGElement>();
  const [selectedNodeId, setSelectedNodeId] = useState<string>();

  const correctlyColoredNodeData = useMemo(() => {
    const selectedNode = initialData.find(({ id }) => id === selectedNodeId);
    if (selectedNode) {
      const colorNodeAsError = (changeableNode: NodeData) => {
        // eslint-disable-next-line no-param-reassign
        changeableNode.color = ERROR_COLOR;
      };
      return traverseDown(selectedNode, colorNodeAsError, initialData);
    }
    return initialData;
  }, [initialData, selectedNodeId]);

  const handleSvgRef = (svg: SVGSVGElement) => {
    setSvgRef(svg);
  };

  const networkGraphConstructor = useMemo(() => {
    const networkGraph = new NetworkGraph(correctlyColoredNodeData, svgRef);
    networkGraph.setOnNodeClickEventHandler(setSelectedNodeId);
    return networkGraph;
  }, [svgRef, correctlyColoredNodeData, setSelectedNodeId]);

  useEffect(() => {
    if (networkGraphConstructor.isRefReady()) {
      networkGraphConstructor.render();
      setPortals(networkGraphConstructor.getPortals());
      return () => {
        networkGraphConstructor.unmount();
      };
    }
    return () => {};
  }, [networkGraphConstructor]);

  return (
    <>
      <svg ref={handleSvgRef} width={width} height={height} />
      {...portals}
    </>
  );
}

export default HierarchicalNetwork;
