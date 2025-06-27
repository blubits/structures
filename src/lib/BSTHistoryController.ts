/**
 * BST-specific History Controller
 * 
 * Extends the generic HistoryController with Binary Search Tree specific functionality.
 * This controller provides high-level methods for common BST operations while
 * maintaining full history and step-by-step visualization capabilities.
 * 
 * @example
 * ```typescript
 * const initialTree = { value: 8, left: { value: 3 }, right: { value: 10 } };
 * const bstController = new BSTHistoryController(initialTree);
 * 
 * // Perform operations
 * await bstController.insert(5);
 * await bstController.search(3);
 * await bstController.findMin();
 * 
 * // Access history and visualization
 * const operations = bstController.getState().operations;
 * bstController.selectAndVisualize(0); // Replay first operation
 * ```
 */

import { HistoryController } from './HistoryController';
import type { 
  VisualizationStep, 
  AnimationInstruction, 
  AnimationInstructions 
} from './HistoryController';
import { 
  generateBSTInsertSteps, 
  generateBSTSearchSteps, 
  generateBSTFindMinSteps, 
  generateBSTFindMaxSteps,
  generateLeftRotationSteps,
  generateRightRotationSteps
} from './algorithms';

/**
 * Represents a node in a Binary Search Tree
 * 
 * @interface BinaryTreeNode
 * @property {number} value - The numeric value stored in the node
 * @property {BinaryTreeNode} [left] - Optional left child node (values < current value)
 * @property {BinaryTreeNode} [right] - Optional right child node (values > current value)
 */
export interface BinaryTreeNode {
  value: number;
  left?: BinaryTreeNode;
  right?: BinaryTreeNode;
}

/**
 * BST-specific visualization step extending the base VisualizationStep
 * 
 * @interface BSTStep
 * @extends VisualizationStep<BinaryTreeNode>
 * @property {'insert' | 'search' | 'findMin' | 'findMax' | 'leftRotation' | 'rightRotation'} operation - The type of BST operation
 * @property {number} [nodeValue] - The value of the node being operated on (if applicable)
 */
export interface BSTStep extends VisualizationStep<BinaryTreeNode> {
  operation: 'insert' | 'search' | 'findMin' | 'findMax' | 'leftRotation' | 'rightRotation';
  nodeValue?: number;
  // Add BST-specific step data here
}

/**
 * Type union for all supported BST operations
 */
export type BSTOperation = 'insert' | 'search' | 'findMin' | 'findMax' | 'leftRotation' | 'rightRotation';

/**
 * Helper function to insert a value into BST while maintaining BST properties
 * 
 * This function creates a new tree structure with the inserted value, following
 * BST insertion rules: values less than current go left, greater go right.
 * Duplicate values are ignored to maintain set semantics.
 * 
 * @param root - The root of the current BST (undefined for empty tree)
 * @param value - The value to insert
 * @returns The root of the BST with the new value inserted
 * 
 * @example
 * ```typescript
 * const tree = { value: 5, left: { value: 3 }, right: { value: 7 } };
 * const newTree = insertIntoBST(tree, 6);
 * // Result: 6 is inserted as left child of 7
 * ```
 */
function insertIntoBST(root: BinaryTreeNode | undefined, value: number): BinaryTreeNode {
  if (!root) {
    return { value };
  }
  
  if (value < root.value) {
    root.left = insertIntoBST(root.left, value);
  } else if (value > root.value) {
    root.right = insertIntoBST(root.right, value);
  }
  // If value equals root.value, don't insert (no duplicates)
  
  return root;
}

/**
 * Helper function to perform actual left rotation on a tree
 * 
 * This function performs the structural changes for a left rotation, returning
 * a new tree with the rotation applied. It's used by the leftRotation method
 * to modify the tree state after visualization.
 * 
 * @param root - The root of the tree containing the pivot
 * @param pivotValue - The value of the pivot node to rotate around
 * @returns The root of the tree after rotation (may be different if rotating root)
 */
