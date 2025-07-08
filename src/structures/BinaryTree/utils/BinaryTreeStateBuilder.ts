import type { BinaryTreeNode, BinaryTree } from '@structures/BinaryTree/types';
import type { AnimationHint } from '@/lib/core/types';
import { updateBinaryTreeNode, normalizeBinaryTree } from '@structures/BinaryTree/types';
import { traverseDown } from '@/structures/BinaryTree/animations';

/**
 * Smart Binary Tree State Builder
 * 
 * This class tracks the current path through the tree automatically and provides
 * high-level operations for BST algorithms. It handles all the complexity of
 * path management, tree manipulation, and state creation.
 */
export class BinaryTreeStateBuilder {
  private currentTree: BinaryTree;
  private states: BinaryTree[] = [];
  private currentPath: string[] = [];

  constructor(initialTree: BinaryTree) {
    this.currentTree = normalizeBinaryTree(initialTree);
  }

  compareWith(value: number): this {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;
    if (this.currentTree.root) {
      const treeWithVisitedActive = this.markActiveNodesAsVisited(this.currentTree.root);
      this.currentTree = { ...this.currentTree, root: treeWithVisitedActive };
    }
    const updatedNode = updateBinaryTreeNode(currentNode, { state: 'active' });
    this.currentTree = this.updateTreeAtCurrentPath(updatedNode);
    this.states.push({ ...this.currentTree, name: `Comparing ${value} with ${currentNode.value}` });
    return this;
  }

  traverseLeft(): this {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;
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
    this.currentPath.push('left');
    return this;
  }

  traverseRight(): this {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;
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
    this.currentPath.push('right');
    return this;
  }

  insertHere(value: number): this {
    const newNodeSpec: BinaryTreeNode = {
      value,
      left: null,
      right: null,
      state: 'active'
    };
    if (this.currentPath.length === 0) {
      this.currentTree = {
        root: newNodeSpec,
        name: `Inserting ${value} as root`,
      };
    } else {
      const parentPath = this.currentPath.slice(0, -1);
      const direction = this.currentPath[this.currentPath.length - 1] as 'left' | 'right';
      const parentNode = this.getNodeAtPath(parentPath);
      if (parentNode) {
        const newNode = normalizeBinaryTree({ root: newNodeSpec }).root!;
        const updatedParent = updateBinaryTreeNode(parentNode, {
          [direction]: newNode
        });
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

  insertLeftChild(value: number): this {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;
    const newNodeSpec: BinaryTreeNode = {
      value,
      left: null,
      right: null,
      state: 'default'
    };
    const newNode = normalizeBinaryTree({ root: newNodeSpec }).root!;
    const updatedCurrentNode = updateBinaryTreeNode(currentNode, {
      left: newNode
    });
    this.currentTree = this.updateTreeAtCurrentPath(updatedCurrentNode);
    this.states.push({
      ...this.currentTree,
      name: `Inserting ${value} as left child of ${currentNode.value}`,
    });
    return this;
  }

  insertRightChild(value: number): this {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;
    const newNodeSpec: BinaryTreeNode = {
      value,
      left: null,
      right: null,
      state: 'default'
    };
    const newNode = normalizeBinaryTree({ root: newNodeSpec }).root!;
    const updatedCurrentNode = updateBinaryTreeNode(currentNode, {
      right: newNode
    });
    this.currentTree = this.updateTreeAtCurrentPath(updatedCurrentNode);
    this.states.push({
      ...this.currentTree,
      name: `Inserting ${value} as right child of ${currentNode.value}`,
    });
    return this;
  }

  markVisited(): this {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;
    const updatedNode = updateBinaryTreeNode(currentNode, { state: 'visited' });
    this.currentTree = this.updateTreeAtCurrentPath(updatedNode);
    return this;
  }

  resetAll(): this {
    if (this.currentTree.root) {
      const resetRoot = this.resetAllNodesToDefault(this.currentTree.root);
      this.currentTree = {
        root: resetRoot,
      };
    }
    return this;
  }

  setName(name: string): this {
    this.states.push({
      ...this.currentTree,
      name,
    });
    return this;
  }

  getCurrentNode(): BinaryTreeNode | null {
    return this.getNodeAtPath(this.currentPath);
  }

  hasLeftChild(): boolean {
    const currentNode = this.getCurrentNode();
    return currentNode?.left !== null && currentNode?.left !== undefined;
  }

  hasRightChild(): boolean {
    const currentNode = this.getCurrentNode();
    return currentNode?.right !== null && currentNode?.right !== undefined;
  }

  nodeExists(): boolean {
    return this.getCurrentNode() !== null;
  }

  getStates(): BinaryTree[] {
    return this.states;
  }

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
