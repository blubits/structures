import type {
  DataStructureState,
  Operation,
  OperationResult,
  StateValidator,
} from './types';
import { HistoryController } from './History';

/**
 * Abstract base class for data structure operation controllers.
 * 
 * Provides a common interface for all data structure implementations
 * while delegating specific operations to concrete subclasses.
 * 
 * Enforces immutability by requiring all operations to return new state instances.
 */
export abstract class OperationController<TState extends DataStructureState = DataStructureState> {
  protected historyController: HistoryController<TState>;
  protected validator?: StateValidator<TState>;

  constructor(initialState: TState | null = null, validator?: StateValidator<TState>) {
    this.historyController = new HistoryController<TState>(initialState);
    this.validator = validator;
  }

  // Abstract methods that must be implemented by concrete data structures

  /**
   * Performs a single operation and returns the final result state.
   * This method should NOT generate intermediate animation states.
   * 
   * @param operation - The operation to perform
   * @param currentState - The current state (immutable)
   * @returns New state after the operation (must be immutable)
   */
  protected abstract perform(operation: Operation, currentState: TState | null): TState | null;

  /**
   * Generates all intermediate animation states for an operation.
   * Each state in the array represents one atomic step in the operation.
   * The final state should be the same as what perform() would return.
   * 
   * IMPORTANT: Each state represents ONE atomic visual change.
   * Complex operations should be broken down into multiple atomic steps.
   * 
   * @param operation - The operation to perform
   * @param currentState - The current state (immutable)
   * @returns Array of states showing step-by-step execution (all immutable)
   */
  protected abstract generateStates(operation: Operation, currentState: TState | null): readonly TState[];

  // Public interface for executing operations

  /**
   * Executes an operation with full animation state generation.
   * 
   * @param operation - The operation to execute
   * @returns Result containing all animation states or error information
   */
  executeOperation(operation: Operation): OperationResult<TState> {
    try {
      const currentState = this.historyController.getCurrentState();
      
      // Validate current state if validator is provided
      if (this.validator && currentState) {
        const validation = this.validator.validate(currentState);
        if (!validation.valid) {
          return {
            success: false,
            states: [],
            error: `Invalid current state: ${validation.errors.join(', ')}`,
          };
        }
      }

      // Generate all intermediate states
      const states = this.generateStates(operation, currentState);
      
      if (states.length === 0) {
        return {
          success: false,
          states: [],
          error: 'Operation produced no states',
        };
      }

      // Validate final state if validator is provided
      const finalState = states[states.length - 1];
      if (this.validator) {
        const validation = this.validator.validate(finalState);
        if (!validation.valid) {
          return {
            success: false,
            states: [],
            error: `Invalid result state: ${validation.errors.join(', ')}`,
          };
        }
      }

      // Execute the operation in the history controller
      this.historyController.execute(operation, states);

      return {
        success: true,
        states,
      };
    } catch (error) {
      return {
        success: false,
        states: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Executes an operation without animation (direct to final state).
   * 
   * @param operation - The operation to execute
   * @returns Result containing only the final state
   */
  executeOperationDirect(operation: Operation): OperationResult<TState> {
    try {
      const currentState = this.historyController.getCurrentState();
      
      // Validate current state if validator is provided
      if (this.validator && currentState) {
        const validation = this.validator.validate(currentState);
        if (!validation.valid) {
          return {
            success: false,
            states: [],
            error: `Invalid current state: ${validation.errors.join(', ')}`,
          };
        }
      }

      // Perform operation directly
      const finalState = this.perform(operation, currentState);
      
      if (finalState === null) {
        return {
          success: false,
          states: [],
          error: 'Operation failed to produce a result',
        };
      }

      // Validate final state if validator is provided
      if (this.validator) {
        const validation = this.validator.validate(finalState);
        if (!validation.valid) {
          return {
            success: false,
            states: [],
            error: `Invalid result state: ${validation.errors.join(', ')}`,
          };
        }
      }

      // Execute with only the final state (no intermediate animation)
      this.historyController.execute(operation, [finalState]);

      return {
        success: true,
        states: [finalState],
      };
    } catch (error) {
      return {
        success: false,
        states: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Executes an operation with full animation state generation and immediately
   * starts stepping through the operation from the first step.
   * 
   * @param operation - The operation to execute
   * @returns Result containing all animation states or error information
   */
  executeOperationWithStepping(operation: Operation): OperationResult<TState> {
    const result = this.executeOperation(operation);
    
    if (result.success) {
      // Start stepping through the operation from the beginning
      this.historyController.startSteppingThroughCurrentOperation();
    }
    
    return result;
  }

  // History management methods (delegate to history controller)

  /**
   * Undoes the last operation.
   */
  undo(): { state: TState | null; operation: Operation | null } {
    return this.historyController.undo();
  }

  /**
   * Redoes the next operation.
   */
  redo(): { state: TState | null; operation: Operation | null } {
    return this.historyController.redo();
  }

  /**
   * Gets the current final state (SSOT).
   */
  getCurrentState(): TState | null {
    return this.historyController.getCurrentState();
  }

  /**
   * Gets the current visualization state (for display).
   */
  getCurrentVisualizationState(): TState | null {
    return this.historyController.getCurrentVisualizationState();
  }

  /**
   * Steps forward to the next animation state within the current operation.
   */
  stepForward(): TState | null {
    return this.historyController.stepForward();
  }

  /**
   * Steps backward to the previous animation state within the current operation.
   */
  stepBackward(): TState | null {
    return this.historyController.stepBackward();
  }

  /**
   * Jumps directly to a specific operation in the history.
   */
  jumpTo(operationIndex: number): TState | null {
    return this.historyController.jumpTo(operationIndex);
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
   * Checks if we can undo.
   */
  canUndo(): boolean {
    return this.historyController.canUndo();
  }

  /**
   * Checks if we can redo.
   */
  canRedo(): boolean {
    return this.historyController.canRedo();
  }

  /**
   * Gets the complete operation history.
   */
  getHistory() {
    return this.historyController.getHistory();
  }

  /**
   * Gets access to the underlying history controller.
   * Use this for advanced operations or React hooks integration.
   */
  getHistoryController(): HistoryController<TState> {
    return this.historyController;
  }

  /**
   * Clears all history and resets to a new initial state.
   */
  clear(newInitialState: TState | null = null): void {
    this.historyController.clear(newInitialState);
  }

  /**
   * Sets or updates the state validator.
   */
  setValidator(validator: StateValidator<TState> | undefined): void {
    this.validator = validator;
  }
}
