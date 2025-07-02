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
      [{ type: 'appear', metadata: { targetType: 'node', targetValue: value } }]
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
    
    // Step 1: Compare with current node (set to active)
    const compareNode = updateBinaryTreeNode(current, {
      state: 'active'
    });
    
    const compareTree = updateTreeAtPath(tree.root!, path, compareNode);
    stepStates.push(createBinaryTree(
      compareTree,
      `Comparing ${value} with ${current.value}`,
      undefined // No animation hint needed - node state handles the color
    ));
    
    // Step 2: Make decision and traverse
    if (value < current.value) {
      // Go left
      const leftTraverseNode = updateBinaryTreeNode(compareNode, {
        state: 'visited' // Mark as visited when we decide to traverse
      });
      
      const leftTraverseTree = updateTreeAtPath(tree.root!, path, leftTraverseNode);
      
      // Only add traverse-down animation if there's actually a child to traverse to
      const animationHints = current.left ? [{ 
        type: 'traverse-down', 
        metadata: { 
          sourceValue: current.value, 
          targetValue: current.left.value
        } 
      }] : undefined;
      
      stepStates.push(createBinaryTree(
        leftTraverseTree,
        `${value} < ${current.value}, going left`,
        animationHints
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
          state: 'visited' // Keep parent as visited
        });
        
        const insertedTree = updateTreeAtPath(tree.root!, path, insertedNode);
        stepStates.push(createBinaryTree(
          insertedTree,
          `Inserting ${value} as left child of ${current.value}`,
          [{ type: 'appear', metadata: { targetType: 'node', targetValue: value } }]
        ));
        
        // Mark new node as visited for completion
        const completedNode = updateBinaryTreeNode(insertedNode, {
          left: updateBinaryTreeNode(newNode, { state: 'visited' })
        });
        
        const completedTree = updateTreeAtPath(tree.root!, path, completedNode);
        stepStates.push(createBinaryTree(
          completedTree,
          `Inserted ${value}`,
          undefined
        ));
        
        return { newTree: completedTree, states: stepStates };
      } else {
        // Continue traversing left - mark current node as visited
        const visitedNode = updateBinaryTreeNode(leftTraverseNode, {
          state: 'visited'
        });
        
        const result = insertNode(current.left, [...path, 'left']);
        
        // Update the previous "going left" step to show the visited state
        const updatedAnimationHints = current.left ? [{ 
          type: 'traverse-down', 
          metadata: { 
            sourceValue: current.value, 
            targetValue: current.left.value
          } 
        }] : undefined;
        
        const updatedTraverseStep = createBinaryTree(
          updateTreeAtPath(tree.root!, path, visitedNode),
          `${value} < ${current.value}, going left`,
          updatedAnimationHints
        );
        
        // Merge states and ensure ALL nodes in the current path remain visited
        const baseStates = [...stepStates.slice(0, -1), updatedTraverseStep];
        
        // For each state from the recursive call, ensure the current path remains visited
        const enhancedChildStates = result.states.map(childState => {
          if (childState.root) {
            // Mark the entire path from root to current node as visited
            const rootWithVisitedPath = markPathAsVisited(childState.root, path);
            return createBinaryTree(rootWithVisitedPath, childState.name, childState.animationHints);
          }
          return childState;
        });
        
        const mergedStates = [...baseStates, ...enhancedChildStates];
        
        return { 
          newTree: result.newTree, 
          states: mergedStates
        };
      }
    } else if (value > current.value) {
      // Go right (similar logic to left)
      const rightTraverseNode = updateBinaryTreeNode(compareNode, {
        state: 'visited' // Mark as visited when we decide to traverse
      });
      
      const rightTraverseTree = updateTreeAtPath(tree.root!, path, rightTraverseNode);
      
      // Only add traverse-down animation if there's actually a child to traverse to
      const animationHints = current.right ? [{ 
        type: 'traverse-down', 
        metadata: { 
          sourceValue: current.value, 
          targetValue: current.right.value
        } 
      }] : undefined;
      
      stepStates.push(createBinaryTree(
        rightTraverseTree,
        `${value} > ${current.value}, going right`,
        animationHints
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
          state: 'visited' // Keep parent as visited
        });
        
        const insertedTree = updateTreeAtPath(tree.root!, path, insertedNode);
        stepStates.push(createBinaryTree(
          insertedTree,
          `Inserting ${value} as right child of ${current.value}`,
          [{ type: 'appear', metadata: { targetType: 'node', targetValue: value } }]
        ));
        
        // Mark new node as visited for completion
        const completedNode = updateBinaryTreeNode(insertedNode, {
          right: updateBinaryTreeNode(newNode, { state: 'visited' })
        });
        
        const completedTree = updateTreeAtPath(tree.root!, path, completedNode);
        stepStates.push(createBinaryTree(
          completedTree,
          `Inserted ${value}`,
          undefined
        ));
        
        return { newTree: completedTree, states: stepStates };
      } else {
        // Continue traversing right - mark current node as visited
        const visitedNode = updateBinaryTreeNode(rightTraverseNode, {
          state: 'visited'
        });
        
        const result = insertNode(current.right, [...path, 'right']);
        
        // Update the previous "going right" step to show the visited state
        const updatedAnimationHints = current.right ? [{ 
          type: 'traverse-down', 
          metadata: { 
            sourceValue: current.value, 
            targetValue: current.right.value
          } 
        }] : undefined;
        
        const updatedTraverseStep = createBinaryTree(
          updateTreeAtPath(tree.root!, path, visitedNode),
          `${value} > ${current.value}, going right`,
          updatedAnimationHints
        );
        
        // Merge states and ensure ALL nodes in the current path remain visited
        const baseStates = [...stepStates.slice(0, -1), updatedTraverseStep];
        
        // For each state from the recursive call, ensure the current path remains visited
        const enhancedChildStates = result.states.map(childState => {
          if (childState.root) {
            // Mark the entire path from root to current node as visited
            const rootWithVisitedPath = markPathAsVisited(childState.root, path);
            return createBinaryTree(rootWithVisitedPath, childState.name, childState.animationHints);
          }
          return childState;
        });
        
        const mergedStates = [...baseStates, ...enhancedChildStates];
        
        return { 
          newTree: result.newTree, 
          states: mergedStates
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
        [{ type: 'shake', metadata: { targetType: 'node', targetValue: value } }]
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
  
  // Add final cleanup state - reset all nodes to default
  const finalCleanupStates = [...result.states];
  const lastState = finalCleanupStates[finalCleanupStates.length - 1];
  if (lastState && lastState.root) {
    const cleanRoot = resetAllNodesToDefault(lastState.root);
    finalCleanupStates.push(createBinaryTree(
      cleanRoot,
      `Insert complete - tree ready`,
      undefined
    ));
  }
  
  return finalCleanupStates;
}

/**
 * BST Search Algorithm
 * 
 * Generates a sequence of tree states showing the step-by-step process
 * of searching for a value in a Binary Search Tree.
 */
export function generateBSTSearchStates(tree: BinaryTree, value: number): BinaryTree[] {
  if (!tree.root) {
    const emptyState = createBinaryTree(
      null,
      `Tree is empty, ${value} not found`,
      [{ type: 'shake', metadata: { targetType: 'tree' } }]
    );
    return [emptyState];
  }
  
  const searchNode = (current: BinaryTreeNode | null, path: string[]): BinaryTree[] => {
    if (!current) {
      // Value not found
      const notFoundState = createBinaryTree(
        tree.root,
        `${value} not found`,
        [{ type: 'shake', metadata: { targetType: 'tree' } }]
      );
      return [notFoundState];
    }
    
    const currentStates: BinaryTree[] = [];
    
    // Step 1: Compare with current node (set to active)
    const compareNode = updateBinaryTreeNode(current, {
      state: 'active'
    });
    
    const compareTree = updateTreeAtPath(tree.root!, path, compareNode);
    currentStates.push(createBinaryTree(
      compareTree,
      `Comparing ${value} with ${current.value}`,
      undefined // No animation hint needed - node state handles the color
    ));
    
    if (value === current.value) {
      // Found!
      const foundNode = updateBinaryTreeNode(compareNode, {
        state: 'visited'
      });
      
      const foundTree = updateTreeAtPath(tree.root!, path, foundNode);
      currentStates.push(createBinaryTree(
        foundTree,
        `Found ${value}!`,
        [{ type: 'found', metadata: { targetType: 'node', targetValue: value } }]
      ));
      
      return currentStates;
    } else if (value < current.value) {
      // Go left - mark current as visited
      const visitedNode = updateBinaryTreeNode(compareNode, {
        state: 'visited'
      });
      
      const visitedTree = updateTreeAtPath(tree.root!, path, visitedNode);
      
      // Only add traverse-down animation if there's actually a child to traverse to
      const animationHints = current.left ? [{ 
        type: 'traverse-down', 
        metadata: { 
          sourceValue: current.value, 
          targetValue: current.left.value
        } 
      }] : undefined;
      
      currentStates.push(createBinaryTree(
        visitedTree,
        `${value} < ${current.value}, going left`,
        animationHints
      ));
      
      // Recursively search left subtree
      const childResults = searchNode(current.left, [...path, 'left']);
      
      // Return combined states
      return [...currentStates, ...childResults];
    } else {
      // Go right - mark current as visited
      const visitedNode = updateBinaryTreeNode(compareNode, {
        state: 'visited'
      });
      
      const visitedTree = updateTreeAtPath(tree.root!, path, visitedNode);
      
      // Only add traverse-down animation if there's actually a child to traverse to
      const animationHints = current.right ? [{ 
        type: 'traverse-down', 
        metadata: { 
          sourceValue: current.value, 
          targetValue: current.right.value
        } 
      }] : undefined;
      
      currentStates.push(createBinaryTree(
        visitedTree,
        `${value} > ${current.value}, going right`,
        animationHints
      ));
      
      // Recursively search right subtree
      const childResults = searchNode(current.right, [...path, 'right']);
      
      // Return combined states
      return [...currentStates, ...childResults];
    }
  };
  
  const searchResult = searchNode(tree.root, []);
  
  // Add final cleanup state - reset all nodes to default
  if (searchResult.length > 0) {
    const lastState = searchResult[searchResult.length - 1];
    if (lastState && lastState.root) {
      const cleanRoot = resetAllNodesToDefault(lastState.root);
      searchResult.push(createBinaryTree(
        cleanRoot,
        `Search complete - tree ready`,
        undefined
      ));
    }
  }
  
  return searchResult;
}

/**
 * Helper function to mark all nodes in a path as visited
 */
function markPathAsVisited(root: BinaryTreeNode, pathToMark: string[]): BinaryTreeNode {
  if (pathToMark.length === 0) {
    return updateBinaryTreeNode(root, { state: 'visited' });
  }
  
  const [direction, ...restPath] = pathToMark;
  
  if (direction === 'left' && root.left) {
    return updateBinaryTreeNode(root, {
      state: 'visited',
      left: markPathAsVisited(root.left, restPath)
    });
  } else if (direction === 'right' && root.right) {
    return updateBinaryTreeNode(root, {
      state: 'visited',
      right: markPathAsVisited(root.right, restPath)
    });
  }
  
  return updateBinaryTreeNode(root, { state: 'visited' });
}

/**
 * Helper function to get a node at a specific path in the tree
 */
/**
 * Helper function to reset all nodes in a tree to default state
 */
function resetAllNodesToDefault(node: BinaryTreeNode | null): BinaryTreeNode | null {
  if (!node) return null;
  
  return updateBinaryTreeNode(node, {
    state: 'default',
    left: resetAllNodesToDefault(node.left),
    right: resetAllNodesToDefault(node.right)
  });
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
