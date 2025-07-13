import type { DataStructureState, DataStructureElement } from '@/types/data-structure';
import type { AnimationHint } from '@/types/animations';

/**
 * Represents a node in a binary tree.
 * - Inherits id and metadata from DataStructureElement.
 * - `id` and `state` are optional for user input, but always present after normalization.
 */
export interface BinaryTreeNode extends DataStructureElement {
  value: number;
  left: BinaryTreeNode | null;
  right: BinaryTreeNode | null;
  state?: 'default' | 'active' | 'visited';
}

/**
 * Represents a binary tree data structure state.
 * Extends DataStructureState for shared fields.
 */
export interface BinaryTree extends DataStructureState {
  root: BinaryTreeNode | null;
}

/**
 * Helper: Checks if a BinaryTree is normalized (all nodes have id and state).
 */
export function isNormalizedBinaryTree(tree: BinaryTree): boolean {
  function checkNode(node: BinaryTreeNode | null): boolean {
    if (!node) return true;
    if (!node.id || !node.state) return false;
    return checkNode(node.left) && checkNode(node.right);
  }
  return checkNode(tree.root);
}

/**
 * Generates a stable ID for a node based on its path in the tree.
 */
function generateStableNodeId(
  value: number,
  path: string = 'root',
  existingId?: string
): string {
  if (existingId) return existingId;
  return `node-${path}-${value}`;
}

/**
 * Converts a BinaryTree into a normalized BinaryTree (all nodes have id and state).
 */
export function normalizeBinaryTreeNode(
  node: BinaryTreeNode | null,
  path: string = 'root'
): BinaryTreeNode | null {
  if (!node) return null;
  const stableId = generateStableNodeId(node.value, path, node.id);
  return {
    value: node.value,
    left: normalizeBinaryTreeNode(node.left, `${path}.L`),
    right: normalizeBinaryTreeNode(node.right, `${path}.R`),
    state: node.state || 'default',
    id: stableId,
    metadata: node.metadata ? { ...node.metadata } : undefined,
  };
}

export function normalizeBinaryTree(tree: BinaryTree): BinaryTree {
  return {
    ...tree,
    root: normalizeBinaryTreeNode(tree.root),
  };
}

/**
 * Smart reconciliation function that preserves node identities across updates.
 */
export function reconcileBinaryTree(
  prevTree: BinaryTree | null,
  newTree: BinaryTree
): BinaryTree {
  const normalizedNew = normalizeBinaryTree(newTree);
  if (!prevTree || !prevTree.root || !normalizedNew.root) {
    return normalizedNew;
  }
  const reconciledRoot = reconcileNodes(prevTree.root, normalizedNew.root);
  return {
    ...normalizedNew,
    root: reconciledRoot,
  };
}

function reconcileNodes(
  prevNode: BinaryTreeNode | null,
  newNode: BinaryTreeNode | null
): BinaryTreeNode | null {
  if (!prevNode && !newNode) return null;
  if (!prevNode || !newNode) return newNode;
  if (prevNode.value === newNode.value) {
    return {
      ...newNode,
      id: prevNode.id, // Preserve the existing ID for reconciliation
      left: reconcileNodes(prevNode.left, newNode.left),
      right: reconcileNodes(prevNode.right, newNode.right),
    };
  }
  return {
    ...newNode,
    left: reconcileNodes(null, newNode.left),
    right: reconcileNodes(null, newNode.right),
  };
}

/**
 * Animation contexts specific to binary trees.
 */

export interface BinaryTreeNodeAnimationContext {
  /** The DOM element representing the tree node */
  element: Element;
  
  /** Animation hint that triggered this animation */
  hint: AnimationHint;
  
  /** The tree node data */
  nodeData: BinaryTreeNode;
  
  /** The complete tree state */
  treeState: BinaryTree;
  
  /** Callback when animation completes */
  onComplete?: () => void;
}

export interface BinaryTreeLinkAnimationContext {
  /** The DOM element representing the link/edge */
  element: Element;
  
  /** Animation hint that triggered this animation */
  hint: AnimationHint;
  
  /** Source node data */
  sourceNode: BinaryTreeNode;
  
  /** Target node data */
  targetNode: BinaryTreeNode;
  
  /** The complete tree state */
  treeState: BinaryTree;
  
  /** Callback when animation completes */
  onComplete?: () => void;
}

export interface BinaryTreeVisualizationContext {
  /** The root SVG group containing the entire tree */
  container: Element;
  
  /** Animation hints for the entire tree */
  hints: readonly AnimationHint[];
  
  /** The complete tree state */
  treeState: BinaryTree;
  
  /** Callback when all animations complete */
  onComplete?: () => void;
}

/**
 * Animation function types specific to binary trees.
 */
export type BinaryTreeNodeAnimationFunction = (context: BinaryTreeNodeAnimationContext) => void;
export type BinaryTreeLinkAnimationFunction = (context: BinaryTreeLinkAnimationContext) => void;
export type BinaryTreeVisualizationFunction = (context: BinaryTreeVisualizationContext) => void;

/**
 * Configuration for binary tree visualization.
 */
export interface BinaryTreeConfig {
  /** Layout configuration */
  layout: {
    /** Horizontal spacing between nodes at the same level */
    nodeSpacing: number;
    
    /** Vertical spacing between levels */
    levelSpacing: number;
    
    /** Radius of tree nodes */
    nodeRadius: number;
    
    /** Width of links between nodes */
    linkWidth: number;
  };
  
