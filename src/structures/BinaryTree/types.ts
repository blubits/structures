import type { DataStructureState, DataStructureElement, ValidationResult } from '@/types/data-structure';
import type { AnimationHint } from '@/types/animations';
import { traverseDown } from './animations';

/**
 * Represents a node in a binary tree.
 * - Inherits id and metadata from DataStructureElement.
 * - `id` and `state` are optional for user input, but always present after normalization.
 * - This is a class that provides immutable node operations.
 */
export class BinaryTreeNode implements Omit<DataStructureElement, 'clone'> {
  readonly value: number;
  readonly left: BinaryTreeNode | null;
  readonly right: BinaryTreeNode | null;
  readonly state: 'default' | 'active' | 'visited';
  readonly id: string;
  readonly metadata?: Record<string, any>;

  constructor(data: {
    value: number;
    left?: BinaryTreeNode | null;
    right?: BinaryTreeNode | null;
    state?: 'default' | 'active' | 'visited';
    id?: string;
    metadata?: Record<string, any>;
  }) {
    this.value = data.value;
    this.left = data.left || null;
    this.right = data.right || null;
    this.state = data.state || 'default';
    this.id = data.id || this.generateId();
    this.metadata = data.metadata ? { ...data.metadata } : undefined;
    
    // Freeze for immutability
    Object.freeze(this);
  }

