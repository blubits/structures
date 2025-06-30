import type { BinaryTreeNode, BinaryTree } from '../types';
import { createBinaryTreeNode, updateBinaryTreeNode, createBinaryTree } from '../types';

/**
 * BST Algorithm Implementations for the New Architecture
 * 
 * These algorithms generate sequences of immutable tree states, where each state
 * represents one atomic step in the operation. Each step has embedded animation
 * hints for declarative visualization.
 * 
 * Key principles:
 * - One step = one atomic operation = one animation
 * - All states are immutable (create new instances)
 * - Animation hints embedded directly in tree state (not nodes)
 * - Educational step-by-step breakdown for learning
 */

/**
 * BST Insert Algorithm
 * 
 * Generates a sequence of tree states showing the step-by-step process
 * of inserting a value into a Binary Search Tree.
 * 
 * Each step represents one atomic operation:
 * 1. Compare with current node
 * 2. Choose direction (left/right)
 * 3. Move to next node OR insert new node
 * 
 * @param tree - Current tree state (immutable)
 * @param value - Value to insert
 * @returns Array of tree states showing the insertion process
 */
export function generateBSTInsertStates(tree: BinaryTree, value: number): BinaryTree[] {
  const states: BinaryTree[] = [];
  
  // If tree is empty, create root node
  if (!tree.root) {
    const newRoot = createBinaryTreeNode(
      value,
      null,
      null,
      'active'
    );
    
    states.push(createBinaryTree(
      newRoot,
      `Inserting ${value} as root`,
      [{ type: 'tree-insert', metadata: { value } }]
    ));
    
    // Final state with node in default state
    const finalRoot = updateBinaryTreeNode(newRoot, { 
      state: 'default'
    });
    
    states.push(createBinaryTree(
      finalRoot,
      `Inserted ${value} as root`,
      undefined
    ));
    
    return states;
  }
  
  // Helper function to traverse and insert
  const insertNode = (
    current: BinaryTreeNode,
    path: string[]
  ): { newTree: BinaryTreeNode; states: BinaryTree[] } => {
    const stepStates: BinaryTree[] = [];
    
    // Step 1: Compare with current node
    const compareNode = updateBinaryTreeNode(current, {
      state: 'active'
    });
    
    const compareTree = updateTreeAtPath(tree.root!, path, compareNode);
    stepStates.push(createBinaryTree(
      compareTree,
      `Comparing ${value} with ${current.value}`,
      [{ type: 'compare', metadata: { compareValue: current.value, insertValue: value } }]
    ));
    
    // Step 2: Make decision and traverse
    if (value < current.value) {
      // Go left
      const leftTraverseNode = updateBinaryTreeNode(compareNode, {
        state: 'active'
      });
      
      const leftTraverseTree = updateTreeAtPath(tree.root!, path, leftTraverseNode);
      stepStates.push(createBinaryTree(
        leftTraverseTree,
        `${value} < ${current.value}, going left`,
        [{ type: 'traverse-left', metadata: { direction: 'left' } }]
      ));
      
      if (current.left === null) {
        // Insert here
        const newNode = createBinaryTreeNode(
          value,
          null,
          null,
          'active'
        );
        
        const insertedNode = updateBinaryTreeNode(leftTraverseNode, {
          left: newNode,
          state: 'visited'
        });
        
        const insertedTree = updateTreeAtPath(tree.root!, path, insertedNode);
        stepStates.push(createBinaryTree(
          insertedTree,
          `Inserting ${value} as left child of ${current.value}`,
          [{ type: 'insert-left', metadata: { parentValue: current.value, value } }]
        ));
        
        // Final state with all nodes in default state
        const finalNode = updateBinaryTreeNode(insertedNode, {
          state: 'default',
          left: updateBinaryTreeNode(newNode, { state: 'default' })
        });
        
        const finalTree = updateTreeAtPath(tree.root!, path, finalNode);
        stepStates.push(createBinaryTree(
          finalTree,
          `Inserted ${value}`,
          undefined
        ));
        
        return { newTree: finalTree, states: stepStates };
      } else {
        // Continue traversing left
        const resetNode = updateBinaryTreeNode(leftTraverseNode, {
          state: 'visited'
        });
        
        const resetTree = updateTreeAtPath(tree.root!, path, resetNode);
        const result = insertNode(current.left, [...path, 'left']);
        
        return { 
          newTree: result.newTree, 
          states: [...stepStates.slice(0, -1), createBinaryTree(resetTree, `Continuing left...`), ...result.states] 
        };
      }
    } else if (value > current.value) {
      // Go right (similar logic to left)
      const rightTraverseNode = updateBinaryTreeNode(compareNode, {
        state: 'active'
      });
      
      const rightTraverseTree = updateTreeAtPath(tree.root!, path, rightTraverseNode);
      stepStates.push(createBinaryTree(
        rightTraverseTree,
        `${value} > ${current.value}, going right`,
        [{ type: 'traverse-right', metadata: { direction: 'right' } }]
      ));
      
      if (current.right === null) {
        // Insert here
        const newNode = createBinaryTreeNode(
          value,
          null,
          null,
          'active'
        );
        
        const insertedNode = updateBinaryTreeNode(rightTraverseNode, {
          right: newNode,
          state: 'visited'
        });
        
        const insertedTree = updateTreeAtPath(tree.root!, path, insertedNode);
        stepStates.push(createBinaryTree(
          insertedTree,
          `Inserting ${value} as right child of ${current.value}`,
          [{ type: 'insert-right', metadata: { parentValue: current.value, value } }]
        ));
        
        // Final state
        const finalNode = updateBinaryTreeNode(insertedNode, {
          state: 'default',
          right: updateBinaryTreeNode(newNode, { state: 'default' })
        });
        
        const finalTree = updateTreeAtPath(tree.root!, path, finalNode);
        stepStates.push(createBinaryTree(
          finalTree,
          `Inserted ${value}`,
          undefined
        ));
        
        return { newTree: finalTree, states: stepStates };
      } else {
        // Continue traversing right
        const resetNode = updateBinaryTreeNode(rightTraverseNode, {
          state: 'visited'
        });
        
        const resetTree = updateTreeAtPath(tree.root!, path, resetNode);
        const result = insertNode(current.right, [...path, 'right']);
        
        return { 
          newTree: result.newTree, 
          states: [...stepStates.slice(0, -1), createBinaryTree(resetTree, `Continuing right...`), ...result.states] 
        };
      }
    } else {
      // Value already exists - no insertion
      const existsNode = updateBinaryTreeNode(compareNode, {
        state: 'visited'
      });
      
      const existsTree = updateTreeAtPath(tree.root!, path, existsNode);
      stepStates.push(createBinaryTree(
        existsTree,
        `${value} already exists, not inserting`,
        [{ type: 'already-exists', metadata: { value } }]
      ));
      
      // Reset to original state
      const resetNode = updateBinaryTreeNode(existsNode, {
        state: 'default'
      });
      
      const resetTree = updateTreeAtPath(tree.root!, path, resetNode);
      stepStates.push(createBinaryTree(
        resetTree,
        `No changes made`,
        undefined
      ));
      
      return { newTree: resetTree, states: stepStates };
    }
  };
  
  const result = insertNode(tree.root, []);
  return result.states;
}

