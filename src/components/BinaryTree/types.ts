/**
 * Binary Tree Visualization Type Definitions
 * 
 * This module defines the core type system for binary tree visualization,
 * supporting multiple tree variants (BST, AVL, Red-Black, Heap, etc.) through
 * a flexible and extensible type architecture.
 * 
 * The type system is designed to be:
 * - Generic enough to support any binary tree variant
 * - Extensible for adding new operations and properties
 * - Type-safe for better development experience
 * - Compatible with React rendering requirements
 * 
 * @example
 * ```typescript
 * // Basic tree node
 * const node: BinaryTreeNode = {
 *   value: 42,
 *   left: { value: 20 },
 *   right: { value: 60, highlighted: true }
 * };
 * 
 * // Traversal step for visualization
 * const step: TraversalStep = {
 *   id: "step-1",
 *   currentNode: node,
 *   operation: "search",
 *   decision: "go_right",
 *   metadata: {
 *     searchValue: 60,
 *     description: "60 > 42, going right"
 *   }
 * };
 * ```
 */

/**
 * Represents a node in a binary tree structure
 * 
 * This is the fundamental building block for all binary tree visualizations.
 * The interface supports optional visual properties and metadata for enhanced
 * rendering and tree-specific features.
 * 
 * @interface BinaryTreeNode
 * @property {number} value - The numeric value stored in the node
 * @property {BinaryTreeNode} [left] - Optional left child node
 * @property {BinaryTreeNode} [right] - Optional right child node
 * @property {string} [id] - Optional unique identifier for the node
 * @property {boolean} [highlighted] - Whether the node should be visually highlighted
 * @property {string} [color] - Custom color for the node (overrides theme colors)
 * @property {Record<string, any>} [metadata] - Extensible metadata for tree-specific features
 * 
 * @example
 * ```typescript
 * const bstNode: BinaryTreeNode = {
 *   value: 10,
 *   left: { value: 5, highlighted: true },
 *   right: { value: 15, color: "#ff0000" },
 *   id: "node-10",
 *   metadata: { depth: 0, balanced: true }
 * };
 * ```
 */
export type BinaryTreeNode = {
  value: number;
  left?: BinaryTreeNode;
  right?: BinaryTreeNode;
  // Optional: Add node metadata for enhanced features
  id?: string;
  highlighted?: boolean;
  color?: string;
  // Tree-specific metadata
  metadata?: Record<string, any>;
};

/**
 * Supported tree operations for visualization
 * 
 * Extensible union type that covers common binary tree operations.
 * Can be extended with string to support custom operations for specific tree types.
 * 
 * @example
 * ```typescript
 * const operation: TreeOperation = "insert";
 * const customOp: TreeOperation = "customRebalance"; // Custom operation
 * ```
 */
export type TreeOperation = 'insert' | 'search' | 'delete' | 'findMin' | 'findMax' | 
                           'predecessor' | 'successor' | 'rotateLeft' | 'rotateRight' |
                           'heapifyUp' | 'heapifyDown' | 'rebalance' | string;

/**
 * Decision types made during tree traversal
 * 
 * Represents the various decisions and outcomes that can occur during
 * tree operations, used for visualization and step descriptions.
 * 
 * @example
 * ```typescript
 * const decision: TraversalDecision = "go_left";  // Standard decision
 * const customDecision: TraversalDecision = "split_node"; // Custom decision
 * ```
 */
export type TraversalDecision = 'go_left' | 'go_right' | 'found' | 'insert_here' | 
                               'not_found' | 'comparing' | 'rotating' | 'heapifying' | 
                               'rebalancing' | string;

/**
 * Represents a single step in a tree operation visualization
 * 
 * TraversalStep objects form the building blocks of operation visualization,
 * providing all necessary information to animate and explain each step
 * of a tree operation.
 * 
 * @interface TraversalStep
 * @property {string} id - Unique identifier for this step (required for React keys)
 * @property {BinaryTreeNode} currentNode - The node currently being processed
 * @property {BinaryTreeNode} [nextNode] - The next node to visit (if applicable)
 * @property {TreeOperation} operation - The type of operation being performed
 * @property {TraversalDecision} [decision] - The decision made at this step
 * @property {object} metadata - Additional information about this step
 * 
 * @example
 * ```typescript
 * const step: TraversalStep = {
 *   id: "search-step-3",
 *   currentNode: { value: 15 },
 *   nextNode: { value: 12 },
 *   operation: "search",
 *   decision: "go_left",
 *   metadata: {
 *     searchValue: 10,
 *     comparison: "less",
 *     description: "10 < 15, searching left subtree",
 *     isComplete: false,
 *     depth: 2
 *   }
 * };
 * ```
 */
export interface TraversalStep {
  id: string;
  currentNode: BinaryTreeNode;
  nextNode?: BinaryTreeNode;
  operation: TreeOperation;
  decision?: TraversalDecision;
  metadata: {
    /** The value being searched for or operated on */
    searchValue?: number;
    /** Result of comparing searchValue with current node */
    comparison?: 'less' | 'greater' | 'equal';
    /** Human-readable description of this step */
    description: string;
    /** Whether this step completes the operation */
    isComplete?: boolean;
    /** Extensible metadata for different tree types */
    [key: string]: any;
  };
}

