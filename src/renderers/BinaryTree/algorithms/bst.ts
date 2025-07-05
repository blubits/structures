import type { BinaryTreeNode, BinaryTree, NormalizedBinaryTree } from '../types';
import { updateBinaryTreeNode, normalizeBinaryTree } from '../types';

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
 * - Uses plain object specifications for easy tree creation
 */

/**
 * Create a NormalizedBinaryTree from a plain object specification
 */
function createBinaryTreeFromSpec(spec: BinaryTree): NormalizedBinaryTree {
  return normalizeBinaryTree(spec);
}

/**
 * Helper function to create a binary tree node spec
 */
function createNodeSpec(
  value: number,
  left: any = null,
  right: any = null,
  state: 'default' | 'active' | 'visited' = 'default'
): any {
  return {
    value,
    left,
    right,
    state
  };
}

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
export function generateBSTInsertStates(tree: NormalizedBinaryTree, value: number): NormalizedBinaryTree[] {
  const states: NormalizedBinaryTree[] = [];
  
  // If tree is empty, create root node
  if (!tree.root) {
    const newRootSpec = createNodeSpec(value, null, null, 'active');
    
    states.push(createBinaryTreeFromSpec({
      root: newRootSpec,
      name: `Inserting ${value} as root`,
      animationHints: [{ type: 'appear', metadata: { targetType: 'node', targetValue: value } }]
    }));
    
    // Final state with node in default state
    const finalRootSpec = createNodeSpec(value, null, null, 'default');
    
    states.push(createBinaryTreeFromSpec({
      root: finalRootSpec,
      name: `Inserted ${value} as root`,
    }));
    
    return states;
  }
  
  // Helper function to traverse and insert
  const insertNode = (
    current: BinaryTreeNode,
    path: string[]
  ): { newTree: BinaryTreeNode; states: NormalizedBinaryTree[] } => {
    const stepStates: NormalizedBinaryTree[] = [];
    
    // Step 1: Compare with current node (set to active)
    const compareNode = updateBinaryTreeNode(current, {
      state: 'active'
    });
    
    const compareTree = updateTreeAtPath(tree.root!, path, compareNode);
    stepStates.push(createBinaryTreeFromSpec({
      root: compareTree,
      name: `Comparing ${value} with ${current.value}`,
    }));
    
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
      
      stepStates.push(createBinaryTreeFromSpec({
        root: leftTraverseTree,
        name: `${value} < ${current.value}, going left`,
        animationHints
      }));
      
      if (current.left === null) {
        // Insert here
        const newNodeSpec = createNodeSpec(value, null, null, 'active');
        
        const insertedNode = updateBinaryTreeNode(leftTraverseNode, {
          left: normalizeBinaryTree({ root: newNodeSpec }).root,
          state: 'visited' // Keep parent as visited
        });
        
        const insertedTree = updateTreeAtPath(tree.root!, path, insertedNode);
        stepStates.push(createBinaryTreeFromSpec({
          root: insertedTree,
          name: `Inserting ${value} as left child of ${current.value}`,
          animationHints: [{ type: 'appear', metadata: { targetType: 'node', targetValue: value } }]
        }));
        
        // Mark new node as visited for completion
        const completedNode = updateBinaryTreeNode(insertedNode, {
          left: updateBinaryTreeNode(insertedNode.left!, { state: 'visited' })
        });
        
        const completedTree = updateTreeAtPath(tree.root!, path, completedNode);
        stepStates.push(createBinaryTreeFromSpec({
          root: completedTree,
          name: `Inserted ${value}`,
        }));
        
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
        
        const updatedTraverseStep = createBinaryTreeFromSpec({
          root: updateTreeAtPath(tree.root!, path, visitedNode),
          name: `${value} < ${current.value}, going left`,
          animationHints: updatedAnimationHints
        });
        
        // Merge states and ensure ALL nodes in the current path remain visited
        const baseStates = [...stepStates.slice(0, -1), updatedTraverseStep];
        
        // For each state from the recursive call, ensure the current path remains visited
        const enhancedChildStates = result.states.map(childState => {
          if (childState.root) {
            // Mark the entire path from root to current node as visited
            const rootWithVisitedPath = markPathAsVisited(childState.root, path);
            return createBinaryTreeFromSpec({
              root: rootWithVisitedPath,
              name: childState.name,
              animationHints: childState.animationHints
            });
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
      
      stepStates.push(createBinaryTreeFromSpec({
        root: rightTraverseTree,
        name: `${value} > ${current.value}, going right`,
        animationHints
      }));
      
      if (current.right === null) {
        // Insert here
        const newNodeSpec = createNodeSpec(value, null, null, 'active');
        
        const insertedNode = updateBinaryTreeNode(rightTraverseNode, {
          right: normalizeBinaryTree({ root: newNodeSpec }).root,
          state: 'visited' // Keep parent as visited
        });
        
        const insertedTree = updateTreeAtPath(tree.root!, path, insertedNode);
        stepStates.push(createBinaryTreeFromSpec({
          root: insertedTree,
          name: `Inserting ${value} as right child of ${current.value}`,
          animationHints: [{ type: 'appear', metadata: { targetType: 'node', targetValue: value } }]
        }));
        
        // Mark new node as visited for completion
        const completedNode = updateBinaryTreeNode(insertedNode, {
          right: updateBinaryTreeNode(insertedNode.right!, { state: 'visited' })
        });
        
        const completedTree = updateTreeAtPath(tree.root!, path, completedNode);
        stepStates.push(createBinaryTreeFromSpec({
          root: completedTree,
          name: `Inserted ${value}`,
        }));
        
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
        
        const updatedTraverseStep = createBinaryTreeFromSpec({
          root: updateTreeAtPath(tree.root!, path, visitedNode),
          name: `${value} > ${current.value}, going right`,
          animationHints: updatedAnimationHints
        });
        
        // Merge states and ensure ALL nodes in the current path remain visited
        const baseStates = [...stepStates.slice(0, -1), updatedTraverseStep];
        
        // For each state from the recursive call, ensure the current path remains visited
        const enhancedChildStates = result.states.map(childState => {
          if (childState.root) {
            // Mark the entire path from root to current node as visited
            const rootWithVisitedPath = markPathAsVisited(childState.root, path);
            return createBinaryTreeFromSpec({
              root: rootWithVisitedPath,
              name: childState.name,
              animationHints: childState.animationHints
            });
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
      stepStates.push(createBinaryTreeFromSpec({
        root: existsTree,
        name: `${value} already exists, not inserting`,
        animationHints: [{ type: 'shake', metadata: { targetType: 'node', targetValue: value } }]
      }));
      
      // Reset to original state
      const resetNode = updateBinaryTreeNode(existsNode, {
        state: 'default'
      });
      
      const resetTree = updateTreeAtPath(tree.root!, path, resetNode);
      stepStates.push(createBinaryTreeFromSpec({
        root: resetTree,
        name: `No changes made`,
      }));
      
      return { newTree: resetTree, states: stepStates };
    }
  };
  
  const result = insertNode(tree.root, []);
  
  // Add final cleanup state - reset all nodes to default
  const finalCleanupStates = [...result.states];
  const lastState = finalCleanupStates[finalCleanupStates.length - 1];
  if (lastState && lastState.root) {
    const cleanRoot = resetAllNodesToDefault(lastState.root);
    finalCleanupStates.push(createBinaryTreeFromSpec({
      root: cleanRoot,
      name: `Insert complete - tree ready`,
    }));
  }
  
  return finalCleanupStates;
}

/**
 * BST Search Algorithm
 * 
 * Generates a sequence of tree states showing the step-by-step process
 * of searching for a value in a Binary Search Tree.
 */
export function generateBSTSearchStates(tree: NormalizedBinaryTree, value: number): NormalizedBinaryTree[] {
  if (!tree.root) {
    const emptyState = createBinaryTreeFromSpec({
      root: null,
      name: `Tree is empty, ${value} not found`,
      animationHints: [{ type: 'shake', metadata: { targetType: 'tree' } }]
    });
    return [emptyState];
  }
  
  const searchNode = (current: BinaryTreeNode | null, path: string[]): NormalizedBinaryTree[] => {
    if (!current) {
      // Value not found
      const notFoundState = createBinaryTreeFromSpec({
        root: tree.root,
        name: `${value} not found`,
        animationHints: [{ type: 'shake', metadata: { targetType: 'tree' } }]
      });
      return [notFoundState];
    }
    
    const currentStates: NormalizedBinaryTree[] = [];
    
    // Step 1: Compare with current node (set to active)
    const compareNode = updateBinaryTreeNode(current, {
      state: 'active'
    });
    
    const compareTree = updateTreeAtPath(tree.root!, path, compareNode);
    currentStates.push(createBinaryTreeFromSpec({
      root: compareTree,
      name: `Comparing ${value} with ${current.value}`,
    }));
    
    if (value === current.value) {
      // Found!
      const foundNode = updateBinaryTreeNode(compareNode, {
        state: 'visited'
      });
      
      const foundTree = updateTreeAtPath(tree.root!, path, foundNode);
      currentStates.push(createBinaryTreeFromSpec({
        root: foundTree,
        name: `Found ${value}!`,
        animationHints: [{ type: 'found', metadata: { targetType: 'node', targetValue: value } }]
      }));
      
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
      
      currentStates.push(createBinaryTreeFromSpec({
        root: visitedTree,
        name: `${value} < ${current.value}, going left`,
        animationHints
      }));
      
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
      
      currentStates.push(createBinaryTreeFromSpec({
        root: visitedTree,
        name: `${value} > ${current.value}, going right`,
        animationHints
      }));
      
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
      // lastState.root is already a BinaryTreeNode from NormalizedBinaryTree
      const cleanRoot = resetAllNodesToDefault(lastState.root);
      searchResult.push(createBinaryTreeFromSpec({
        root: cleanRoot,
        name: `Search complete - tree ready`,
      }));
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