function performLeftRotation(root: BinaryTreeNode, pivotValue: number): BinaryTreeNode {
  if (!root) return root;

  // Helper function to clone a tree deeply
  const cloneTree = (node: BinaryTreeNode | undefined): BinaryTreeNode | undefined => {
    if (!node) return undefined;
    return {
      value: node.value,
      left: cloneTree(node.left),
      right: cloneTree(node.right),
    };
  };

  // Create a deep clone to avoid mutating the original
  const newTree = cloneTree(root)!;

  // Find the pivot and perform rotation
  const rotateAt = (current: BinaryTreeNode, parent?: BinaryTreeNode, isLeftChild?: boolean): BinaryTreeNode => {
    if (current.value === pivotValue) {
      if (!current.right) {
        // Cannot rotate without right child
        return current;
      }

      const rightChild = current.right;
      current.right = rightChild.left;
      rightChild.left = current;

      // Update parent's pointer
      if (parent) {
        if (isLeftChild) {
          parent.left = rightChild;
        } else {
          parent.right = rightChild;
        }
        return newTree; // Return original root
      } else {
        return rightChild; // New root
      }
    }

    if (current.left) {
      const newRoot = rotateAt(current.left, current, true);
      if (newRoot !== newTree) return newRoot;
    }
    if (current.right) {
      const newRoot = rotateAt(current.right, current, false);
      if (newRoot !== newTree) return newRoot;
    }

    return newTree;
  };

  return rotateAt(newTree);
}

/**
 * Helper function to perform actual right rotation on a tree
 * 
 * This function performs the structural changes for a right rotation, returning
 * a new tree with the rotation applied. It's used by the rightRotation method
 * to modify the tree state after visualization.
 * 
 * @param root - The root of the tree containing the pivot
 * @param pivotValue - The value of the pivot node to rotate around
 * @returns The root of the tree after rotation (may be different if rotating root)
 */
function performRightRotation(root: BinaryTreeNode, pivotValue: number): BinaryTreeNode {
  if (!root) return root;

  // Helper function to clone a tree deeply
  const cloneTree = (node: BinaryTreeNode | undefined): BinaryTreeNode | undefined => {
    if (!node) return undefined;
    return {
      value: node.value,
      left: cloneTree(node.left),
      right: cloneTree(node.right),
    };
  };

  // Create a deep clone to avoid mutating the original
  const newTree = cloneTree(root)!;

  // Find the pivot and perform rotation
  const rotateAt = (current: BinaryTreeNode, parent?: BinaryTreeNode, isLeftChild?: boolean): BinaryTreeNode => {
    if (current.value === pivotValue) {
      if (!current.left) {
        // Cannot rotate without left child
        return current;
      }

      const leftChild = current.left;
      current.left = leftChild.right;
      leftChild.right = current;

      // Update parent's pointer
      if (parent) {
        if (isLeftChild) {
          parent.left = leftChild;
        } else {
          parent.right = leftChild;
        }
        return newTree; // Return original root
      } else {
        return leftChild; // New root
      }
    }

    if (current.left) {
      const newRoot = rotateAt(current.left, current, true);
      if (newRoot !== newTree) return newRoot;
    }
    if (current.right) {
      const newRoot = rotateAt(current.right, current, false);
      if (newRoot !== newTree) return newRoot;
    }

    return newTree;
  };

  return rotateAt(newTree);
}

/**
 * BST History Controller
 * 
 * A specialized history controller for Binary Search Tree operations. This class extends
 * the generic HistoryController to provide convenient, high-level methods for common
 * BST operations while maintaining full visualization and history capabilities.
 * 
 * Features:
 * - Insert values with automatic BST property maintenance
 * - Search for values with step-by-step visualization
 * - Find minimum and maximum values
 * - Full operation history and replay capabilities
 * - Automatic step generation for all operations
 * 
 * @extends HistoryController<BinaryTreeNode, BSTStep>
 * 
 * @example
 * ```typescript
 * // Create a BST controller with initial tree
 * const initialTree = {
 *   value: 8,
 *   left: { value: 3, left: { value: 1 }, right: { value: 6 } },
 *   right: { value: 10, right: { value: 14 } }
 * };
 * const controller = new BSTHistoryController(initialTree);
 * 
 * // Perform operations
 * await controller.insert(7);    // Insert 7 into the tree
 * await controller.search(6);    // Search for value 6
 * await controller.findMin();    // Find minimum value
 * 
 * // Access history
 * const history = controller.getState().operations;
 * console.log(`Performed ${history.length} operations`);
 * 
 * // Replay an operation
 * controller.selectAndVisualize(0); // Replay the insert operation
 * ```
 */
export class BSTHistoryController extends HistoryController<BinaryTreeNode, BSTStep> {
  
