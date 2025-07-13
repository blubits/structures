import { BinaryTree } from '@structures/BinaryTree';

/**
 * BST Algorithm Implementations with New BinaryTree Class API
 * 
 * This refactored version uses the new BinaryTree class with method chaining
 * instead of the old BinaryTreeStateBuilder. All methods are pure and return
 * new immutable instances, allowing for clean state transitions.
 * 
 * Key improvements:
 * - Algorithms mirror actual BST implementations (iterative with while loops)
 * - Method chaining with immutable state transitions
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
  const states: BinaryTree[] = [];
  
  // Handle empty tree
  if (!tree.root) {
    const emptyTree = tree.startTraversal();
    const insertedTree = emptyTree.insertHere(value);
    const finalTree = insertedTree.resetAll().setName('Insert complete');
    return [emptyTree, insertedTree, finalTree];
  }
  
  // Start with clean traversal state
  let currentTree = tree.startTraversal();
  
  // Standard BST insertion - mirrors actual BST algorithm
  while (currentTree.nodeExists()) {
    const currentNode = currentTree.getCurrentNode()!;
    
    // Compare step
    currentTree = currentTree.compareWith(value);
    states.push(currentTree);
    
    if (value === currentNode.value) {
      // Value already exists
      const finalTree = currentTree.setName(`${value} already exists - no insertion`);
      states.push(finalTree);
      return states;
    } else if (value < currentNode.value) {
      if (currentTree.hasLeftChild()) {
        // Continue traversing left
        currentTree = currentTree.traverseLeft();
        states.push(currentTree);
      } else {
        // Insert as left child
        currentTree = currentTree.traverseLeft().insertHere(value);
        states.push(currentTree);
        break;
      }
    } else {
      if (currentTree.hasRightChild()) {
        // Continue traversing right
        currentTree = currentTree.traverseRight();
        states.push(currentTree);
      } else {
        // Insert as right child
        currentTree = currentTree.traverseRight().insertHere(value);
        states.push(currentTree);
        break;
      }
    }
  }
  
  // Final state - reset all nodes and mark completion
  const finalTree = currentTree.resetAll().setName('Insert complete');
  states.push(finalTree);
  
  return states;
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
  const states: BinaryTree[] = [];
  
  // Handle empty tree
  if (!tree.root) {
    const emptyState = tree.setName(`Tree is empty - ${value} not found`);
    return [emptyState];
  }
  
  // Start with clean traversal state
  let currentTree = tree.startTraversal();
  
  // Standard BST search - mirrors actual BST algorithm
  while (currentTree.nodeExists()) {
    const currentNode = currentTree.getCurrentNode()!;
    
    // Compare step
    currentTree = currentTree.compareWith(value);
    states.push(currentTree);
    
    if (value === currentNode.value) {
      // Found!
      const foundTree = currentTree.setName(`Found ${value}!`);
      const finalTree = foundTree.resetAll().setName('Search complete');
      states.push(foundTree, finalTree);
      return states;
    }
    
    // Choose direction and traverse
    if (value < currentNode.value) {
      if (currentTree.hasLeftChild()) {
        currentTree = currentTree.traverseLeft();
        states.push(currentTree);
      } else {
        const notFoundTree = currentTree.setName(`${value} not found`);
        const finalTree = notFoundTree.resetAll().setName('Search complete');
        states.push(notFoundTree, finalTree);
        return states;
      }
    } else {
      if (currentTree.hasRightChild()) {
        currentTree = currentTree.traverseRight();
        states.push(currentTree);
      } else {
        const notFoundTree = currentTree.setName(`${value} not found`);
        const finalTree = notFoundTree.resetAll().setName('Search complete');
        states.push(notFoundTree, finalTree);
        return states;
      }
    }
  }
  
  return states;
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
  const states: BinaryTree[] = [];
  
  if (!tree.root) {
    const emptyState = tree.setName('Tree is empty - no minimum');
    return [emptyState];
  }
  
  // Start traversal
  let currentTree = tree.startTraversal();
  
  // Keep going left until we find the leftmost node
  while (currentTree.nodeExists()) {
    const currentNode = currentTree.getCurrentNode()!;
    
    if (currentTree.hasLeftChild()) {
      currentTree = currentTree.compareWith(currentNode.value)
        .setName(`Current node: ${currentNode.value}, going left to find minimum`)
        .traverseLeft();
      states.push(currentTree);
    } else {
      // Found the minimum
      const minValue = currentNode.value;
      const foundTree = currentTree.compareWith(minValue)
        .setName(`Found minimum: ${minValue}`);
      const finalTree = foundTree.resetAll().setName('Find minimum complete');
      states.push(foundTree, finalTree);
      break;
    }
  }
  
  return states;
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
  const states: BinaryTree[] = [];
  
  if (!tree.root) {
    const emptyState = tree.setName('Tree is empty - no maximum');
    return [emptyState];
  }
  
  // Start traversal
  let currentTree = tree.startTraversal();
  
  // Keep going right until we find the rightmost node
  while (currentTree.nodeExists()) {
    const currentNode = currentTree.getCurrentNode()!;
    
    if (currentTree.hasRightChild()) {
      currentTree = currentTree.compareWith(currentNode.value)
        .setName(`Current node: ${currentNode.value}, going right to find maximum`)
        .traverseRight();
      states.push(currentTree);
    } else {
      // Found the maximum
      const maxValue = currentNode.value;
      const foundTree = currentTree.compareWith(maxValue)
        .setName(`Found maximum: ${maxValue}`);
      const finalTree = foundTree.resetAll().setName('Find maximum complete');
      states.push(foundTree, finalTree);
      break;
    }
  }
  
  return states;
}

