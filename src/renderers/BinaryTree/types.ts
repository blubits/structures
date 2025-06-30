import type { DataStructureState, AnimationHint } from '../../lib/core/types';

/**
 * Represents a node in a binary tree.
 * Extends the immutable pattern - all updates must create new instances.
 */
export interface BinaryTreeNode {
  /** The value stored in this node */
  value: number;
  
  /** Left child node (null if no left child) */
  left: BinaryTreeNode | null;
  
  /** Right child node (null if no right child) */
  right: BinaryTreeNode | null;
  
  /** 
   * Visual state of the node for rendering.
   * Limited to 3 states to keep animations atomic:
   * - 'default': Normal appearance
   * - 'active': Currently being processed/highlighted
   * - 'visited': Has been processed but still highlighted
   */
  state: 'default' | 'active' | 'visited';
  
  /** 
   * Unique identifier for this node instance.
   * Used for tracking nodes across state changes and animations.
   */
  id?: string;
  
  /** 
   * Additional metadata for rendering or algorithm-specific data.
   * Should not affect the logical structure of the tree.
   */
  metadata?: Record<string, any>;
}

/**
 * Represents a binary tree data structure state.
 * Extends DataStructureState to work with the generic framework.
 */
export interface BinaryTree extends DataStructureState {
  /** Root node of the tree (null for empty tree) */
  root: BinaryTreeNode | null;
  
  /** 
   * Total number of nodes in the tree.
   * Cached for performance - should be maintained by operations.
   */
  nodeCount?: number;
  
  /** 
   * Height of the tree.
   * Cached for performance - should be maintained by operations.
   */
  height?: number;
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
 * Creates a new binary tree node with immutable properties.
 */
export function createBinaryTreeNode(
  value: number,
  left: BinaryTreeNode | null = null,
  right: BinaryTreeNode | null = null,
  state: BinaryTreeNode['state'] = 'default',
  metadata?: Record<string, any>
): BinaryTreeNode {
  return {
    value,
    left,
    right,
    state,
    id: crypto.randomUUID(),
    metadata: metadata ? { ...metadata } : undefined,
  };
}

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
 * Creates a new binary tree state.
 */
export function createBinaryTree(
  root: BinaryTreeNode | null = null,
  name?: string,
  animationHints?: AnimationHint[],
  metadata?: Record<string, any>
): BinaryTree {
  return {
    root,
    name,
    animationHints: animationHints ? [...animationHints] : undefined,
    _metadata: metadata ? { ...metadata } : undefined,
    nodeCount: root ? countNodes(root) : 0,
    height: root ? calculateHeight(root) : 0,
  };
}

/**
 * Creates a copy of a tree with updated properties (immutable update).
 */
export function updateBinaryTree(
  tree: BinaryTree,
  updates: Partial<BinaryTree>
): BinaryTree {
  const newTree = {
    ...tree,
    ...updates,
    // Ensure arrays are copied for immutability
    animationHints: updates.animationHints ? [...updates.animationHints] : tree.animationHints,
    _metadata: updates._metadata ? { ...updates._metadata } : tree._metadata,
  };
  
  // Recalculate derived properties if root changed
  if (updates.root !== undefined) {
    newTree.nodeCount = newTree.root ? countNodes(newTree.root) : 0;
    newTree.height = newTree.root ? calculateHeight(newTree.root) : 0;
  }
  
  return newTree;
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
