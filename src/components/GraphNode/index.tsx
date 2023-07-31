import { GraphNodeProps } from './interface';

function GraphNode({ height, width }: GraphNodeProps) {
  return <div className={`h-[${height}] w-[${width}]`}>GraphNode</div>;
}

export default GraphNode;