  /**
   * Creates a new BST History Controller
   * 
   * @param initialTree - The initial state of the Binary Search Tree
   * 
   * @example
   * ```typescript
   * const tree = { value: 5, left: { value: 3 }, right: { value: 7 } };
   * const controller = new BSTHistoryController(tree);
   * ```
   */
  constructor(initialTree: BinaryTreeNode) {
    super(initialTree);
  }

  /**
   * Insert a value into the BST
   * 
   * Inserts a new value into the Binary Search Tree while maintaining BST properties.
   * This is a mutating operation that will modify the tree structure. The insertion
   * process is visualized step-by-step, showing the path traversal and final placement.
   * 
   * @param value - The numeric value to insert
   * @returns Promise that resolves when the operation and visualization are complete
   * 
   * @example
   * ```typescript
   * await controller.insert(5);  // Insert 5 into the tree
   * await controller.insert(3);  // Insert 3 into the tree
   * await controller.insert(7);  // Insert 7 into the tree
   * ```
   * 
   * @throws {Error} If another operation is currently executing
   */
  async insert(value: number): Promise<void> {
    return this.executeOperation(
      'insert',
      value,
      (currentTree, val) => generateBSTInsertSteps(currentTree, val) as BSTStep[],
      (currentTree, val) => insertIntoBST(JSON.parse(JSON.stringify(currentTree)), val),
      `Insert ${value}`
    );
  }

  /**
   * Search for a value in the BST
   * 
   * Searches for a specific value in the Binary Search Tree, visualizing the
   * path traversal process. This is a non-mutating operation that doesn't modify
   * the tree structure, only explores it.
   * 
   * @param value - The numeric value to search for
   * @returns Promise that resolves when the search and visualization are complete
   * 
   * @example
   * ```typescript
   * await controller.search(5);  // Search for value 5
   * await controller.search(10); // Search for value 10 (may not exist)
   * ```
   * 
   * @throws {Error} If another operation is currently executing
   */
  async search(value: number): Promise<void> {
    return this.executeOperation(
      'search',
      value,
      (currentTree, val) => generateBSTSearchSteps(currentTree, val) as BSTStep[],
      undefined, // Non-mutating operation
      `Search for ${value}`
    );
  }

  /**
   * Find the minimum value in the BST
   * 
   * Locates the minimum value in the Binary Search Tree by traversing to the
   * leftmost node. This operation visualizes the traversal process and highlights
   * the minimum value when found. This is a non-mutating operation.
   * 
   * @returns Promise that resolves when the operation and visualization are complete
   * 
   * @example
   * ```typescript
   * await controller.findMin(); // Find and highlight the minimum value
   * ```
   * 
   * @throws {Error} If another operation is currently executing
   */
  async findMin(): Promise<void> {
    return this.executeOperation(
      'findMin',
      undefined,
      (currentTree) => generateBSTFindMinSteps(currentTree) as BSTStep[],
      undefined, // Non-mutating operation
      'Find Minimum'
    );
  }

  /**
   * Find the maximum value in the BST
   * 
   * Locates the maximum value in the Binary Search Tree by traversing to the
   * rightmost node. This operation visualizes the traversal process and highlights
   * the maximum value when found. This is a non-mutating operation.
   * 
   * @returns Promise that resolves when the operation and visualization are complete
   * 
   * @example
   * ```typescript
   * await controller.findMax(); // Find and highlight the maximum value
   * ```
   * 
   * @throws {Error} If another operation is currently executing
   */
  async findMax(): Promise<void> {
    return this.executeOperation(
      'findMax',
      undefined,
      (currentTree) => generateBSTFindMaxSteps(currentTree) as BSTStep[],
      undefined, // Non-mutating operation
      'Find Maximum'
    );
  }

