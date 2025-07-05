import type { Operation } from '../../../lib/core/types';
import { createOperation } from '../../../lib/core/types';
import { OperationController } from '../../../lib/core/OperationController';
import type { BinaryTree, BinaryTreeNode, NormalizedBinaryTree } from '../types';
import { normalizeBinaryTree } from '../types';
import { generateBSTInsertStates, generateBSTSearchStates } from '../algorithms';

/**
 * Helper function to create a NormalizedBinaryTree from a plain object specification
 */
function createBinaryTree(
  root: BinaryTreeNode | null = null,
  name?: string,
  animationHints?: any[],
  metadata?: Record<string, any>
): NormalizedBinaryTree {
  return normalizeBinaryTree({
    root,
    name,
    animationHints,
    _metadata: metadata
  });
}

/**
 * BST Operation Controller
 * 
 * Concrete implementation of OperationController for Binary Search Trees.
 * Provides BST-specific operations (insert, delete, search) that generate sequences
 * of immutable states for step-by-step visualization.
 * 
 * Key features:
 * - Immutable state updates
 * - Step-by-step animation state generation
 * - Educational operation descriptions
 * - BST property validation
 */
export class BSTOperationController extends OperationController<NormalizedBinaryTree> {
  
  constructor(initialTree: BinaryTree | null = null) {
    // Initialize with empty tree if none provided
    const initialState = initialTree ? normalizeBinaryTree(initialTree) : createBinaryTree(null, "Empty BST");
    if (import.meta.env.DEV) {
      console.log('🎛️ BSTOperationController: Initialized', {
        hasInitialTree: !!initialTree,
        initialStateName: initialState.name,
        hasRoot: !!initialState.root,
        rootValue: initialState.root?.value
      });
    }
    super(initialState);
  }

  // Abstract method implementations

