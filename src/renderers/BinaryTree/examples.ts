import type { BinaryTree, BinaryTreeNode } from './types';
import { createBinaryTreeNode, createBinaryTree } from './types';

/**
 * BST Examples and Validators
 * 
 * Provides predefined BST examples for demonstration and testing,
 * along with validation functions to ensure BST properties are maintained.
 */

/**
 * Creates a balanced BST example.
 */
export function createBalancedBSTExample(): BinaryTree {
  // Create a balanced BST: [4, 2, 6, 1, 3, 5, 7]
  const node1 = createBinaryTreeNode(1);
  const node3 = createBinaryTreeNode(3);
  const node5 = createBinaryTreeNode(5);
  const node7 = createBinaryTreeNode(7);
  
  const node2 = createBinaryTreeNode(2, node1, node3);
  const node6 = createBinaryTreeNode(6, node5, node7);
  
  const root = createBinaryTreeNode(4, node2, node6);
  
  return createBinaryTree(root, "Balanced BST Example");
}

/**
 * Creates an unbalanced (right-skewed) BST example.
 */
export function createUnbalancedBSTExample(): BinaryTree {
  // Create a right-skewed BST: [1, 2, 3, 4, 5]
  const node5 = createBinaryTreeNode(5);
  const node4 = createBinaryTreeNode(4, null, node5);
  const node3 = createBinaryTreeNode(3, null, node4);
  const node2 = createBinaryTreeNode(2, null, node3);
  const root = createBinaryTreeNode(1, null, node2);
  
  return createBinaryTree(root, "Unbalanced BST Example");
}

/**
 * Creates a simple BST example for demonstrations.
 */
export function createSimpleBSTExample(): BinaryTree {
  // Create a simple BST: [8, 3, 10, 1, 6, 14, 4, 7, 13]
  const node1 = createBinaryTreeNode(1);
  const node4 = createBinaryTreeNode(4);
  const node7 = createBinaryTreeNode(7);
  const node13 = createBinaryTreeNode(13);
  
  const node6 = createBinaryTreeNode(6, node4, node7);
  const node14 = createBinaryTreeNode(14, node13, null);
  
  const node3 = createBinaryTreeNode(3, node1, node6);
  const node10 = createBinaryTreeNode(10, null, node14);
  
  const root = createBinaryTreeNode(8, node3, node10);
  
  return createBinaryTree(root, "Simple BST Example");
}

/**
 * Creates a single-node BST example.
 */
export function createSingleNodeBSTExample(): BinaryTree {
  const root = createBinaryTreeNode(42);
  return createBinaryTree(root, "Single Node BST");
}

/**
 * Available BST examples.
 */
export const BST_EXAMPLES = {
  balanced: createBalancedBSTExample,
  unbalanced: createUnbalancedBSTExample,
  simple: createSimpleBSTExample,
  single: createSingleNodeBSTExample,
} as const;

/**
 * Gets a BST example by name.
 */
export function getBSTExample(name: keyof typeof BST_EXAMPLES): BinaryTree {
  const exampleFactory = BST_EXAMPLES[name];
  if (!exampleFactory) {
    throw new Error(`Unknown BST example: ${name}`);
  }
  return exampleFactory();
}

/**
 * Gets all available BST example names.
 */
export function getBSTExampleNames(): string[] {
  return Object.keys(BST_EXAMPLES);
}

/**
 * Validates that a tree maintains BST properties.
 */
export function validateBST(tree: BinaryTree): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!tree.root) {
    return { valid: true, errors: [] }; // Empty tree is valid
  }
  
  function validateNode(
    node: BinaryTreeNode | null, 
    min: number = -Infinity, 
    max: number = Infinity
  ): boolean {
    if (!node) return true;
    
    // Check BST property
    if (node.value <= min || node.value >= max) {
      errors.push(`Node ${node.value} violates BST property (min: ${min}, max: ${max})`);
      return false;
    }
    
    // Recursively validate left and right subtrees
    const leftValid = validateNode(node.left, min, node.value);
    const rightValid = validateNode(node.right, node.value, max);
    
    return leftValid && rightValid;
  }
  
  const isValid = validateNode(tree.root);
  
  return {
    valid: isValid && errors.length === 0,
    errors,
  };
}

/**
 * Checks if a tree is balanced (AVL property: height difference <= 1).
 */
export function isBalanced(tree: BinaryTree): { balanced: boolean; details: string } {
  if (!tree.root) {
    return { balanced: true, details: "Empty tree is balanced" };
  }
  
  function getHeight(node: BinaryTreeNode | null): number {
    if (!node) return 0;
    return 1 + Math.max(getHeight(node.left), getHeight(node.right));
  }
  
  function checkBalance(node: BinaryTreeNode | null): boolean {
    if (!node) return true;
    
    const leftHeight = getHeight(node.left);
    const rightHeight = getHeight(node.right);
    const heightDiff = Math.abs(leftHeight - rightHeight);
    
    if (heightDiff > 1) return false;
    
    return checkBalance(node.left) && checkBalance(node.right);
  }
  
  const balanced = checkBalance(tree.root);
  const height = getHeight(tree.root);
  
  return {
    balanced,
    details: balanced 
      ? `Tree is balanced (height: ${height})`
      : `Tree is unbalanced (height: ${height})`
  };
}