  /**
   * Perform a left rotation around a specified pivot node
   * 
   * Left rotation is a fundamental tree restructuring operation used in balanced trees.
   * It transforms the tree structure while preserving the BST property. The operation
   * visualizes each step of identifying the pivot, checking preconditions, and 
   * performing the structural changes.
   * 
   * Left rotation transforms:
   *    P               R
   *   / \             / \
   *  L   R    =>     P   RR
   *     / \         / \
   *    RL  RR      L   RL
   * 
   * Note: This is a visualization-only operation. It shows how rotation would work
   * but doesn't actually modify the tree structure since BST rotations are typically
   * used for balancing (AVL, Red-Black trees) rather than standard BSTs.
   * 
   * @param pivotValue - The value of the node to rotate around
   * @returns Promise that resolves when the operation and visualization are complete
   * 
   * @example
   * ```typescript
   * // Perform left rotation around node with value 10
   * await controller.leftRotation(10);
   * ```
   * 
   * @throws {Error} If another operation is currently executing
   * @throws {Error} If the pivot node doesn't exist or doesn't have a right child
   */
  async leftRotation(pivotValue: number): Promise<void> {
    return this.executeOperation(
      'leftRotation',
      pivotValue,
      (currentTree, val) => generateLeftRotationSteps(currentTree, val) as BSTStep[],
      (currentTree, val) => performLeftRotation(currentTree, val),
      `Left rotation around ${pivotValue}`
    );
  }

  /**
   * Perform a right rotation around a specified pivot node
   * 
   * Right rotation is a fundamental tree restructuring operation used in balanced trees.
   * It transforms the tree structure while preserving the BST property. The operation
   * visualizes each step of identifying the pivot, checking preconditions, and 
   * performing the structural changes.
   * 
   * Right rotation transforms:
   *      P             L
   *     / \           / \
   *    L   R   =>   LL   P
   *   / \               / \
   *  LL  LR            LR  R
   * 
   * Note: This is a visualization-only operation. It shows how rotation would work
   * but doesn't actually modify the tree structure since BST rotations are typically
   * used for balancing (AVL, Red-Black trees) rather than standard BSTs.
   * 
   * @param pivotValue - The value of the node to rotate around
   * @returns Promise that resolves when the operation and visualization are complete
   * 
   * @example
   * ```typescript
   * // Perform right rotation around node with value 8
   * await controller.rightRotation(8);
   * ```
   * 
   * @throws {Error} If another operation is currently executing
   * @throws {Error} If the pivot node doesn't exist or doesn't have a left child
   */
  async rightRotation(pivotValue: number): Promise<void> {
    return this.executeOperation(
      'rightRotation',
      pivotValue,
      (currentTree, val) => generateRightRotationSteps(currentTree, val) as BSTStep[],
      (currentTree, val) => performRightRotation(currentTree, val),
      `Right rotation around ${pivotValue}`
    );
  }

  /**
   * Get the current tree state
   * 
   * Returns the current state of the Binary Search Tree. This reflects the tree
   * after all committed operations, but may not include the final state of a
   * currently visualized operation until that visualization completes.
   * 
   * @returns The current Binary Search Tree structure
   * 
   * @example
   * ```typescript
   * const currentTree = controller.getCurrentTree();
   * console.log('Root value:', currentTree.value);
   * console.log('Has left child:', !!currentTree.left);
   * ```
   */
  getCurrentTree(): BinaryTreeNode {
    return this.getState().currentState;
  }

  /**
   * Reset the controller to a new initial tree state
   * 
   * Clears all operation history and resets the controller to the provided
   * initial tree state. This is useful for starting fresh with a new tree
   * or returning to a known good state.
   * 
   * @param initialTree - The new initial tree state to reset to
   * 
   * @example
   * ```typescript
   * const newTree = { value: 10, left: { value: 5 }, right: { value: 15 } };
   * controller.reset(newTree); // Clear history and start with new tree
   * ```
   */
  reset(initialTree: BinaryTreeNode): void {
    this.clearHistory(initialTree);
  }

  /**
   * Get the set of visited nodes up to the current step
   * 
   * Calculates which nodes have been visited during traversal based on the
   * current visualization state. This is used by the renderer to highlight
   * visited nodes appropriately.
   * 
   * @returns Set of node values that have been visited
   * 
   * @example
   * ```typescript
   * const visitedNodes = controller.getVisitedNodes();
   * console.log('Visited nodes:', Array.from(visitedNodes));
   * ```
   */
  getVisitedNodes(): Set<number> {
    const visitedNodes = new Set<number>();
    const state = this.getState();
    
    if (state.selectedOperationIndex >= 0 && state.currentStepIndex >= 0) {
      const selectedOperation = state.operations[state.selectedOperationIndex];
      if (selectedOperation) {
        // Add nodes visited up to current step
        for (let i = 0; i <= state.currentStepIndex; i++) {
          const step = selectedOperation.steps[i] as any;
          if (step && step.currentNode) {
            visitedNodes.add(step.currentNode.value);
          }
        }
      }
    }
    
    return visitedNodes;
  }

