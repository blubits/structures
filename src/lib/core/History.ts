import type {
  DataStructureState,
  Operation,
  OperationGroup,
} from '@/types/data-structure';

/**
 * Internal state of the HistoryController.
 */
interface ControllerState<TState extends DataStructureState> {
  /** Current final state (SSOT) - result of the last completed operation */
  currentState: TState | null;
  
  /** Current visualization state (for display) - may be an intermediate animation state */
  currentVisualizationState: TState | null;
  
  /** Whether we're currently stepping through animation states within an operation */
  isAnimating: boolean;
  
  /** Index of the current operation in history (-1 if no operations) */
  currentOperationIndex: number;
  
  /** Index of the current animation state within the current operation (-1 if at final state) */
  currentAnimationIndex: number;
}

/**
 * Generic time-machine controller for any data structure. Provides dual navigation (macro and micro) and uses immutable state updates with React's useSyncExternalStore for reactivity.
 */
export class HistoryController<TState extends DataStructureState = DataStructureState> {
  private operationHistory: OperationGroup<TState>[] = [];
  private redoStack: OperationGroup<TState>[] = [];
  
  private state: ControllerState<TState> = {
    currentState: null,
    currentVisualizationState: null,
    isAnimating: false,
    currentOperationIndex: -1,
    currentAnimationIndex: -1,
  };
  
  private listeners = new Set<() => void>();

  constructor(initialState: TState | null = null) {
    if (initialState) {
      this.state = {
        ...this.state,
        currentState: initialState,
        currentVisualizationState: initialState,
      };
    }
  }

  // React useSyncExternalStore integration
  getSnapshot = (): ControllerState<TState> => {
    return this.state;
  };

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private setState(updater: (prev: ControllerState<TState>) => ControllerState<TState>): void {
    this.state = updater(this.state);
    this.listeners.forEach(listener => listener());
  }

  /**
   * Executes an operation and adds it to the history.
   * The final state (last element in states) becomes the new current state.
   * 
   * @param operation - The operation being performed
   * @param states - All intermediate states, with final state as last element
   */
  execute(operation: Operation, states: readonly TState[]): void {
    if (states.length === 0) {
      throw new Error('Operation must produce at least one state');
    }

    // Create immutable operation group
    const operationGroup: OperationGroup<TState> = {
      operation: operation, // Store the instance, not a shallow copy
      states: [...states], // Create defensive copy
    };

    // Clear redo stack when new operation is executed
    this.redoStack = [];
    
    // Add to history
    this.operationHistory = [...this.operationHistory, operationGroup];
    
    const finalState = states[states.length - 1];
    
    this.setState(prev => ({
      ...prev,
      currentState: finalState,
      currentVisualizationState: finalState,
      isAnimating: false,
      currentOperationIndex: this.operationHistory.length - 1,
      currentAnimationIndex: -1, // -1 means we're at the final state
    }));
  }

  /**
   * Jumps directly to a specific operation in the history.
   * Sets visualization state to the final state of that operation.
   * 
   * @param operationIndex - Index of the operation to jump to
   * @returns The final state of the target operation, or null if invalid index
   */
  jumpTo(operationIndex: number): TState | null {
    if (operationIndex < -1 || operationIndex >= this.operationHistory.length) {
      return null;
    }

    let targetState: TState | null = null;
    
    if (operationIndex === -1) {
      // Jump to initial state (before any operations)
      targetState = null;
    } else {
      const operationGroup = this.operationHistory[operationIndex];
      targetState = operationGroup.states[operationGroup.states.length - 1];
    }

    this.setState(prev => ({
      ...prev,
      currentState: targetState,
      currentVisualizationState: targetState,
      isAnimating: false,
      currentOperationIndex: operationIndex,
      currentAnimationIndex: -1,
    }));

    return targetState;
  }

  /**
   * Undoes the last operation.
   * 
   * @returns Object containing the new state and the undone operation
   */
  undo(): { state: TState | null; operation: Operation | null } {
    if (this.operationHistory.length === 0) {
      return { state: this.state.currentState, operation: null };
    }

    // Move last operation to redo stack
    const lastOperation = this.operationHistory[this.operationHistory.length - 1];
    this.redoStack = [lastOperation, ...this.redoStack];
    this.operationHistory = this.operationHistory.slice(0, -1);

    // Determine new current state
    let newState: TState | null = null;
    if (this.operationHistory.length > 0) {
      const lastRemainingOperation = this.operationHistory[this.operationHistory.length - 1];
      newState = lastRemainingOperation.states[lastRemainingOperation.states.length - 1];
    }

    this.setState(prev => ({
      ...prev,
      currentState: newState,
      currentVisualizationState: newState,
      isAnimating: false,
      currentOperationIndex: this.operationHistory.length - 1,
      currentAnimationIndex: -1,
    }));

    return { state: newState, operation: lastOperation.operation };
  }

  /**
   * Redoes the next operation in the redo stack.
   * 
   * @returns Object containing the new state and the redone operation
   */
  redo(): { state: TState | null; operation: Operation | null } {
    if (this.redoStack.length === 0) {
      return { state: this.state.currentState, operation: null };
    }

    // Move operation from redo stack back to history
    const operationToRedo = this.redoStack[0];
    this.redoStack = this.redoStack.slice(1);
    this.operationHistory = [...this.operationHistory, operationToRedo];

    const finalState = operationToRedo.states[operationToRedo.states.length - 1];

    this.setState(prev => ({
      ...prev,
      currentState: finalState,
      currentVisualizationState: finalState,
      isAnimating: false,
      currentOperationIndex: this.operationHistory.length - 1,
      currentAnimationIndex: -1,
    }));

    return { state: finalState, operation: operationToRedo.operation };
  }

