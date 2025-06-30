import { DataStructureState } from './data-structure';

/**
 * Binary Tree Node with visualization state
 */
export interface BinaryTreeNode {
  value: number;
  left: BinaryTreeNode | null;
  right: BinaryTreeNode | null;
  state: 'default' | 'active' | 'visited';
}

/**
 * Binary Tree state extending the base DataStructureState
 */
export interface BinaryTree extends DataStructureState {
  root: BinaryTreeNode | null;
}
