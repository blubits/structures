/**
 * A module for visualizing ordered binary trees and their operations.
 * 
 * This module provides a complete binary tree visualization system with support
 * for various tree types (BST, AVL, binary heap, etc.) and algorithm visualization.
 * 
 * Main exports include:
 * - Type definitions for tree nodes, operations, and configurations
 * - Algorithm step generation functions for common operations
 * - Tree type configurations for different binary tree variants
 * - Backward compatibility aliases for existing implementations
 * 
 * @example
 * ```typescript
 * import { 
 *   BinaryTreeNode, 
 *   generateBSTInsertSteps, 
 *   BST_CONFIG 
 * } from './BinaryTree';
 * 
 * // Create tree data
 * const tree: BinaryTreeNode = { value: 5, left: null, right: null };
 * 
 * // Generate visualization steps
 * const steps = generateBSTInsertSteps(tree, 3);
 * 
 * // Use tree configuration
 * const config = BST_CONFIG;
 * ```
 */

// Re-export types and algorithms
export type { 
  BinaryTreeNode, 
  TreeTypeConfig, 
  TraversalStep, 
  TreeOperation, 
  TraversalDecision,
  BSTVisualizerProps,
  BSTNode,
  BSTOperation
} from "./types";
export { BST_CONFIG, AVL_CONFIG, HEAP_CONFIG } from "./types";

export { TraversalOverlay } from "./overlays";
export { BSTTraversalOverlay } from "./bst-overlay";
export { positionBinaryTree, calculateTreeMetrics } from "./layout";
export { 
  renderBinaryTree, 
  type RenderBinaryTreeParams
} from "./renderer";
export { CONFIG } from "./config";
export { 
  linkAnimations, 
  nodeAnimations, 
  executeLinkAnimation, 
  executeNodeAnimation,
  type LinkAnimationContext,
  type NodeAnimationContext,
  type LinkAnimationFunction,
  type NodeAnimationFunction
} from "./animations";
export {
  type BinaryTreeVisualState,
  type VisualStateComputer,
  HistoryControllerStateComputer
} from "./visual-state";
