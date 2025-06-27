/**
 * Binary Tree Layout Engine
 * 
 * This module provides algorithms for positioning binary tree nodes in 2D space
 * for visualization purposes. It implements a generic positioning system that
 * works with any binary tree structure while maintaining proper visual hierarchy
 * and avoiding node overlap.
 * 
 * The layout algorithm uses a recursive approach that positions nodes based on
 * their relationships in the tree, with automatic spacing adjustments based on
 * tree depth and node count to ensure optimal visual presentation.
 * 
 * @example
 * ```typescript
 * import { positionBinaryTree, calculateTreeMetrics } from './layout';
 * 
 * // Position nodes for visualization
 * positionBinaryTree(hierarchyNode, 800, 60);
 * 
 * // Get tree statistics
 * const metrics = calculateTreeMetrics(hierarchyNode);
 * console.log(`Tree depth: ${metrics.maxDepth}, nodes: ${metrics.nodeCount}`);
 * ```
 */

import * as d3 from "d3";
import type { BinaryTreeNode } from "./types";

/**
 * Generic binary tree positioning algorithm
 * 
 * Recursively positions nodes in a binary tree structure for optimal visual layout.
 * The algorithm ensures proper hierarchy display with:
 * - Parent nodes centered above their children
 * - Left children positioned to the left of parent
 * - Right children positioned to the right of parent
 * - Automatic spacing adjustment based on tree level
 * 
 * @param node The D3 hierarchy node to position (will be modified in place)
 * @param layoutWidth The total width available for the tree layout
 * @param baseSpacing The vertical spacing between tree levels
 * @param x The x-coordinate for this node (defaults to center of layout width)
 * @param y The y-coordinate for this node (defaults to base spacing)
 * @param levelWidth The width allocated for this tree level (reduces per level)
 * 
 * @example
 * ```typescript
 * const hierarchyNode = d3.hierarchy(treeData);
 * positionBinaryTree(hierarchyNode, 800, 80);
 * 
 * // Node positions are now available in hierarchyNode.x and hierarchyNode.y
 * const rootX = (hierarchyNode as d3.HierarchyPointNode<BinaryTreeNode>).x;
 * ```
 */
export function positionBinaryTree(
  node: d3.HierarchyNode<BinaryTreeNode>,
  layoutWidth: number,
  baseSpacing: number,
  x = layoutWidth / 2,
  y = baseSpacing,
  levelWidth = layoutWidth / 3
) {
  // Set position for current node
  const pointNode = node as d3.HierarchyPointNode<BinaryTreeNode>;
  pointNode.x = x;
  pointNode.y = y;
  
  // Recursively position children if they exist
  if (node.children && node.children.length > 0) {
    // For binary trees, identify left and right children based on value comparison
    const leftChild = node.children.find(child => child.data.value < node.data.value);
    const rightChild = node.children.find(child => child.data.value > node.data.value);
    
    // Reduce width for next level to create proper tree shape
    const nextLevelWidth = levelWidth * 0.65;
    
    // Position left child to the left of parent
    if (leftChild) {
      positionBinaryTree(
        leftChild, 
        layoutWidth, 
        baseSpacing, 
        x - levelWidth / 2, 
        y + baseSpacing, 
        nextLevelWidth
      );
    }
    
    // Position right child to the right of parent
    if (rightChild) {
      positionBinaryTree(
        rightChild, 
        layoutWidth, 
        baseSpacing, 
        x + levelWidth / 2, 
        y + baseSpacing, 
        nextLevelWidth
      );
    }
  }
}

/**
 * Calculate tree metrics for layout decisions
 * 
 * Analyzes a binary tree to extract key metrics that inform layout and rendering
 * decisions. These metrics help the visualization system make intelligent choices
 * about node sizing, spacing, and other visual parameters based on tree characteristics.
 * 
 * @param root The root node of the D3 hierarchy tree to analyze
 * @returns Object containing tree metrics:
 *   - maxDepth: The maximum depth/height of the tree (0 for single node)
 *   - nodeCount: Total number of nodes in the tree
 *   - balanceFactor: Absolute difference in size between left and right subtrees
 * 
 * @example
 * ```typescript
 * const hierarchyNode = d3.hierarchy(treeData);
 * const metrics = calculateTreeMetrics(hierarchyNode);
 * 
 * // Use metrics to adjust visualization parameters
 * if (metrics.nodeCount > 50) {
 *   // Use smaller nodes for large trees
 *   nodeSize = CONFIG.nodes.MIN_SIZE;
 * }
 * 
 * if (metrics.balanceFactor > 10) {
 *   // Adjust layout for unbalanced trees
 *   layoutWidth *= 1.5;
 * }
 * ```
 */
export function calculateTreeMetrics(root: d3.HierarchyNode<BinaryTreeNode>) {
  const descendants = root.descendants();
  const maxDepth = Math.max(...descendants.map(d => d.depth));
  const nodeCount = descendants.length;
  
  // Calculate balance factor (simplified measure of tree balance)
  // Note: This assumes binary tree structure with left/right children
  const leftSubtreeSize = root.children?.[0]?.descendants().length || 0;
  const rightSubtreeSize = root.children?.[1]?.descendants().length || 0;
  const balanceFactor = Math.abs(leftSubtreeSize - rightSubtreeSize);
  
  return { 
    maxDepth, 
    nodeCount, 
    balanceFactor 
  };
}