/**
 * Configuration object for different tree type implementations
 * 
 * Allows customization of rendering, colors, and behavior for different
 * tree variants (BST, AVL, Red-Black, etc.) while maintaining a common interface.
 * 
 * @interface TreeTypeConfig
 * @property {string} name - Display name for this tree type
 * @property {Function} [nodeRenderer] - Custom React component for rendering nodes
 * @property {object} [nodeColorScheme] - Color scheme for different node states
 * @property {Record<TreeOperation, string>} [operationColors] - Colors for different operations
 * @property {string[]} [customProperties] - Additional properties this tree type uses
 * 
 * @example
 * ```typescript
 * const bstConfig: TreeTypeConfig = {
 *   name: "Binary Search Tree",
 *   nodeColorScheme: {
 *     default: "#3b82f6",
 *     highlighted: "#ef4444",
 *     active: "#10b981"
 *   },
 *   operationColors: {
 *     insert: "#10b981",
 *     search: "#3b82f6",
 *     delete: "#ef4444"
 *   }
 * };
 * ```
 */
export interface TreeTypeConfig {
  name: string;
  nodeRenderer?: (node: BinaryTreeNode, isHighlighted: boolean) => React.ReactNode;
  nodeColorScheme?: {
    default: string;
    highlighted: string;
    active: string;
    [key: string]: string;
  };
  operationColors?: Record<TreeOperation, string>;
  customProperties?: string[]; // Additional properties this tree type uses
}

// Component props
export interface BinaryTreeVisualizerProps {
  data: BinaryTreeNode;
  treeType?: TreeTypeConfig;
  onNodeClick?: (node: BinaryTreeNode) => void;
  onNodeHover?: (node: BinaryTreeNode | null) => void;
  highlightPath?: number[]; // Array of values to highlight
  animationSpeed?: 'slow' | 'normal' | 'fast';
  // Traversal visualization props
  traversalSteps?: TraversalStep[];
  currentStepIndex?: number;
  isTraversing?: boolean;
  onStepComplete?: (step: TraversalStep, stepIndex: number) => void;
  // Control functions for traversal overlay
  onTogglePlayback?: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  onResetTraversal?: () => void;
  onRestartTraversal?: () => void;
  isPlaying?: boolean;
  selectedOperation?: TreeOperation;
  // Optional history controller for intelligent highlighting
  historyController?: {
    getVisitedNodes(): Set<number>;
    getCurrentStep(): any;
    isTraversing?(): boolean;
    getLastStepDirection?(): 'forward' | 'backward' | null;
    getPreviousStep?(): any;
  };
}

// BST-specific props (for backward compatibility)
export interface BSTVisualizerProps {
  data: BinaryTreeNode;
  onNodeClick?: (node: BinaryTreeNode) => void;
  onNodeHover?: (node: BinaryTreeNode | null) => void;
  highlightPath?: number[]; // Array of values to highlight
  animationSpeed?: 'slow' | 'normal' | 'fast';
  // Traversal visualization props
  traversalSteps?: TraversalStep[];
  currentStepIndex?: number;
  isTraversing?: boolean;
  onStepComplete?: (step: TraversalStep, stepIndex: number) => void;
  showTraversalPath?: boolean;
  // Control functions for traversal overlay
  onTogglePlayback?: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  onResetTraversal?: () => void;
  onActualInsert?: () => void;
  insertValue?: number;
  isPlaying?: boolean;
  selectedOperation?: TreeOperation;
}

// Alias types for backward compatibility
export type BSTNode = BinaryTreeNode;
export type BSTOperation = TreeOperation;

// Tree-specific configurations
export const BST_CONFIG: TreeTypeConfig = {
  name: 'Binary Search Tree',
  nodeColorScheme: {
    default: '#3b82f6', // blue
    highlighted: '#ef4444', // red
    active: '#10b981', // green
  },
  operationColors: {
    insert: '#10b981', // green
    search: '#3b82f6', // blue
    findMin: '#f59e0b', // yellow
    findMax: '#f97316', // orange
    delete: '#ef4444', // red
  },
};

export const AVL_CONFIG: TreeTypeConfig = {
  name: 'AVL Tree',
  nodeColorScheme: {
    default: '#8b5cf6', // purple
    highlighted: '#ef4444', // red
    active: '#10b981', // green
    imbalanced: '#f59e0b', // yellow
  },
  operationColors: {
    insert: '#10b981',
    search: '#3b82f6',
    rotateLeft: '#f59e0b',
    rotateRight: '#f59e0b',
    rebalance: '#8b5cf6',
  },
};

export const HEAP_CONFIG: TreeTypeConfig = {
  name: 'Heap',
  nodeColorScheme: {
    default: '#06b6d4', // cyan
    highlighted: '#ef4444', // red
    active: '#10b981', // green
    parent: '#8b5cf6', // purple
  },
  operationColors: {
    insert: '#10b981',
    heapifyUp: '#f59e0b',
    heapifyDown: '#f97316',
    delete: '#ef4444',
  },
};