  private generateId(): string {
    return `node-${this.value}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  clone(updates?: Partial<BinaryTreeNode>): BinaryTreeNode {
    return new BinaryTreeNode({
      value: updates?.value ?? this.value,
      left: updates?.left ?? this.left,
      right: updates?.right ?? this.right,
      state: updates?.state ?? this.state,
      id: updates?.id ?? this.id,
      metadata: updates?.metadata ?? (this.metadata ? { ...this.metadata } : undefined),
    });
  }
}

/**
 * Binary Tree class implementing the enhanced DataStructureState interface.
 * Provides immutable, method-based state transitions with automatic normalization.
 */
export class BinaryTree implements DataStructureState {
  readonly root: BinaryTreeNode | null;
  readonly animationHints?: AnimationHint[];
  readonly name?: string;
  readonly _metadata?: Record<string, any>;
  
  // Private state for traversal operations
  private readonly currentPath: string[] = [];

  constructor(data: {
    root?: BinaryTreeNode | null;
    animationHints?: AnimationHint[];
    name?: string;
    _metadata?: Record<string, any>;
    currentPath?: string[];
  }) {
    // Normalize the tree during construction
    const normalized = this.normalizeTree(data.root || null);
    this.root = normalized;
    this.animationHints = data.animationHints ? [...data.animationHints] : undefined;
    this.name = data.name;
    this._metadata = data._metadata ? { ...data._metadata } : undefined;
    this.currentPath = data.currentPath ? [...data.currentPath] : [];
    
    // Freeze for immutability
    Object.freeze(this);
    Object.freeze(this.currentPath);
  }

  // Static factory method for DataStructureClass interface
  static from(json: Record<string, any>): BinaryTree {
    const root = json.root ? BinaryTree.nodeFromJSON(json.root) : null;
    return new BinaryTree({
      root,
      animationHints: json.animationHints,
      name: json.name,
      _metadata: json._metadata,
      currentPath: json.currentPath,
    });
  }

  private static nodeFromJSON(nodeData: any): BinaryTreeNode {
    return new BinaryTreeNode({
      value: nodeData.value,
      left: nodeData.left ? BinaryTree.nodeFromJSON(nodeData.left) : null,
      right: nodeData.right ? BinaryTree.nodeFromJSON(nodeData.right) : null,
      state: nodeData.state,
      id: nodeData.id,
      metadata: nodeData.metadata,
    });
  }

  // Abstract base class method implementations

  toJSON(): Record<string, any> {
    return {
      root: this.root ? this.nodeToJSON(this.root) : null,
      animationHints: this.animationHints,
      name: this.name,
      _metadata: this._metadata,
      currentPath: this.currentPath,
    };
  }

  private nodeToJSON(node: BinaryTreeNode): any {
    return {
      value: node.value,
      left: node.left ? this.nodeToJSON(node.left) : null,
      right: node.right ? this.nodeToJSON(node.right) : null,
      state: node.state,
      id: node.id,
      metadata: node.metadata,
    };
  }

  reconcile(prevState: DataStructureState | null): BinaryTree {
    if (!prevState || !(prevState instanceof BinaryTree)) {
      return this;
    }
    
    const reconciledRoot = this.reconcileNodes(prevState.root, this.root);
    return new BinaryTree({
      root: reconciledRoot,
      animationHints: this.animationHints,
      name: this.name,
      _metadata: this._metadata,
      currentPath: this.currentPath,
    });
  }

  private reconcileNodes(
    prevNode: BinaryTreeNode | null,
    newNode: BinaryTreeNode | null
  ): BinaryTreeNode | null {
    if (!prevNode && !newNode) return null;
    if (!prevNode || !newNode) return newNode;
    
    if (prevNode.value === newNode.value) {
      return newNode.clone({
        id: prevNode.id, // Preserve existing ID for reconciliation
        left: this.reconcileNodes(prevNode.left, newNode.left),
        right: this.reconcileNodes(prevNode.right, newNode.right),
      });
    }
    
    return newNode.clone({
      left: this.reconcileNodes(null, newNode.left),
      right: this.reconcileNodes(null, newNode.right),
    });
  }

  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (this.root) {
      this.validateNode(this.root, errors, warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateNode(node: BinaryTreeNode, errors: string[], warnings: string[]): void {
    if (!node.id) {
      errors.push(`Node with value ${node.value} is missing an ID`);
    }
    
    if (!node.state) {
      warnings.push(`Node with value ${node.value} has no state specified`);
    }

    if (node.left) {
      this.validateNode(node.left, errors, warnings);
    }
    
    if (node.right) {
      this.validateNode(node.right, errors, warnings);
    }
  }

  // Binary Tree specific methods (from BinaryTreeStateBuilder)

  /**
   * Starts a traversal operation by resetting current path.
   */
  startTraversal(): BinaryTree {
    return new BinaryTree({
      root: this.root,
      animationHints: this.animationHints,
      name: this.name,
      _metadata: this._metadata,
      currentPath: [], // Reset path
    });
  }

  /**
   * Traverses to the left child of the current node.
   */
  traverseLeft(): BinaryTree {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;
    
    const animationHints: AnimationHint[] = [];
    if (currentNode.left) {
      animationHints.push(
        traverseDown.create({ 
          sourceValue: currentNode.value, 
          targetValue: currentNode.left.value 
        })
      );
    }
    
    return new BinaryTree({
      root: this.root,
      animationHints,
      name: `Going left`,
      _metadata: this._metadata,
      currentPath: [...this.currentPath, 'left'],
    });
  }

  /**
   * Traverses to the right child of the current node.
   */
  traverseRight(): BinaryTree {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;
    
    const animationHints: AnimationHint[] = [];
    if (currentNode.right) {
      animationHints.push(
        traverseDown.create({ 
          sourceValue: currentNode.value, 
          targetValue: currentNode.right.value 
        })
      );
    }
    
    return new BinaryTree({
      root: this.root,
      animationHints,
      name: `Going right`,
      _metadata: this._metadata,
      currentPath: [...this.currentPath, 'right'],
    });
  }

  /**
   * Inserts a node at the current path position.
   */
  insertHere(value: number): BinaryTree {
    const newNode = new BinaryTreeNode({
      value,
      left: null,
      right: null,
      state: 'active',
    });

    if (this.currentPath.length === 0) {
      // Insert as root
      return new BinaryTree({
        root: newNode,
        name: `Inserting ${value} as root`,
        _metadata: this._metadata,
        currentPath: this.currentPath,
      });
    } else {
      // Insert as child
      const parentPath = this.currentPath.slice(0, -1);
      const direction = this.currentPath[this.currentPath.length - 1] as 'left' | 'right';
      const parentNode = this.getNodeAtPath(parentPath);
      
      if (parentNode) {
        const updatedParent = parentNode.clone({
          [direction]: newNode
        });
        const newRoot = this.updateTreeAtPath(parentPath, updatedParent);
        const side = direction === 'left' ? 'left' : 'right';
        
        return new BinaryTree({
          root: newRoot,
          name: `Inserting ${value} as ${side} child of ${parentNode.value}`,
          _metadata: this._metadata,
          currentPath: this.currentPath,
        });
      }
    }
    
    return this;
  }

  /**
   * Inserts a left child to the current node.
   */
  insertLeftChild(value: number): BinaryTree {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;

    const newNode = new BinaryTreeNode({
      value,
      left: null,
      right: null,
      state: 'default',
    });

    const updatedCurrentNode = currentNode.clone({ left: newNode });
    const newRoot = this.updateTreeAtCurrentPath(updatedCurrentNode);

    return new BinaryTree({
      root: newRoot,
      name: `Inserting ${value} as left child of ${currentNode.value}`,
      _metadata: this._metadata,
      currentPath: this.currentPath,
    });
  }

  /**
   * Inserts a right child to the current node.
   */
  insertRightChild(value: number): BinaryTree {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;

    const newNode = new BinaryTreeNode({
      value,
      left: null,
      right: null,
      state: 'default',
    });

    const updatedCurrentNode = currentNode.clone({ right: newNode });
    const newRoot = this.updateTreeAtCurrentPath(updatedCurrentNode);

    return new BinaryTree({
      root: newRoot,
      name: `Inserting ${value} as right child of ${currentNode.value}`,
      _metadata: this._metadata,
      currentPath: this.currentPath,
    });
  }

  /**
   * Compares current node with a value and marks it as active.
   */
  compareWith(value: number): BinaryTree {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;

    // Mark previously active nodes as visited
    const rootWithVisited = this.root ? this.markActiveNodesAsVisited(this.root) : null;
    
    // Mark current node as active
    const updatedNode = currentNode.clone({ state: 'active' });
    const newRoot = this.updateTreeAtCurrentPath(updatedNode, rootWithVisited);

    return new BinaryTree({
      root: newRoot,
      name: `Comparing ${value} with ${currentNode.value}`,
      _metadata: this._metadata,
      currentPath: this.currentPath,
    });
  }

  /**
   * Marks the current node as visited.
   */
  markVisited(): BinaryTree {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return this;

    const updatedNode = currentNode.clone({ state: 'visited' });
    const newRoot = this.updateTreeAtCurrentPath(updatedNode);

    return new BinaryTree({
      root: newRoot,
      name: this.name,
      _metadata: this._metadata,
      currentPath: this.currentPath,
    });
  }

  /**
   * Resets all nodes to default state.
   */
  resetAll(): BinaryTree {
    const resetRoot = this.root ? this.resetAllNodesToDefault(this.root) : null;

    return new BinaryTree({
      root: resetRoot,
      name: this.name,
      _metadata: this._metadata,
      currentPath: this.currentPath,
    });
  }

  /**
   * Sets the name/description of the current state.
   */
  setName(name: string): BinaryTree {
    return new BinaryTree({
      root: this.root,
      animationHints: this.animationHints,
      name,
      _metadata: this._metadata,
      currentPath: this.currentPath,
    });
  }

  // Utility methods

  /**
   * Gets the current node based on the current path.
   */
  getCurrentNode(): BinaryTreeNode | null {
    return this.getNodeAtPath(this.currentPath);
  }

  /**
   * Checks if the current node has a left child.
   */
  hasLeftChild(): boolean {
    const currentNode = this.getCurrentNode();
    return currentNode?.left !== null && currentNode?.left !== undefined;
  }

  /**
   * Checks if the current node has a right child.
   */
  hasRightChild(): boolean {
    const currentNode = this.getCurrentNode();
    return currentNode?.right !== null && currentNode?.right !== undefined;
  }

  /**
   * Checks if a node exists at the current path.
   */
  nodeExists(): boolean {
    return this.getCurrentNode() !== null;
  }

  // Private helper methods

  private getNodeAtPath(path: string[]): BinaryTreeNode | null {
    let currentNode = this.root;
    for (const direction of path) {
      if (!currentNode) return null;
      currentNode = direction === 'left' ? currentNode.left : currentNode.right;
    }
    return currentNode;
  }

  private updateTreeAtCurrentPath(updatedNode: BinaryTreeNode, rootOverride?: BinaryTreeNode | null): BinaryTreeNode | null {
    return this.updateTreeAtPath(this.currentPath, updatedNode, rootOverride);
  }

  private updateTreeAtPath(path: string[], updatedNode: BinaryTreeNode, rootOverride?: BinaryTreeNode | null): BinaryTreeNode | null {
    const currentRoot = rootOverride !== undefined ? rootOverride : this.root;
    
    if (!currentRoot) {
      return updatedNode;
    }
    
    return this.updateTreeAtPathRecursive(currentRoot, path, updatedNode);
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
      return root.clone({
        left: root.left ? this.updateTreeAtPathRecursive(root.left, restPath, updatedNode) : null
      });
    } else if (direction === 'right') {
      return root.clone({
        right: root.right ? this.updateTreeAtPathRecursive(root.right, restPath, updatedNode) : null
      });
    }
    return root;
  }

  private resetAllNodesToDefault(node: BinaryTreeNode | null): BinaryTreeNode | null {
    if (!node) return null;
    return node.clone({
      state: 'default',
      left: this.resetAllNodesToDefault(node.left),
      right: this.resetAllNodesToDefault(node.right)
    });
  }

  private markActiveNodesAsVisited(node: BinaryTreeNode | null): BinaryTreeNode | null {
    if (!node) return null;
    return node.clone({
      state: node.state === 'active' ? 'visited' : node.state,
      left: this.markActiveNodesAsVisited(node.left),
      right: this.markActiveNodesAsVisited(node.right)
    });
  }

  private normalizeTree(root: BinaryTreeNode | null): BinaryTreeNode | null {
    if (!root) return null;
    
    return this.normalizeNode(root, 'root');
  }

  private normalizeNode(node: BinaryTreeNode | null, path: string = 'root'): BinaryTreeNode | null {
    if (!node) return null;
    
    const stableId = this.generateStableNodeId(node.value, path, node.id);
    
    return new BinaryTreeNode({
      value: node.value,
      left: this.normalizeNode(node.left, `${path}.L`),
      right: this.normalizeNode(node.right, `${path}.R`),
      state: node.state || 'default',
      id: stableId,
      metadata: node.metadata ? { ...node.metadata } : undefined,
    });
  }

  private generateStableNodeId(
    value: number,
    path: string = 'root',
    existingId?: string
  ): string {
    if (existingId) return existingId;
    return `node-${path}-${value}`;
  }
}

/**
 * Animation contexts specific to binary trees.
 */

export interface BinaryTreeNodeAnimationContext {
  /** The DOM element representing the tree node */
  element: Element;
  
  /** Animation hint that triggered this animation */
  hint: AnimationHint;
  
  /** The tree node data */
  nodeData: BinaryTreeNode;
  
  /** The complete tree state */
  treeState: BinaryTree;
  
  /** Callback when animation completes */
  onComplete?: () => void;
}

export interface BinaryTreeLinkAnimationContext {
  /** The DOM element representing the link/edge */
  element: Element;
  
  /** Animation hint that triggered this animation */
  hint: AnimationHint;
  
  /** Source node data */
  sourceNode: BinaryTreeNode;
  
  /** Target node data */
  targetNode: BinaryTreeNode;
  
  /** The complete tree state */
  treeState: BinaryTree;
  
  /** Callback when animation completes */
  onComplete?: () => void;
}

export interface BinaryTreeVisualizationContext {
  /** The root SVG group containing the entire tree */
  container: Element;
  
  /** Animation hints for the entire tree */
  hints: readonly AnimationHint[];
  
  /** The complete tree state */
  treeState: BinaryTree;
  
  /** Callback when all animations complete */
  onComplete?: () => void;
}

/**
 * Animation function types specific to binary trees.
 */
export type BinaryTreeNodeAnimationFunction = (context: BinaryTreeNodeAnimationContext) => void;
export type BinaryTreeLinkAnimationFunction = (context: BinaryTreeLinkAnimationContext) => void;
export type BinaryTreeVisualizationFunction = (context: BinaryTreeVisualizationContext) => void;

/**
 * Configuration for binary tree visualization.
 */
export interface BinaryTreeConfig {
  /** Layout configuration */
  layout: {
    /** Horizontal spacing between nodes at the same level */
    nodeSpacing: number;
    
    /** Vertical spacing between levels */
    levelSpacing: number;
    
    /** Radius of tree nodes */
    nodeRadius: number;
    
    /** Width of links between nodes */
    linkWidth: number;
  };
  
  /** Animation configuration */
  animation: {
    /** Default duration for animations in milliseconds */
    defaultDuration: number;
    
    /** Default easing function for animations */
    easing: string;
    
    /** Whether to automatically animate operations */
    autoAnimate: boolean;
  };
  
  /** Colors for different node states */
  colors: {
    default: string;
    active: string;
    visited: string;
    link: string;
  };
  
  /** Typography settings */
  typography: {
    fontSize: number;
    fontFamily: string;
    textColor: string;
  };
}

/**
 * Default configuration for binary tree visualization.
 */
export const DEFAULT_BINARY_TREE_CONFIG: BinaryTreeConfig = {
  layout: {
    nodeSpacing: 80,
    levelSpacing: 100,
    nodeRadius: 25,
    linkWidth: 2,
  },
  animation: {
    defaultDuration: 600,
    easing: 'ease-in-out',
    autoAnimate: true,
  },
  colors: {
    default: '#e5e7eb',
    active: '#3b82f6',
    visited: '#10b981',
    link: '#6b7280',
  },
  typography: {
    fontSize: 14,
    fontFamily: 'monospace',
    textColor: '#1f2937',
  },
};

/**
 * Helper functions for working with binary tree nodes.
 * These are kept for backwards compatibility and utility purposes.
 */

/**
 * Creates a copy of a node with updated properties (immutable update).
 */
export function updateBinaryTreeNode(
  node: BinaryTreeNode,
  updates: Partial<BinaryTreeNode>
): BinaryTreeNode {
  // Since BinaryTreeNode is now a class, all nodes have the clone method
  return node.clone(updates);
}

/**
 * Creates a copy of a tree with updated properties (immutable update).
 */
export function updateBinaryTree(
  tree: BinaryTree,
  updates: {
    root?: BinaryTreeNode | null;
    animationHints?: AnimationHint[];
    name?: string;
    _metadata?: Record<string, any>;
  }
): BinaryTree {
  return new BinaryTree({
    root: updates.root ?? tree.root,
    animationHints: updates.animationHints ?? tree.animationHints,
    name: updates.name ?? tree.name,
    _metadata: updates._metadata ?? tree._metadata,
  });
}

/**
 * Counts the total number of nodes in a tree.
 */
export function countNodes(node: BinaryTreeNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

/**
 * Calculates the height of a tree.
 */
export function calculateHeight(node: BinaryTreeNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(calculateHeight(node.left), calculateHeight(node.right));
}

/**
 * Performs an in-order traversal of the tree.
 */
export function inOrderTraversal(node: BinaryTreeNode | null, visit: (node: BinaryTreeNode) => void): void {
  if (!node) return;
  inOrderTraversal(node.left, visit);
  visit(node);
  inOrderTraversal(node.right, visit);
}

/**
 * Performs a pre-order traversal of the tree.
 */
export function preOrderTraversal(node: BinaryTreeNode | null, visit: (node: BinaryTreeNode) => void): void {
  if (!node) return;
  visit(node);
  preOrderTraversal(node.left, visit);
  preOrderTraversal(node.right, visit);
}

/**
 * Performs a post-order traversal of the tree.
 */
export function postOrderTraversal(node: BinaryTreeNode | null, visit: (node: BinaryTreeNode) => void): void {
  if (!node) return;
  postOrderTraversal(node.left, visit);
  postOrderTraversal(node.right, visit);
  visit(node);
}

/**
 * Finds a node with the specified value.
 */
export function findNode(node: BinaryTreeNode | null, value: number): BinaryTreeNode | null {
  if (!node) return null;
  if (node.value === value) return node;
  
  const leftResult = findNode(node.left, value);
  if (leftResult) return leftResult;
  
  return findNode(node.right, value);
}

/**
 * Performs a shallow comparison of two objects for performance optimization.
 * Similar to React's shallow comparison for props.
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
}

/**
 * Efficiently compares two arrays by reference and length.
 * Much faster than JSON.stringify for animation hints.
 */
export function arrayEqual<T>(arr1: T[] | undefined, arr2: T[] | undefined): boolean {
  if (arr1 === arr2) return true;
  if (!arr1 || !arr2) return arr1 === arr2;
  if (arr1.length !== arr2.length) return false;
  
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  
  return true;
}

/**
 * Creates a stable hash for a tree structure for efficient comparison.
 * Similar to React's reconciliation key generation.
 */
export function createTreeHash(node: BinaryTreeNode | null): string {
  if (!node) return 'null';
  
  const leftHash = createTreeHash(node.left);
  const rightHash = createTreeHash(node.right);
  
  return `${node.id || node.value}-${node.state}-${leftHash}-${rightHash}`;
}

/**
 * Memoized tree layout calculation to avoid recalculating unchanged subtrees.
 */
const layoutCache = new Map<string, Map<string, {x: number, y: number}>>();

export function getCachedTreeLayout(
  node: BinaryTreeNode | null,
  calculateLayout: (node: BinaryTreeNode | null) => Map<string, {x: number, y: number}>
): Map<string, {x: number, y: number}> {
  const treeHash = createTreeHash(node);
  
  if (layoutCache.has(treeHash)) {
    return layoutCache.get(treeHash)!;
  }
  
  const layout = calculateLayout(node);
  layoutCache.set(treeHash, layout);
  
  // Keep cache size reasonable (LRU-like behavior)
  if (layoutCache.size > 100) {
    const firstKey = layoutCache.keys().next().value;
    if (firstKey) {
      layoutCache.delete(firstKey);
    }
  }
  
  return layout;
}
