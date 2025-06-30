/**
 * Algorithm Library - Main Export Module
 * 
 * This module serves as the main entry point for all algorithm implementations
 * in the structures visualization project. It provides a clean, organized API
 * for accessing different algorithm categories.
 * 
 * The algorithms are organized by data structure type and operation, making it
 * easy to find and import the specific algorithms needed for visualization.
 * 
 * @example
 * ```typescript
 * import { 
 *   generateBSTInsertSteps, 
 *   generateBSTSearchSteps,
 *   BinaryTreeNode,
 *   TraversalStep 
 * } from './algorithms';
 * 
 * const tree: BinaryTreeNode = { value: 10, left: { value: 5 }, right: { value: 15 } };
 * const insertSteps = generateBSTInsertSteps(tree, 7);
 * const searchSteps = generateBSTSearchSteps(tree, 15);
 * ```
 */

// Re-export all BST algorithms and types
export {
  generateBSTInsertSteps,
  generateBSTSearchSteps,
  generateBSTFindMinSteps,
  generateBSTFindMaxSteps,
  generateLeftRotationSteps,
  generateRightRotationSteps,
  type TraversalStep,
  type TraversalDecision,
  type RotationType,
} from './bst';

// For backward compatibility, also export with the old names
// These aliases maintain compatibility with existing code
export {
  generateBSTInsertSteps as generateInsertSteps,
  generateBSTSearchSteps as generateSearchSteps,
  generateBSTFindMinSteps as generateFindMinSteps,
  generateBSTFindMaxSteps as generateFindMaxSteps,
} from './bst';