  /**
   * Performs a single BST operation and returns the final result state.
   * This is used for direct execution without animation steps.
   */
  protected perform(operation: Operation, currentState: NormalizedBinaryTree | null): NormalizedBinaryTree | null {
    if (!currentState) {
      currentState = createBinaryTree(null, "Empty BST");
    }

    switch (operation.type) {
      case 'insert': {
        const value = operation.params.value as number;
        const states = generateBSTInsertStates(currentState, value);
        // Return the final state (last element)
        return states[states.length - 1] || currentState;
      }
      
      case 'search': {
        const value = operation.params.value as number;
        const states = generateBSTSearchStates(currentState, value);
        // For search, return the final state but preserve the original tree structure
        const finalState = states[states.length - 1] || currentState;
        return createBinaryTree(
          currentState.root, // Keep original tree structure
          finalState.name,
          finalState.animationHints
        );
      }
      
      case 'delete': {
        // TODO: Implement delete operation in next phase
        throw new Error('Delete operation not yet implemented');
      }
      
      case 'findMin': {
        // Find minimum value - traverse left until no more left child
        let node = currentState.root;
        while (node && node.left) {
          node = node.left;
        }
        return createBinaryTree(node, `Min: ${node?.value}`);
      }
      
      case 'findMax': {
        // Find maximum value - traverse right until no more right child
        let node = currentState.root;
        while (node && node.right) {
          node = node.right;
        }
        return createBinaryTree(node, `Max: ${node?.value}`);
      }
      
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  /**
   * Generates all intermediate animation states for a BST operation.
   * Each state represents one atomic step in the operation.
   */
  protected generateStates(operation: Operation, currentState: NormalizedBinaryTree | null): readonly NormalizedBinaryTree[] {
    if (!currentState) {
      currentState = createBinaryTree(null, "Empty BST");
    }

    switch (operation.type) {
      case 'insert': {
        const value = operation.params.value as number;
        return generateBSTInsertStates(currentState, value);
      }
      
      case 'search': {
        const value = operation.params.value as number;
        return generateBSTSearchStates(currentState, value);
      }
      
      case 'delete': {
        // TODO: Implement delete operation in next phase
        throw new Error('Delete operation not yet implemented');
      }
      
      case 'findMin': {
        return this.generateFindMinStates(currentState);
      }
      
      case 'findMax': {
        return this.generateFindMaxStates(currentState);
      }
      
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  // Public operation methods

  /**
   * Inserts a value into the BST.
   * 
   * @param value - The value to insert
   * @returns Result containing all animation states or error information
   */
  insert(value: number) {
    const operation = createOperation(
      'insert',
      { value },
      `Insert ${value}`
    );
    
    return this.executeOperation(operation);
  }

  /**
   * Inserts a value into the BST without animation (direct to final state).
   * 
   * @param value - The value to insert
   * @returns Result containing only the final state
   */
  insertDirect(value: number) {
    const operation = createOperation(
      'insert',
      { value },
      `Insert ${value} (direct)`
    );
    
    return this.executeOperationDirect(operation);
  }

  /**
   * Searches for a value in the BST.
   * 
   * @param value - The value to search for
   * @returns Result containing all animation states or error information
   */
  search(value: number) {
    const operation = createOperation(
      'search',
      { value },
      `Search for ${value}`
    );
    
    return this.executeOperation(operation);
  }

  /**
   * Searches for a value in the BST without animation.
   * 
   * @param value - The value to search for
   * @returns Result containing only the final state
   */
  searchDirect(value: number) {
    const operation = createOperation(
      'search',
      { value },
      `Search for ${value} (direct)`
    );
    
    return this.executeOperationDirect(operation);
  }

  /**
   * Deletes a value from the BST.
   * TODO: Implement in next phase
   * 
   * @param value - The value to delete
   * @returns Result containing all animation states or error information
   */
  delete(value: number) {
    const operation = createOperation(
      'delete',
      { value },
      `Delete ${value}`
    );
    
    return this.executeOperation(operation);
  }

  /**
   * Finds the minimum value in the BST.
   * 
   * @returns Result containing all animation states showing the path to minimum
   */
  findMin() {
    const operation = createOperation(
      'findMin',
      {},
      'Find minimum value'
    );
    
    return this.executeOperation(operation);
  }

  /**
   * Finds the maximum value in the BST.
   * 
   * @returns Result containing all animation states showing the path to maximum
   */
  findMax() {
    const operation = createOperation(
      'findMax',
      {},
      'Find maximum value'
    );
    
    return this.executeOperation(operation);
  }

  /**
   * Finds the minimum value in the BST and starts stepping through the operation.
   * 
   * @returns Result containing all animation states or error information
   */
  findMinWithStepping() {
    const operation = createOperation(
      'findMin',
      {},
      'Find minimum value'
    );
    
    return this.executeOperationWithStepping(operation);
  }

  /**
   * Finds the maximum value in the BST and starts stepping through the operation.
   * 
   * @returns Result containing all animation states or error information
   */
  findMaxWithStepping() {
    const operation = createOperation(
      'findMax',
      {},
      'Find maximum value'
    );
    
    return this.executeOperationWithStepping(operation);
  }

  // Public history access methods

  /**
   * Undo the last operation
   */
  undo() {
    return this.historyController.undo();
  }

  /**
   * Redo the next operation
   */
  redo() {
    return this.historyController.redo();
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.historyController.canUndo();
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.historyController.canRedo();
  }

  /**
   * Clears the BST (removes all nodes).
   * 
   * @returns Result containing the empty tree state
   */
  clear() {
    const operation = createOperation(
      'clear',
      {},
      'Clear tree'
    );
    
    const emptyTree = createBinaryTree(null, "Empty BST");
    this.historyController.execute(operation, [emptyTree]);
    
    return {
      success: true,
      states: [emptyTree] as const,
    };
  }

  /**
   * Inserts a value into the BST and starts stepping through the operation.
   * 
   * @param value - The value to insert
   * @returns Result containing all animation states or error information
   */
  insertWithStepping(value: number) {
    const operation = createOperation(
      'insert',
      { value },
      `Insert ${value}`
    );
    
    return this.executeOperationWithStepping(operation);
  }

  /**
   * Searches for a value in the BST and starts stepping through the operation.
   * 
   * @param value - The value to search for
   * @returns Result containing all animation states or error information
   */
  searchWithStepping(value: number) {
    const operation = createOperation(
      'search',
      { value },
      `Search for ${value}`
    );
    
    return this.executeOperationWithStepping(operation);
  }

  // Step-by-step navigation methods

  /**
   * Steps forward to the next animation state within the current operation.
   */
  stepForward(): NormalizedBinaryTree | null {
    return this.historyController.stepForward();
  }

  /**
   * Steps backward to the previous animation state within the current operation.
   */
  stepBackward(): NormalizedBinaryTree | null {
    return this.historyController.stepBackward();
  }

  /**
   * Checks if we can step forward in the current operation.
   */
  canStepForward(): boolean {
    return this.historyController.canStepForward();
  }

  /**
   * Checks if we can step backward in the current operation.
   */
  canStepBackward(): boolean {
    return this.historyController.canStepBackward();
  }

  /**
   * Checks if we're currently stepping through animation states.
   */
  isAnimating(): boolean {
    return this.historyController.isAnimating();
  }

  /**
   * Gets the current animation index within the current operation.
   */
  getCurrentAnimationIndex(): number {
    return this.historyController.getCurrentAnimationIndex();
  }

  /**
   * Gets the current operation index.
   */
  getCurrentOperationIndex(): number {
    return this.historyController.getCurrentOperationIndex();
  }

  /**
   * Gets all animation states for the current operation.
   */
  getCurrentOperationStates(): readonly BinaryTree[] {
    const currentIndex = this.historyController.getCurrentOperationIndex();
    return this.historyController.getStates(currentIndex);
  }

  /**
   * Gets the current operation from history.
   */
  getCurrentOperation(): Operation | null {
    const history = this.historyController.getHistory();
    const currentIndex = this.historyController.getCurrentOperationIndex();
    
    if (currentIndex >= 0 && currentIndex < history.length) {
      return history[currentIndex].operation;
    }
    
    return null;
  }

  /**
   * Generates animation states for finding the minimum value.
   * Traverses left until reaching the leftmost node.
   */
  private generateFindMinStates(currentState: NormalizedBinaryTree): readonly NormalizedBinaryTree[] {
    const states: NormalizedBinaryTree[] = [];
    
    if (!currentState.root) {
      // Empty tree
      states.push(createBinaryTree(null, "Tree is empty"));
      return states;
    }

    let current = currentState.root;
    
    // Start with initial state showing the operation has begun
    states.push(createBinaryTree(
      this.setNodeState(currentState.root, current.value, 'active'),
      `Finding minimum: starting at root ${current.value}`
    ));

    // Traverse left until we find the leftmost node
    while (current.left) {
      current = current.left;
      states.push(createBinaryTree(
        this.setNodeState(currentState.root, current.value, 'active'),
        `Finding minimum: moving left to ${current.value}`
      ));
    }

    // Final state - found the minimum
    states.push(createBinaryTree(
      this.setNodeState(currentState.root, current.value, 'visited'),
      `Minimum value found: ${current.value}`
    ));

    return states;
  }

  /**
   * Generates animation states for finding the maximum value.
   * Traverses right until reaching the rightmost node.
   */
  private generateFindMaxStates(currentState: NormalizedBinaryTree): readonly NormalizedBinaryTree[] {
    const states: NormalizedBinaryTree[] = [];
    
    if (!currentState.root) {
      // Empty tree
      states.push(createBinaryTree(null, "Tree is empty"));
      return states;
    }

    let current = currentState.root;
    
    // Start with initial state showing the operation has begun
    states.push(createBinaryTree(
      this.setNodeState(currentState.root, current.value, 'active'),
      `Finding maximum: starting at root ${current.value}`
    ));

    // Traverse right until we find the rightmost node
    while (current.right) {
      current = current.right;
      states.push(createBinaryTree(
        this.setNodeState(currentState.root, current.value, 'active'),
        `Finding maximum: moving right to ${current.value}`
      ));
    }

    // Final state - found the maximum
    states.push(createBinaryTree(
      this.setNodeState(currentState.root, current.value, 'visited'),
      `Maximum value found: ${current.value}`
    ));

    return states;
  }

  /**
   * Helper function to set the state of a specific node in the tree.
   * Returns a new tree with the specified node's state updated.
   */
  private setNodeState(root: BinaryTreeNode | null, targetValue: number, newState: 'default' | 'active' | 'visited'): BinaryTreeNode | null {
    if (!root) return null;

    if (root.value === targetValue) {
      return {
        ...root,
        state: newState,
        left: this.setNodeState(root.left, targetValue, 'default'),
        right: this.setNodeState(root.right, targetValue, 'default')
      };
    }

    return {
      ...root,
      state: 'default', // Reset other nodes to default
      left: this.setNodeState(root.left, targetValue, newState),
      right: this.setNodeState(root.right, targetValue, newState)
    };
  }
}