  /**
   * Get the current node being examined (if any)
   * 
   * Returns the node currently being examined in the traversal visualization,
   * which should be highlighted with special styling to show current focus.
   * 
   * @returns The current node value, or null if no traversal is active
   * 
   * @example
   * ```typescript
   * const currentNode = controller.getCurrentTraversalNode();
   * if (currentNode !== null) {
   *   console.log('Currently examining node:', currentNode);
   * }
   * ```
   */
  getCurrentTraversalNode(): number | null {
    const state = this.getState();
    
    if (state.selectedOperationIndex >= 0 && state.currentStepIndex >= 0) {
      const selectedOperation = state.operations[state.selectedOperationIndex];
      if (selectedOperation) {
        const currentStep = selectedOperation.steps[state.currentStepIndex] as any;
        return currentStep && currentStep.currentNode ? currentStep.currentNode.value : null;
      }
    }
    
    return null;
  }

  /**
   * Get the current traversal step
   * 
   * Returns the complete current step object for detailed examination,
   * including metadata and decision information.
   * 
   * @returns The current traversal step, or null if no traversal is active
   * 
   * @example
   * ```typescript
   * const step = controller.getCurrentStep();
   * if (step) {
   *   console.log('Step description:', step.metadata.description);
   *   console.log('Decision:', step.decision);
   * }
   * ```
   */
  getCurrentStep(): any | null {
    const state = this.getState();
    
    if (state.selectedOperationIndex >= 0 && state.currentStepIndex >= 0) {
      const selectedOperation = state.operations[state.selectedOperationIndex];
      if (selectedOperation) {
        return selectedOperation.steps[state.currentStepIndex] || null;
      }
    }
    
    return null;
  }

  /**
   * Check if traversal visualization is currently active
   * 
   * @returns True if a traversal is currently being visualized
   * 
   * @example
   * ```typescript
   * if (controller.isTraversing()) {
   *   console.log('Currently visualizing:', controller.getCurrentStep()?.operation);
   * }
   * ```
   */
  isTraversing(): boolean {
    const state = this.getState();
    return state.selectedOperationIndex >= 0;
  }

  // Private property to track the last step direction
  private lastStepDirection: 'forward' | 'backward' | null = null;

  /**
   * Get the direction of the last step movement
   * 
   * @returns The direction of the last step change, or null if no movement has occurred
   */
  getLastStepDirection(): 'forward' | 'backward' | null {
    return this.lastStepDirection;
  }

  /**
   * Override stepForward to track direction
   */
  stepForward(): void {
    super.stepForward();
    this.lastStepDirection = 'forward';
  }

  /**
   * Override stepBackward to track direction
   */
  stepBackward(): void {
    super.stepBackward();
    this.lastStepDirection = 'backward';
  }

  /**
   * Get information about the previous step for reverse animations
   * 
   * @returns The previous step if stepping backward, null otherwise
   */
  getPreviousStep(): any | null {
    const state = this.getState();
    
    if (this.lastStepDirection === 'backward' && 
        state.selectedOperationIndex >= 0 && 
        state.currentStepIndex >= 0) {
      const selectedOperation = state.operations[state.selectedOperationIndex];
      if (selectedOperation) {
        const nextStepIndex = state.currentStepIndex + 1;
        return selectedOperation.steps[nextStepIndex] || null;
      }
    }
    
    return null;
  }

