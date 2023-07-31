export interface KPI {
  name: string;
  value: number;
}

export interface NodeData {
  id: string;
  parentIds?: string[];
  name: string;
  kpis: KPI[];
  color: string;
}

export interface HierarchicalNetworkProps {
  data: NodeData[];
  width?: number;
  height?: number;
}
