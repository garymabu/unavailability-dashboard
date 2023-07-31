import { NodeData } from '@base/components/HierarchicalNetwork/interface';
import { ServiceAvailabilityResponse } from '@base/interface/integration/service/serviceAvailability.interface';

const DEFAULT_COLOR: string = '#327ae6';
const RESERVED_COLORS_BY_CLIENT: Record<string, string | undefined> = {
  Capemisa: '#e38710',
};

class ServiceAvailabilityService {
  static groupServiceDependenciesIntoNodes = (
    data: ServiceAvailabilityResponse['data']
  ) => {
    const nodeDataMap = new Map<string, NodeData>();

    data.forEach(({ 'FK-LOCALTABLE': rawParentId, ID, IDITEMCMDB: name }) => {
      const id = ID.toString();
      const parentId = rawParentId ? rawParentId.toString() : undefined;
      const node = nodeDataMap.get(id);
      if (!node) {
        nodeDataMap.set(id, {
          id,
          name,
          parentIds: typeof parentId !== 'undefined' ? [parentId] : parentId,
          color: DEFAULT_COLOR,
          kpis: [
            {
              name: 'Disponibilidade',
              value: 100,
            },
          ],
        });
      } else if (
        typeof parentId !== 'undefined' &&
        !node.parentIds?.includes(parentId)
      ) {
        node.parentIds?.push(parentId);
      }
    });
    return nodeDataMap;
  };

  static colorUpstreamNodesBasedOnHierarchy(
    nodeDataMap: Map<string, NodeData>
  ) {
    const findParentByLevelFromBase = (
      initialNode: NodeData,
      level: number
    ) => {
      let currentNode = initialNode;
      const invertedBranch: NodeData[] = [currentNode];
      while (
        currentNode.parentIds &&
        currentNode.parentIds.length &&
        // even if it is a dag, we are assuming
        // that the base of it starts as a tree until
        // the second level. So we have only one parent.
        nodeDataMap.has(currentNode.parentIds[0])
      ) {
        currentNode = nodeDataMap.get(currentNode.parentIds[0]) as NodeData;
        invertedBranch.push(currentNode);
      }

      const branch = invertedBranch.reverse();
      return branch[level];
    };

    nodeDataMap.forEach((node) => {
      const { parentIds } = node;

      if (parentIds && parentIds.length >= 1) {
        const parent = findParentByLevelFromBase(node, 1);
        if (parent) {
          const { name: parentName } = parent;
          const color = RESERVED_COLORS_BY_CLIENT[parentName];
          if (color) {
            nodeDataMap.set(node.id, {
              ...(nodeDataMap.get(node.id) as NodeData),
              color,
            });
          }
        }
      }
    });

    return Array.from(nodeDataMap.values());
  }
}

export default ServiceAvailabilityService;