  /** Animation configuration */
  animation: {
    /** Default duration for animations in milliseconds */
    defaultDuration: number;
    
    /** Default easing function for animations */
    easing: string;
    
    /** Whether to automatically animate operations */
    autoAnimate: boolean;
  };
  
  /** Colors for different node states */
  colors: {
    default: string;
    active: string;
    visited: string;
    link: string;
  };
  
  /** Typography settings */
  typography: {
    fontSize: number;
    fontFamily: string;
    textColor: string;
  };
}

/**
 * Default configuration for binary tree visualization.
 */
export const DEFAULT_BINARY_TREE_CONFIG: BinaryTreeConfig = {
  layout: {
    nodeSpacing: 80,
    levelSpacing: 100,
    nodeRadius: 25,
    linkWidth: 2,
  },
  animation: {
    defaultDuration: 600,
    easing: 'ease-in-out',
    autoAnimate: true,
  },
  colors: {
    default: '#e5e7eb',
    active: '#3b82f6',
    visited: '#10b981',
    link: '#6b7280',
  },
  typography: {
    fontSize: 14,
    fontFamily: 'monospace',
    textColor: '#1f2937',
  },
};

/**
 * Helper functions for working with binary tree nodes.
 */

/**
 * Creates a copy of a node with updated properties (immutable update).
 */
export function updateBinaryTreeNode(
  node: BinaryTreeNode,
  updates: Partial<Omit<BinaryTreeNode, 'id'>>
): BinaryTreeNode {
  return {
    ...node,
    ...updates,
    // Ensure metadata is copied for immutability
    metadata: updates.metadata ? { ...updates.metadata } : node.metadata,
  };
}

/**
 * Creates a copy of a tree with updated properties (immutable update).
 */
export function updateBinaryTree(
  tree: BinaryTree,
  updates: Partial<BinaryTree>
): BinaryTree {
  return {
    ...tree,
    ...updates,
    // Ensure arrays are copied for immutability
    animationHints: updates.animationHints ? [...updates.animationHints] : tree.animationHints,
    _metadata: updates._metadata ? { ...updates._metadata } : tree._metadata,
  };
}

/**
 * Counts the total number of nodes in a tree.
 */
export function countNodes(node: BinaryTreeNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

/**
 * Calculates the height of a tree.
 */
export function calculateHeight(node: BinaryTreeNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(calculateHeight(node.left), calculateHeight(node.right));
}

/**
 * Performs an in-order traversal of the tree.
 */
export function inOrderTraversal(node: BinaryTreeNode | null, visit: (node: BinaryTreeNode) => void): void {
  if (!node) return;
  inOrderTraversal(node.left, visit);
  visit(node);
  inOrderTraversal(node.right, visit);
}

/**
 * Performs a pre-order traversal of the tree.
 */
export function preOrderTraversal(node: BinaryTreeNode | null, visit: (node: BinaryTreeNode) => void): void {
  if (!node) return;
  visit(node);
  preOrderTraversal(node.left, visit);
  preOrderTraversal(node.right, visit);
}

/**
 * Performs a post-order traversal of the tree.
 */
export function postOrderTraversal(node: BinaryTreeNode | null, visit: (node: BinaryTreeNode) => void): void {
  if (!node) return;
  postOrderTraversal(node.left, visit);
  postOrderTraversal(node.right, visit);
  visit(node);
}

/**
 * Finds a node with the specified value.
 */
export function findNode(node: BinaryTreeNode | null, value: number): BinaryTreeNode | null {
  if (!node) return null;
  if (node.value === value) return node;
  
  const leftResult = findNode(node.left, value);
  if (leftResult) return leftResult;
  
  return findNode(node.right, value);
}

/**
 * Performs a shallow comparison of two objects for performance optimization.
 * Similar to React's shallow comparison for props.
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
}

/**
 * Efficiently compares two arrays by reference and length.
 * Much faster than JSON.stringify for animation hints.
 */
export function arrayEqual<T>(arr1: T[] | undefined, arr2: T[] | undefined): boolean {
  if (arr1 === arr2) return true;
  if (!arr1 || !arr2) return arr1 === arr2;
  if (arr1.length !== arr2.length) return false;
  
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  
  return true;
}

/**
 * Creates a stable hash for a tree structure for efficient comparison.
 * Similar to React's reconciliation key generation.
 */
export function createTreeHash(node: BinaryTreeNode | null): string {
  if (!node) return 'null';
  
  const leftHash = createTreeHash(node.left);
  const rightHash = createTreeHash(node.right);
  
  return `${node.id || node.value}-${node.state}-${leftHash}-${rightHash}`;
}

/**
 * Memoized tree layout calculation to avoid recalculating unchanged subtrees.
 */
const layoutCache = new Map<string, Map<string, {x: number, y: number}>>();

export function getCachedTreeLayout(
  node: BinaryTreeNode | null,
  calculateLayout: (node: BinaryTreeNode | null) => Map<string, {x: number, y: number}>
): Map<string, {x: number, y: number}> {
  const treeHash = createTreeHash(node);
  
  if (layoutCache.has(treeHash)) {
    return layoutCache.get(treeHash)!;
  }
  
  const layout = calculateLayout(node);
  layoutCache.set(treeHash, layout);
  
  // Keep cache size reasonable (LRU-like behavior)
  if (layoutCache.size > 100) {
    const firstKey = layoutCache.keys().next().value;
    if (firstKey) {
      layoutCache.delete(firstKey);
    }
  }
  
  return layout;
}
