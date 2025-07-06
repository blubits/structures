import type { BinaryTreeNode, BinaryTree } from '@/renderers/BinaryTree/types';
import type { AnimationHint } from '@/lib/core/types';
import { updateBinaryTreeNode, normalizeBinaryTree } from '@/renderers/BinaryTree/types';
import { traverseDown } from '@/renderers/BinaryTree/components/animations';

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
 * Smart Binary Tree State Builder
 * 
 * This class tracks the current path through the tree automatically and provides
 * high-level operations for BST algorithms. It handles all the complexity of
 * path management, tree manipulation, and state creation.
 */
class BinaryTreeStateBuilder {
  private currentTree: BinaryTree;
  private states: BinaryTree[] = [];
  private currentPath: string[] = [];

  constructor(initialTree: BinaryTree) {
    this.currentTree = normalizeBinaryTree(initialTree);
  }

  /**
   * Compare with the current node - sets it to active state and marks previous active node as visited
   */
  compareWith(value: number): this {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;

    // First, mark any previously active nodes as visited
    if (this.currentTree.root) {
      const treeWithVisitedActive = this.markActiveNodesAsVisited(this.currentTree.root);
      this.currentTree = { ...this.currentTree, root: treeWithVisitedActive };
    }

    // Then set the current node to active
    const updatedNode = updateBinaryTreeNode(currentNode, { state: 'active' });
    this.currentTree = this.updateTreeAtCurrentPath(updatedNode);
    
    this.states.push({ ...this.currentTree, name: `Comparing ${value} with ${currentNode.value}` });

    return this;
  }

  /**
   * Traverse to the left child
   */
  traverseLeft(): this {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;

    // Only add traverse state with animation if child exists
    if (currentNode.left) {
      const animationHints: AnimationHint[] = [
        traverseDown.create({ sourceValue: currentNode.value, targetValue: currentNode.left.value })
      ];

      this.states.push({
        ...this.currentTree,
        name: `Going left`,
        animationHints,
      });
    }

    // Update path to point to left child
    this.currentPath.push('left');
    
    return this;
  }

  /**
   * Traverse to the right child
   */
  traverseRight(): this {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;

    // Only add traverse state with animation if child exists
    if (currentNode.right) {
      const animationHints: AnimationHint[] = [
        traverseDown.create({ sourceValue: currentNode.value, targetValue: currentNode.right.value })
      ];

      this.states.push({
        ...this.currentTree,
        name: `Going right`,
        animationHints,
      });
    }

    // Update path to point to right child
    this.currentPath.push('right');
    
    return this;
  }

  /**
   * Insert a new node at the current path
   */
  insertHere(value: number): this {
    const newNodeSpec: BinaryTreeNode = {
      value,
      left: null,
      right: null,
      state: 'active'
    };

    if (this.currentPath.length === 0) {
      // Inserting at root
      this.currentTree = {
        root: newNodeSpec,
        name: `Inserting ${value} as root`,
      };
    } else {
      // Inserting at a specific path - we need to update the parent to point to the new node
      const parentPath = this.currentPath.slice(0, -1);
      const direction = this.currentPath[this.currentPath.length - 1] as 'left' | 'right';
      
      const parentNode = this.getNodeAtPath(parentPath);
      if (parentNode) {
        // Create the new node
        const newNode = normalizeBinaryTree({ root: newNodeSpec }).root!;
        
        // Update the parent to point to the new node
        const updatedParent = updateBinaryTreeNode(parentNode, {
          [direction]: newNode
        });
        
        // Update the tree with the new parent
        this.currentTree = this.updateTreeAtPath(parentPath, updatedParent);
        
        const currentNodeValue = parentNode.value;
        const side = direction === 'left' ? 'left' : 'right';
        
        this.states.push({
          ...this.currentTree,
          name: `Inserting ${value} as ${side} child of ${currentNodeValue}`,
        });
      }
    }

    return this;
  }

  /**
   * Insert a new node as the left child of the current node
   */
  insertLeftChild(value: number): this {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;

    const newNodeSpec: BinaryTreeNode = {
      value,
      left: null,
      right: null,
      state: 'default' // Changed from 'active' to 'default'
    };

    // Create the new node
    const newNode = normalizeBinaryTree({ root: newNodeSpec }).root!;
    
    // Update the current node to have the new left child
    const updatedCurrentNode = updateBinaryTreeNode(currentNode, {
      left: newNode
    });
    
    // Update the tree with the modified current node
    this.currentTree = this.updateTreeAtCurrentPath(updatedCurrentNode);
    
    this.states.push({
      ...this.currentTree,
      name: `Inserting ${value} as left child of ${currentNode.value}`,
    });

    return this;
  }

