/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
import { deepClone } from '@base/utils/objectManipulation.utils';
import { NodeData } from './interface';

// we have to assume some things about this DAG
// to make it work:
// it is a tree until the second level.
// we can't have a ciclical structure.
// Example: a node that has a father that at some point is a child of it.
export const traverseDown = (
  nodeData: NodeData,
  callback: (node: NodeData) => void,
  nodeDataList: NodeData[]
) => {
  const nodeDataListDeepCopy = deepClone(nodeDataList);

  const nodeDataMap = new Map<string, NodeData>();
  nodeDataListDeepCopy.forEach((node) => {
    nodeDataMap.set(node.id, node);
  });

  const traverseDownRecursive = (node: NodeData) => {
    callback(node);
    if (node.parentIds && node.parentIds.length) {
      node.parentIds.forEach((parentId) => {
        const parentNode = nodeDataMap.get(parentId);
        if (parentNode) {
          traverseDownRecursive(parentNode);
        }
      });
    }
  };

  // we need to get the reference on the cloned list
  // in order to change the color of the node
  traverseDownRecursive(nodeDataMap.get(nodeData.id) as NodeData);

  return nodeDataListDeepCopy;
};

export default traverseDown;