  /**
   * Override to provide BST-specific animation instructions
   */
  getAnimationInstructions(): AnimationInstructions {
    const state = this.getState();
    const instructions: AnimationInstruction[] = [];
    
    if (state.selectedOperationIndex < 0 || state.currentStepIndex < 0) {
      return { instructions, stepDirection: this.lastStepDirection };
    }

    const currentOperation = state.operations[state.selectedOperationIndex];
    const currentStep = currentOperation.steps[state.currentStepIndex] as any;
    
    if (!currentStep) {
      return { instructions, stepDirection: this.lastStepDirection };
    }

    // Generate animations based on step direction and operation type
    if (this.lastStepDirection === 'forward') {
      // For forward steps, we look at the current step to see what animation to play
      this.generateForwardAnimations(currentStep, instructions);
    } else if (this.lastStepDirection === 'backward') {
      // For backward steps, we look at the step we're stepping back from (next step)
      const nextStepIndex = state.currentStepIndex + 1;
      const nextStep = currentOperation.steps[nextStepIndex] as any;
      if (nextStep) {
        this.generateBackwardAnimations(currentStep, nextStep, currentOperation, instructions);
      }
    }

    // Debug logging in development
    if (import.meta.env.DEV && instructions.length > 0) {
      console.log('Generated animation instructions:', {
        stepDirection: this.lastStepDirection,
        currentStepIndex: state.currentStepIndex,
        currentStep: currentStep.decision,
        instructions: instructions.map(i => {
          if (i.type === 'node') {
            return `${i.type}:${i.animation}:${i.nodeValue}`;
          } else {
            return `${i.type}:${i.animation}:${i.fromValue}->${i.toValue}`;
          }
        })
      });
    }

    return { instructions, stepDirection: this.lastStepDirection };
  }

  /**
   * Generate animations for forward steps
   */
  private generateForwardAnimations(currentStep: any, instructions: AnimationInstruction[]): void {
    // Priority order: traversal animations first, then insert/delete animations, then node animations
    
    // 1. Traversal link animation - highest priority for go_left and go_right decisions
    if ((currentStep.decision === 'go_left' || currentStep.decision === 'go_right') && 
        currentStep.currentNode && currentStep.nextNode) {
      instructions.push({
        type: 'link',
        fromValue: currentStep.currentNode.value,
        toValue: currentStep.nextNode.value,
        animation: 'forward-traverse'
      });
      return; // Exit early to avoid conflicting animations
    }

    // 2. Insert animation
    if (currentStep.decision === 'insert_here' && currentStep.currentNode) {
      // Find the newly inserted node
      if (currentStep.currentNode.left || currentStep.currentNode.right) {
        const newNodeValue = currentStep.metadata?.searchValue;
        if (newNodeValue !== undefined) {
          instructions.push({
            type: 'node',
            nodeValue: newNodeValue,
            animation: 'grow-appear'
          });
          return; // Exit early to avoid conflicting animations
        }
      }
    }

    // 3. Delete animation
    if (currentStep.decision === 'found' && currentStep.operation === 'delete') {
      instructions.push({
        type: 'node',
        nodeValue: currentStep.currentNode.value,
        animation: 'shrink-disappear'
      });
      return; // Exit early to avoid conflicting animations
    }

    // 4. Default pulse animation for other cases
    if (currentStep.currentNode) {
      instructions.push({
        type: 'node',
        nodeValue: currentStep.currentNode.value,
        animation: 'pulse'
      });
    }
  }

  /**
   * Generate animations for backward steps
   */
  private generateBackwardAnimations(_currentStep: any, nextStep: any, _operation: any, instructions: AnimationInstruction[]): void {
    // Priority order: traversal animations first, then node animations, then insert/delete animations
    
    // 1. Reverse traversal link animation - highest priority for go_left and go_right decisions
    if ((nextStep.decision === 'go_left' || nextStep.decision === 'go_right') && 
        nextStep.currentNode && nextStep.nextNode) {
      instructions.push({
        type: 'link',
        fromValue: nextStep.nextNode.value,  // From where we were going
        toValue: nextStep.currentNode.value, // Back to where we came from
        animation: 'reverse-traverse'
      });
      return; // Exit early to avoid conflicting animations
    }

    // 2. Reverse insert (deletion) animation
    if (nextStep.decision === 'insert_here' && nextStep.operation === 'insert') {
      const insertedValue = nextStep.metadata?.searchValue;
      if (insertedValue !== undefined) {
        instructions.push({
          type: 'node',
          nodeValue: insertedValue,
          animation: 'shrink-disappear'
        });
        return; // Exit early to avoid conflicting animations
      }
    }

    // 3. Reverse delete (restoration) animation
    if (nextStep.decision === 'found' && nextStep.operation === 'delete') {
      instructions.push({
        type: 'node',
        nodeValue: nextStep.currentNode.value,
        animation: 'grow-appear'
      });
      return; // Exit early to avoid conflicting animations
    }

    // 4. Default rewind animation for other cases
    if (nextStep.currentNode) {
      instructions.push({
        type: 'node',
        nodeValue: nextStep.currentNode.value,
        animation: 'rewind'
      });
    }
  }
}