/**
 * BST Search Algorithm
 * 
 * Generates a sequence of tree states showing the step-by-step process
 * of searching for a value in a Binary Search Tree.
 */
export function generateBSTSearchStates(tree: BinaryTree, value: number): BinaryTree[] {
  const states: BinaryTree[] = [];
  
  if (!tree.root) {
    states.push(createBinaryTree(
      null,
      `Tree is empty, ${value} not found`,
      [{ type: 'search-empty', metadata: { value } }]
    ));
    return states;
  }
  
  const searchNode = (current: BinaryTreeNode | null, path: string[]): BinaryTree[] => {
    if (!current) {
      // Value not found
      states.push(createBinaryTree(
        tree.root,
        `${value} not found`,
        [{ type: 'not-found', metadata: { value } }]
      ));
      return states;
    }
    
    // Step 1: Compare with current node
    const compareNode = updateBinaryTreeNode(current, {
      state: 'active'
    });
    
    const compareTree = updateTreeAtPath(tree.root!, path, compareNode);
    states.push(createBinaryTree(
      compareTree,
      `Comparing ${value} with ${current.value}`,
      [{ type: 'compare', metadata: { compareValue: current.value, searchValue: value } }]
    ));
    
    if (value === current.value) {
      // Found!
      const foundNode = updateBinaryTreeNode(compareNode, {
        state: 'visited'
      });
      
      const foundTree = updateTreeAtPath(tree.root!, path, foundNode);
      states.push(createBinaryTree(
        foundTree,
        `Found ${value}!`,
        [{ type: 'found', metadata: { value } }]
      ));
      
      // Reset state
      const resetNode = updateBinaryTreeNode(foundNode, {
        state: 'visited'
      });
      
      const resetTree = updateTreeAtPath(tree.root!, path, resetNode);
      states.push(createBinaryTree(
        resetTree,
        `Search completed`,
        undefined
      ));
      
      return states;
    } else if (value < current.value) {
      // Go left
      const leftNode = updateBinaryTreeNode(compareNode, {
        state: 'visited'
      });
      
      const leftTree = updateTreeAtPath(tree.root!, path, leftNode);
      states.push(createBinaryTree(
        leftTree,
        `${value} < ${current.value}, going left`,
        [{ type: 'traverse-left', metadata: { direction: 'left' } }]
      ));
      
      return searchNode(current.left, [...path, 'left']);
    } else {
      // Go right
      const rightNode = updateBinaryTreeNode(compareNode, {
        state: 'visited'
      });
      
      const rightTree = updateTreeAtPath(tree.root!, path, rightNode);
      states.push(createBinaryTree(
        rightTree,
        `${value} > ${current.value}, going right`,
        [{ type: 'traverse-right', metadata: { direction: 'right' } }]
      ));
      
      return searchNode(current.right, [...path, 'right']);
    }
  };
  
  return searchNode(tree.root, []);
}

/**
 * Helper function to update a node at a specific path in the tree.
 * Creates a new tree with the updated node while preserving immutability.
 */
function updateTreeAtPath(root: BinaryTreeNode, path: string[], updatedNode: BinaryTreeNode): BinaryTreeNode {
  if (path.length === 0) {
    return updatedNode;
  }
  
  const [direction, ...restPath] = path;
  
  if (direction === 'left') {
    return updateBinaryTreeNode(root, {
      left: root.left ? updateTreeAtPath(root.left, restPath, updatedNode) : null
    });
  } else if (direction === 'right') {
    return updateBinaryTreeNode(root, {
      right: root.right ? updateTreeAtPath(root.right, restPath, updatedNode) : null
    });
  }
  
  return root;
}