  /**
   * Insert a new node as the right child of the current node
   */
  insertRightChild(value: number): this {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;

    const newNodeSpec: BinaryTreeNode = {
      value,
      left: null,
      right: null,
      state: 'default' // Changed from 'active' to 'default'
    };

    // Create the new node
    const newNode = normalizeBinaryTree({ root: newNodeSpec }).root!;
    
    // Update the current node to have the new right child
    const updatedCurrentNode = updateBinaryTreeNode(currentNode, {
      right: newNode
    });
    
    // Update the tree with the modified current node
    this.currentTree = this.updateTreeAtCurrentPath(updatedCurrentNode);
    
    this.states.push({
      ...this.currentTree,
      name: `Inserting ${value} as right child of ${currentNode.value}`,
    });

    return this;
  }

  /**
   * Mark the current node as visited
   */
  markVisited(): this {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;

    const updatedNode = updateBinaryTreeNode(currentNode, { state: 'visited' });
    this.currentTree = this.updateTreeAtCurrentPath(updatedNode);
    
    return this;
  }

  /**
   * Reset all nodes to default state
   */
  resetAll(): this {
    if (this.currentTree.root) {
      const resetRoot = this.resetAllNodesToDefault(this.currentTree.root);
      this.currentTree = {
        root: resetRoot,
      };
    }
    
    return this;
  }

  /**
   * Set the name of the current tree state and add it to states
   */
  setName(name: string): this {
    this.states.push({
      ...this.currentTree,
      name,
    });
    
    return this;
  }

  /**
   * Get the current node based on the current path
   */
  getCurrentNode(): BinaryTreeNode | null {
    return this.getNodeAtPath(this.currentPath);
  }

  /**
   * Check if the current node has a left child
   */
  hasLeftChild(): boolean {
    const currentNode = this.getCurrentNode();
    return currentNode?.left !== null && currentNode?.left !== undefined;
  }

  /**
   * Check if the current node has a right child
   */
  hasRightChild(): boolean {
    const currentNode = this.getCurrentNode();
    return currentNode?.right !== null && currentNode?.right !== undefined;
  }

  /**
   * Check if a node exists at the current path
   */
  nodeExists(): boolean {
    return this.getCurrentNode() !== null;
  }

  /**
   * Get all generated states
   */
  getStates(): BinaryTree[] {
    return this.states;
  }

  // Private helper methods

  private getNodeAtPath(path: string[]): BinaryTreeNode | null {
    let currentNode = this.currentTree.root;
    
    for (const direction of path) {
      if (!currentNode) return null;
      currentNode = direction === 'left' ? currentNode.left : currentNode.right;
    }
    
    return currentNode;
  }

  private updateTreeAtCurrentPath(updatedNode: BinaryTreeNode): BinaryTree {
    return this.updateTreeAtPath(this.currentPath, updatedNode);
  }

  private updateTreeAtPath(path: string[], updatedNode: BinaryTreeNode): BinaryTree {
    if (!this.currentTree.root) {
      return { root: updatedNode };
    }

    const newRoot = this.updateTreeAtPathRecursive(this.currentTree.root, path, updatedNode);
    return { root: newRoot };
  }

  private updateTreeAtPathRecursive(
    root: BinaryTreeNode,
    path: string[],
    updatedNode: BinaryTreeNode
  ): BinaryTreeNode {
    if (path.length === 0) {
      return updatedNode;
    }

    const [direction, ...restPath] = path;

    if (direction === 'left') {
      return updateBinaryTreeNode(root, {
        left: root.left ? this.updateTreeAtPathRecursive(root.left, restPath, updatedNode) : null
      });
    } else if (direction === 'right') {
      return updateBinaryTreeNode(root, {
        right: root.right ? this.updateTreeAtPathRecursive(root.right, restPath, updatedNode) : null
      });
    }

    return root;
  }

  private resetAllNodesToDefault(node: BinaryTreeNode | null): BinaryTreeNode | null {
    if (!node) return null;

    return updateBinaryTreeNode(node, {
      state: 'default',
      left: this.resetAllNodesToDefault(node.left),
      right: this.resetAllNodesToDefault(node.right)
    });
  }

  private markActiveNodesAsVisited(node: BinaryTreeNode | null): BinaryTreeNode | null {
    if (!node) return null;

    const updatedNode = updateBinaryTreeNode(node, {
      state: node.state === 'active' ? 'visited' : node.state,
      left: this.markActiveNodesAsVisited(node.left),
      right: this.markActiveNodesAsVisited(node.right)
    });

    return updatedNode;
  }
}

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

