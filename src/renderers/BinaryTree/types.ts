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

/**
 * Plain object representation of a binary tree node (user-friendly input).
 * This is what users can write directly without helper functions.
 */
export interface BinaryTreeNodeSpec {
  /** The value stored in this node */
  value: number;
  
  /** Left child node (null if no left child) */
  left: BinaryTreeNodeSpec | null;
  
  /** Right child node (null if no right child) */
  right: BinaryTreeNodeSpec | null;
  
  /** 
   * Visual state of the node for rendering.
   * Limited to 3 states to keep animations atomic:
   * - 'default': Normal appearance
   * - 'active': Currently being processed/highlighted
   * - 'visited': Has been processed but still highlighted
   */
  state?: 'default' | 'active' | 'visited';
  
  /** 
   * Optional explicit ID for the node. If not provided, one will be generated
   * based on the node's position in the tree for stable reconciliation.
   */
  id?: string;
  
  /** 
   * Additional metadata for rendering or algorithm-specific data.
   * Should not affect the logical structure of the tree.
   */
  metadata?: Record<string, any>;
}

/**
 * Enhanced binary tree interface that accepts plain objects.
 */
export interface BinaryTreeSpec {
  /** Root node of the tree (null for empty tree) */
  root: BinaryTreeNodeSpec | null;
  
  /** 
   * Human-readable description of the current operation step.
   * Examples: "Inserting 42", "Traversing left", "Found node", etc.
   */
  name?: string;
  
  /** 
   * Animation hints embedded directly in the state.
   * These hints tell the renderer what animations to apply.
   */
  animationHints?: AnimationHint[];
  
  /** 
   * Internal system metadata for rendering assistance.
   * Used by renderers for layout, positioning, or other display concerns.
   */
  _metadata?: Record<string, any>;
}

/**
 * Generates a stable ID for a node based on its path in the tree.
 * This ensures that nodes in the same position get the same ID across renders,
 * enabling efficient reconciliation without requiring users to specify IDs.
 */
function generateStableNodeId(
  value: number, 
  path: string = 'root', 
  existingId?: string
): string {
  if (existingId) return existingId;
  
  // Create a stable ID based on the path and value
  // This ensures the same node in the same position gets the same ID
  return `node-${path}-${value}`;
}

/**
 * Converts a plain object tree specification into a full BinaryTreeNode
 * with stable IDs for efficient reconciliation.
 */
export function normalizeBinaryTreeNode(
  spec: BinaryTreeNodeSpec | null,
  path: string = 'root'
): BinaryTreeNode | null {
  if (!spec) return null;
  
  const stableId = generateStableNodeId(spec.value, path, spec.id);
  
  return {
    value: spec.value,
    left: normalizeBinaryTreeNode(spec.left, `${path}.L`),
    right: normalizeBinaryTreeNode(spec.right, `${path}.R`),
    state: spec.state || 'default',
    id: stableId,
    metadata: spec.metadata ? { ...spec.metadata } : undefined,
  };
}

/**
 * Converts a plain object tree specification into a full BinaryTree
 * with stable IDs and computed properties.
 */
export function normalizeBinaryTree(spec: BinaryTreeSpec): BinaryTree {
  const normalizedRoot = normalizeBinaryTreeNode(spec.root);
  
  return {
    root: normalizedRoot,
    name: spec.name,
    animationHints: spec.animationHints ? [...spec.animationHints] : undefined,
    _metadata: spec._metadata ? { ...spec._metadata } : undefined,
    nodeCount: normalizedRoot ? countNodes(normalizedRoot) : 0,
    height: normalizedRoot ? calculateHeight(normalizedRoot) : 0,
  };
}

/**
 * Smart reconciliation function that preserves node identities across updates.
 * This is similar to React's reconciliation but for tree structures.
 */
export function reconcileBinaryTree(
  prevTree: BinaryTree | null,
  newSpec: BinaryTreeSpec
): BinaryTree {
  const newTree = normalizeBinaryTree(newSpec);
  
  if (!prevTree || !prevTree.root || !newTree.root) {
    return newTree;
  }
  
  // Recursively reconcile nodes, preserving IDs where possible
  const reconciledRoot = reconcileNodes(prevTree.root, newTree.root);
  
  return {
    ...newTree,
    root: reconciledRoot,
    nodeCount: reconciledRoot ? countNodes(reconciledRoot) : 0,
    height: reconciledRoot ? calculateHeight(reconciledRoot) : 0,
  };
}

/**
 * Reconciles two tree nodes, preserving identities where the structure matches.
 * This is the core reconciliation algorithm similar to React's.
 */
function reconcileNodes(
  prevNode: BinaryTreeNode | null,
  newNode: BinaryTreeNode | null
): BinaryTreeNode | null {
  // If both are null, no change
  if (!prevNode && !newNode) return null;
  
  // If one is null and the other isn't, use the new one
  if (!prevNode || !newNode) return newNode;
  
  // If the values are the same, this is likely the same logical node
  // Preserve the previous ID to maintain DOM element identity
  if (prevNode.value === newNode.value) {
    return {
      ...newNode,
      id: prevNode.id, // Preserve the existing ID for reconciliation
      left: reconcileNodes(prevNode.left, newNode.left),
      right: reconcileNodes(prevNode.right, newNode.right),
    };
  }
  
  // Different values = different nodes, use the new one
  return {
    ...newNode,
    left: reconcileNodes(null, newNode.left), // New subtree
    right: reconcileNodes(null, newNode.right), // New subtree
  };
}