  /**
   * Steps forward to the next animation state within the current operation.
   * If at the end of the current operation, does nothing.
   * 
   * @returns The next animation state, or null if can't step forward
   */
  stepForward(): TState | null {
    const { currentOperationIndex, currentAnimationIndex } = this.state;
    
    if (currentOperationIndex === -1) {
      return null; // No operations in history
    }

    const currentOperation = this.operationHistory[currentOperationIndex];
    const maxIndex = currentOperation.states.length - 1;

    if (currentAnimationIndex >= maxIndex) {
      // Already at the final state
      return null;
    }

    const nextIndex = currentAnimationIndex + 1;
    const nextState = currentOperation.states[nextIndex];

    this.setState(prev => ({
      ...prev,
      currentVisualizationState: nextState,
      isAnimating: nextIndex < maxIndex, // We're animating if not at the final state
      currentAnimationIndex: nextIndex,
    }));

    return nextState;
  }

  /**
   * Steps backward to the previous animation state within the current operation.
   * If at the beginning, does nothing.
   * 
   * @returns The previous animation state, or null if can't step backward
   */
  stepBackward(): TState | null {
    const { currentOperationIndex, currentAnimationIndex } = this.state;
    
    if (currentOperationIndex === -1 || currentAnimationIndex <= 0) {
      return null; // No operations or already at first state
    }

    const currentOperation = this.operationHistory[currentOperationIndex];
    const prevIndex = currentAnimationIndex - 1;
    const prevState = currentOperation.states[prevIndex];
    const maxIndex = currentOperation.states.length - 1;

    this.setState(prev => ({
      ...prev,
      currentVisualizationState: prevState,
      isAnimating: prevIndex < maxIndex, // We're animating if not at the final state
      currentAnimationIndex: prevIndex,
    }));

    return prevState;
  }

  /**
   * Starts stepping through the current (most recent) operation from the beginning.
   * Sets the visualization state to the first animation state and enables animation mode.
   * 
   * @returns The first animation state, or null if no operations exist
   */
  startSteppingThroughCurrentOperation(): TState | null {
    const { currentOperationIndex } = this.state;
    
    if (currentOperationIndex === -1) {
      return null; // No operations in history
    }

    const currentOperation = this.operationHistory[currentOperationIndex];
    if (currentOperation.states.length === 0) {
      return null; // Operation has no states
    }

    const firstState = currentOperation.states[0];
    const maxIndex = currentOperation.states.length - 1;

    this.setState(prev => ({
      ...prev,
      currentVisualizationState: firstState,
      isAnimating: maxIndex > 0, // We're animating if there are multiple states
      currentAnimationIndex: 0,
    }));

    return firstState;
  }

  /**
   * Gets the current final state (SSOT).
   */
  getCurrentState(): TState | null {
    return this.state.currentState;
  }

  /**
   * Gets the current visualization state (for display).
   */
  getCurrentVisualizationState(): TState | null {
    return this.state.currentVisualizationState;
  }

  /**
   * Gets all animation states for a specific operation.
   * 
   * @param operationIndex - Index of the operation
   * @returns Array of states for that operation, or empty array if invalid index
   */
  getStates(operationIndex: number): readonly TState[] {
    if (operationIndex < 0 || operationIndex >= this.operationHistory.length) {
      return [];
    }
    return this.operationHistory[operationIndex].states;
  }

  /**
   * Checks if we can step forward in the current operation.
   */
  canStepForward(): boolean {
    const { currentOperationIndex, currentAnimationIndex } = this.state;
    
    if (currentOperationIndex === -1) {
      return false;
    }

    const currentOperation = this.operationHistory[currentOperationIndex];
    return currentAnimationIndex < currentOperation.states.length - 1;
  }

  /**
   * Checks if we can step backward in the current operation.
   */
  canStepBackward(): boolean {
    const { currentAnimationIndex } = this.state;
    return currentAnimationIndex > 0;
  }

  /**
   * Checks if we're currently stepping through animation states.
   */
  isAnimating(): boolean {
    return this.state.isAnimating;
  }

  /**
   * Checks if we can undo.
   */
  canUndo(): boolean {
    return this.operationHistory.length > 0;
  }

  /**
   * Checks if we can redo.
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Gets the complete operation history.
   */
  getHistory(): readonly OperationGroup<TState>[] {
    return this.operationHistory;
  }

  /**
   * Gets the current operation index.
   */
  getCurrentOperationIndex(): number {
    return this.state.currentOperationIndex;
  }

  /**
   * Gets the current animation index within the current operation.
   */
  getCurrentAnimationIndex(): number {
    return this.state.currentAnimationIndex;
  }

  /**
   * Clears all history and resets to initial state.
   */
  clear(newInitialState: TState | null = null): void {
    this.operationHistory = [];
    this.redoStack = [];
    
    this.setState(prev => ({
      ...prev,
      currentState: newInitialState,
      currentVisualizationState: newInitialState,
      isAnimating: false,
      currentOperationIndex: -1,
      currentAnimationIndex: -1,
    }));
  }
}
