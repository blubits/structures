import type { BinaryTree } from '@structures/BinaryTree';
import { BinaryTreeStateBuilder } from '@structures/BinaryTree';

/**
 * BST Algorithm Implementations with Smart State Builder
 * 
 * This refactored version uses a BinaryTreeStateBuilder that automatically
 * handles path tracking and state management, allowing algorithms to focus
 * on BST logic rather than visualization details.
 * 
 * Key improvements:
 * - Algorithms mirror actual BST implementations (iterative with while loops)
 * - No manual path management - handled automatically by builder
 * - Clean, readable code focused on BST logic
 * - Automatic state creation and animation hints
 * - Educational value preserved through step-by-step visualization
 */

/**
 * BST Insert Algorithm
 * 
 * Generates a sequence of tree states showing the step-by-step process
 * of inserting a value into a Binary Search Tree.
 * 
 * This implementation mirrors actual BST insertion using iterative approach
 * with while loops, making it educational and easy to understand.
 */
export function generateBSTInsertStates(tree: BinaryTree, value: number): BinaryTree[] {
  const builder = new BinaryTreeStateBuilder(tree);
  
  // Handle empty tree
  if (!tree.root) {
    return builder
      .insertHere(value)
      .resetAll()
      .setName('Insert complete')
      .getStates();
  }
  
  // Standard BST insertion - mirrors actual BST algorithm
  while (builder.nodeExists()) {
    const currentNode = builder.getCurrentNode()!;
    
    // Compare step
    builder.compareWith(value);
    
    if (value === currentNode.value) {
      // Value already exists
      return builder
        .setName(`${value} already exists - no insertion`)
        .resetAll()
        .setName('No changes made')
        .getStates();
    }
    
    // Choose direction and check if we can traverse or need to insert
    if (value < currentNode.value) {
      if (builder.hasLeftChild()) {
        builder.traverseLeft();
      } else {
        // Insert as left child - don't traverse, just insert directly
        builder.insertLeftChild(value);
        return builder
          .resetAll()
          .setName('Insert complete')
          .getStates();
      }
    } else {
      if (builder.hasRightChild()) {
        builder.traverseRight();
      } else {
        // Insert as right child - don't traverse, just insert directly
        builder.insertRightChild(value);
        return builder
          .resetAll()
          .setName('Insert complete')
          .getStates();
      }
    }
  }
  
  return builder.getStates();
}

/**
 * BST Search Algorithm
 * 
 * Generates a sequence of tree states showing the step-by-step process
 * of searching for a value in a Binary Search Tree.
 * 
 * This implementation mirrors actual BST search using iterative approach
 * with while loops, making it educational and easy to understand.
 */
export function generateBSTSearchStates(tree: BinaryTree, value: number): BinaryTree[] {
  const builder = new BinaryTreeStateBuilder(tree);
  
  // Handle empty tree
  if (!tree.root) {
    return builder
      .setName(`Tree is empty - ${value} not found`)
      .getStates();
  }
  
  // Standard BST search - mirrors actual BST algorithm
  while (builder.nodeExists()) {
    const currentNode = builder.getCurrentNode()!;
    
    // Compare step
    builder.compareWith(value);
    
    if (value === currentNode.value) {
      // Found!
      return builder
        .setName(`Found ${value}!`)
        .resetAll()
        .setName('Search complete')
        .getStates();
    }
    
    // Choose direction and traverse
    if (value < currentNode.value) {
      if (builder.hasLeftChild()) {
        builder.traverseLeft();
      } else {
        return builder
          .setName(`${value} not found`)
          .resetAll()
          .setName('Search complete')
          .getStates();
      }
    } else {
      if (builder.hasRightChild()) {
        builder.traverseRight();
      } else {
        return builder
          .setName(`${value} not found`)
          .resetAll()
          .setName('Search complete')
          .getStates();
      }
    }
  }
  
  return builder.getStates();
}

/**
 * BST Find Minimum Algorithm
 * 
 * Generates a sequence of tree states showing the step-by-step process
 * of finding the minimum value in a Binary Search Tree.
 * 
 * In a BST, the minimum value is always the leftmost node.
 */
export function generateBSTFindMinStates(tree: BinaryTree): BinaryTree[] {
  const builder = new BinaryTreeStateBuilder(tree);
  
  if (!tree.root) {
    return builder.setName('Tree is empty - no minimum').getStates();
  }
  
  // Keep going left until we find the leftmost node
  while (builder.nodeExists()) {
    const currentNode = builder.getCurrentNode()!;
    
    if (builder.hasLeftChild()) {
      builder
        .compareWith(currentNode.value)
        .setName(`Current node: ${currentNode.value}, going left to find minimum`)
        .traverseLeft();
    } else {
      // Found the minimum
      const minValue = currentNode.value;
      return builder
        .compareWith(minValue)
        .setName(`Found minimum: ${minValue}`)
        .resetAll()
        .setName('Find minimum complete')
        .getStates();
    }
  }
  
  return builder.getStates();
}

/**
 * BST Find Maximum Algorithm
 * 
 * Generates a sequence of tree states showing the step-by-step process
 * of finding the maximum value in a Binary Search Tree.
 * 
 * In a BST, the maximum value is always the rightmost node.
 */
export function generateBSTFindMaxStates(tree: BinaryTree): BinaryTree[] {
  const builder = new BinaryTreeStateBuilder(tree);
  
  if (!tree.root) {
    return builder.setName('Tree is empty - no maximum').getStates();
  }
  
  // Keep going right until we find the rightmost node
  while (builder.nodeExists()) {
    const currentNode = builder.getCurrentNode()!;
    
    if (builder.hasRightChild()) {
      builder
        .compareWith(currentNode.value)
        .setName(`Current node: ${currentNode.value}, going right to find maximum`)
        .traverseRight();
    } else {
      // Found the maximum
      const maxValue = currentNode.value;
      return builder
        .compareWith(maxValue)
        .setName(`Found maximum: ${maxValue}`)
        .resetAll()
        .setName('Find maximum complete')
        .getStates();
    }
  }
  
  return builder.getStates();
}

