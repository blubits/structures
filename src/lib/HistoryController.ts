// Animation instruction types
export interface NodeAnimationInstruction {
  type: 'node';
  nodeValue: number;
  animation: 'pulse' | 'fade' | 'shrink-disappear' | 'grow-appear' | 'rewind';
  duration?: number;
}

export interface LinkAnimationInstruction {
  type: 'link';
  fromValue: number;
  toValue: number;
  animation: 'forward-traverse' | 'reverse-traverse' | 'pulse';
  duration?: number;
}

export type AnimationInstruction = NodeAnimationInstruction | LinkAnimationInstruction;

export interface AnimationInstructions {
  instructions: AnimationInstruction[];
  stepDirection: 'forward' | 'backward' | null;
}

// Generic types for any data structure
export interface VisualizationStep<TData = any> {
  operation: string;
  metadata: {
    description: string;
    [key: string]: any;
  };
  // Optional mutated state at this step - if present, the data structure
  // will be updated to this state when stepping forward to this step
  mutatedState?: TData;
  // Additional step-specific data can be added here
}

export interface Operation<TData = any, TStep extends VisualizationStep<TData> = VisualizationStep<TData>> {
  id: string;
  type: string; // 'insert', 'search', 'delete', etc.
  value?: any; // The value being operated on (if applicable)
  timestamp: number;
  description: string;
  steps: TStep[];
  // State before the operation
  initialState: TData;
  // State after the operation (if it mutates the data structure)
  // Note: This is still supported for backward compatibility, but
  // operations with multiple mutations should use step.mutatedState instead
  resultingState?: TData;
  // Whether this operation mutates the data structure
  isMutating: boolean;
}

export interface HistoryControllerState<TData = any> {
  // All operations performed
  operations: Operation<TData>[];
  // Current data structure state
  currentState: TData;
  // Currently selected operation for visualization (-1 means none)
  selectedOperationIndex: number;
  // Current step within the selected operation (-1 means before first step)
  currentStepIndex: number;
  // Whether we're currently playing through steps automatically
  isPlaying: boolean;
  // Whether we're currently executing a new operation
  isExecuting: boolean;
}

export type HistoryControllerListener<TData = any> = (state: HistoryControllerState<TData>) => void;

/**
 * A generic history controller for visualizing data structure operations.
 * 
 * This class provides a comprehensive solution for managing operation history and step-by-step
 * visualization for any data structure. It handles:
 * 
 * - Operation execution and state management
 * - Step-by-step visualization with playback controls
 * - Multiple mutations within a single operation (e.g., tree rotations)
 * - History navigation and replay
 * - State synchronization and listener notifications
 * 
 * @template TData The type of the data structure being visualized
 * @template TStep The type of visualization steps, extending VisualizationStep
 * 
 * @example
 * ```typescript
 * const controller = new HistoryController<BinaryTreeNode, BSTStep>(initialTree);
 * 
 * // Execute a simple operation
 * await controller.executeOperation('insert', 5, generateInsertSteps, applyInsert);
 * 
 * // Execute an operation with multiple mutations (e.g., tree rotation)
 * await controller.executeOperation('rotate', 'left', generateRotationSteps);
 * // Where generateRotationSteps returns steps with mutatedState at each rotation point
 * 
 * // Navigate history
 * controller.selectOperation(0);
 * controller.togglePlayback();
 * ```
 */
export class HistoryController<TData = any, TStep extends VisualizationStep<TData> = VisualizationStep<TData>> {
  private state: HistoryControllerState<TData>;
  private listeners: Set<HistoryControllerListener<TData>> = new Set();
  private playTimer: NodeJS.Timeout | null = null;
  private playbackSpeed: number = 1500; // ms between steps

  /**
   * Creates a new HistoryController instance
   * 
   * @param initialState The initial state of the data structure
   * 
   * @example
   * ```typescript
   * const bstController = new HistoryController<BinaryTreeNode>(initialTree);
   * const listController = new HistoryController<ListNode>(initialList);
   * ```
   */
  constructor(initialState: TData) {
    this.state = {
      operations: [],
      currentState: initialState,
      selectedOperationIndex: -1,
      currentStepIndex: -1,
      isPlaying: false,
      isExecuting: false,
    };
  }

  /**
   * Subscribe to state changes
   * 
   * Registers a listener function that will be called whenever the controller's state changes.
   * The listener is immediately called with the current state upon subscription.
   * 
   * @param listener Function to call when state changes
   * @returns Unsubscribe function to remove the listener
   * 
   * @example
   * ```typescript
   * const unsubscribe = controller.subscribe((state) => {
   *   console.log('Current operation count:', state.operations.length);
   *   updateUI(state);
   * });
   * 
   * // Later, remove the listener
   * unsubscribe();
   * ```
   */
  subscribe(listener: HistoryControllerListener<TData>): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state changes
   * 
   * This is called internally whenever the state is modified to ensure
   * all subscribed components are updated with the latest state.
   * 
   * @private
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  /**
   * Get current state (read-only)
   * 
   * Returns a read-only copy of the current state. This is useful for
   * one-time state queries without subscribing to changes.
   * 
   * @returns A read-only copy of the current state
   * 
   * @example
   * ```typescript
   * const currentState = controller.getState();
   * console.log('Current step:', currentState.currentStepIndex);
   * ```
   */
  getState(): Readonly<HistoryControllerState<TData>> {
    return { ...this.state };
  }

  /**
   * Execute a new operation on the data structure
   * 
   * This is the main method for performing operations on the data structure.
   * It handles step generation, state management, and history tracking.
   * 
   * @param operationType The type of operation (e.g., 'insert', 'search', 'delete')
   * @param operationValue The value to operate on (if applicable)
   * @param generateSteps Function that generates visualization steps for the operation
   * @param applyOperation Optional function to apply the operation to the data structure
   * @param description Optional custom description for the operation
   * 
   * @throws {Error} If another operation is already executing
   * 
   * @example
   * ```typescript
   * // Non-mutating operation (search)
   * await controller.executeOperation(
   *   'search',
   *   5,
   *   (state, value) => generateSearchSteps(state, value),
   *   undefined,
   *   'Search for 5'
   * );
   * 
   * // Mutating operation (insert)
   * await controller.executeOperation(
   *   'insert',
   *   7,
   *   (state, value) => generateInsertSteps(state, value),
   *   (state, value) => insertIntoTree(state, value),
   *   'Insert 7'
   * );
   * ```
   */
  async executeOperation(
    operationType: string,
    operationValue: any,
    generateSteps: (currentState: TData, value: any) => TStep[],
    applyOperation?: (currentState: TData, value: any) => TData,
    description?: string
  ): Promise<void> {
    if (this.state.isExecuting) {
      throw new Error('Another operation is already executing');
    }

    this.state.isExecuting = true;
    this.notifyListeners();

    try {
      // Commit any pending mutations before starting new operation
      this.commitPendingMutations();

      const isMutating = !!applyOperation;
      const operationDescription = description || `${operationType} ${operationValue || ''}`.trim();

      // Generate steps for the operation
      const steps = generateSteps(this.state.currentState, operationValue);

      // Calculate resulting state if this is a mutating operation
      const resultingState = isMutating 
        ? applyOperation!(this.state.currentState, operationValue)
        : undefined;

      // Create the operation
      const operation: Operation<TData, TStep> = {
        id: `${operationType}-${Date.now()}`,
        type: operationType,
        value: operationValue,
        timestamp: Date.now(),
        description: operationDescription,
        steps,
        initialState: JSON.parse(JSON.stringify(this.state.currentState)), // Deep copy
        resultingState: resultingState ? JSON.parse(JSON.stringify(resultingState)) : undefined,
        isMutating,
      };

      // Add to operations history
      this.state.operations.push(operation);
      
      // Select this operation for visualization
      this.state.selectedOperationIndex = this.state.operations.length - 1;
      this.state.currentStepIndex = -1;
      this.state.isPlaying = true;

      // For mutating operations, we keep the current state until visualization completes
      // For non-mutating operations, state doesn't change
      
      this.state.isExecuting = false;
      this.notifyListeners();

      // Start auto-playback
      this.startAutoPlayback();

    } catch (error) {
      this.state.isExecuting = false;
      this.notifyListeners();
      throw error;
    }
  }

  /**
   * Commit any pending mutations (called before starting new operations)
   * 
   * This method ensures that any mutating operations that have been visualized
   * are properly applied to the current state before executing new operations.
   * This prevents state inconsistencies when switching between operations.
   * 
   * @private
   */
  private commitPendingMutations(): void {
    if (this.state.selectedOperationIndex >= 0) {
      const selectedOp = this.state.operations[this.state.selectedOperationIndex];
      if (selectedOp?.isMutating) {
        console.log('Committing pending mutation before new operation');
        
        // For operations with step-based mutations, find the final mutated state
        if (this.state.currentStepIndex >= 0) {
          // Find the last mutation in the visualized steps
          let finalState = selectedOp.initialState;
          for (let i = 0; i <= this.state.currentStepIndex; i++) {
            if (selectedOp.steps[i]?.mutatedState) {
              finalState = selectedOp.steps[i].mutatedState!;
            }
          }
          this.state.currentState = JSON.parse(JSON.stringify(finalState));
        }
        // Fallback to legacy resultingState approach
        else if (selectedOp.resultingState) {
          this.state.currentState = JSON.parse(JSON.stringify(selectedOp.resultingState));
        }
      }
    }
  }

  /**
   * Select an operation from history for visualization
   * 
   * Prepares the specified operation for step-by-step visualization by
   * setting up the appropriate initial state and resetting playback controls.
   * 
   * @param index The index of the operation to select (0-based)
   * 
   * @example
   * ```typescript
   * // Select the first operation for visualization
   * controller.selectOperation(0);
   * 
   * // Now you can use step controls or start playback
   * controller.togglePlayback();
   * ```
   */
  selectOperation(index: number): void {
    if (index < 0 || index >= this.state.operations.length) {
      return;
    }

    this.stopAutoPlayback();
    
    const operation = this.state.operations[index];
    this.state.selectedOperationIndex = index;
    this.state.currentStepIndex = -1;
    this.state.isPlaying = false;

    // Set the appropriate initial state for visualization
    if (operation.isMutating) {
      // For mutating operations, start with the pre-operation state
      this.state.currentState = JSON.parse(JSON.stringify(operation.initialState));
    } else {
      // For non-mutating operations, use the state that existed when the operation was performed
      this.state.currentState = JSON.parse(JSON.stringify(operation.initialState));
    }

    this.notifyListeners();
  }

  /**
   * Select an operation and start visualization
   * 
   * Convenience method that combines selectOperation() and automatic playback.
   * This is typically used when clicking on a history item to immediately
   * start visualizing that operation.
   * 
   * @param index The index of the operation to select and visualize
   * 
   * @example
   * ```typescript
   * // Select and immediately start visualizing the second operation
   * controller.selectAndVisualize(1);
   * ```
   */
  selectAndVisualize(index: number): void {
    this.selectOperation(index);
    if (this.state.selectedOperationIndex >= 0) {
      this.startAutoPlayback();
    }
  }

  /**
   * Step forward through the current operation
   * 
   * Advances to the next step in the currently selected operation.
   * If the step contains a mutated state, applies that mutation.
   * Does nothing if no operation is selected or if already at the last step.
   * 
   * @example
   * ```typescript
   * controller.selectOperation(0);
   * controller.stepForward(); // Go to step 1
   * controller.stepForward(); // Go to step 2
   * ```
   */
  stepForward(): void {
    if (this.state.selectedOperationIndex < 0) return;
    
    const operation = this.state.operations[this.state.selectedOperationIndex];
    if (this.state.currentStepIndex >= operation.steps.length - 1) return;

    this.state.currentStepIndex++;
    
    const currentStep = operation.steps[this.state.currentStepIndex];
    
    // Apply step-specific mutation if present
    if (currentStep.mutatedState) {
      this.state.currentState = JSON.parse(JSON.stringify(currentStep.mutatedState));
    }
    // Fallback to legacy behavior: apply final mutation at the last step
    else if (this.state.currentStepIndex === operation.steps.length - 1 && 
             operation.isMutating && 
             operation.resultingState) {
      this.state.currentState = JSON.parse(JSON.stringify(operation.resultingState));
    }

    this.notifyListeners();
  }

  /**
   * Step backward through the current operation
   * 
   * Goes back to the previous step in the currently selected operation.
   * Restores the appropriate state for the previous step by either using
   * the previous step's mutated state or the operation's initial state.
   * Does nothing if no operation is selected or if already at the beginning.
   * 
   * @example
   * ```typescript
   * controller.selectOperation(0);
   * controller.stepForward(); // Go to step 1
   * controller.stepBackward(); // Go back to step 0
   * ```
   */
  stepBackward(): void {
    if (this.state.selectedOperationIndex < 0 || this.state.currentStepIndex <= 0) return;

    const operation = this.state.operations[this.state.selectedOperationIndex];
    
    this.state.currentStepIndex--;
    
    // Restore the appropriate state for the new current step
    if (this.state.currentStepIndex === 0) {
      // We're now at the first step, apply the first step's state
      const firstStep = operation.steps[0];
      if (firstStep.mutatedState) {
        this.state.currentState = JSON.parse(JSON.stringify(firstStep.mutatedState));
      } else {
        // No mutation in first step, use initial state
        this.state.currentState = JSON.parse(JSON.stringify(operation.initialState));
      }
    } else {
      // We're at a specific step, check if we need to restore a mutated state
      const currentStep = operation.steps[this.state.currentStepIndex];
      if (currentStep.mutatedState) {
        // This step has a mutation, apply it
        this.state.currentState = JSON.parse(JSON.stringify(currentStep.mutatedState));
      } else {
        // This step doesn't have a mutation, we need to find the last mutation before this step
        let lastMutatedState = operation.initialState;
        for (let i = 0; i <= this.state.currentStepIndex; i++) {
          if (operation.steps[i].mutatedState) {
            lastMutatedState = operation.steps[i].mutatedState!;
          }
        }
        this.state.currentState = JSON.parse(JSON.stringify(lastMutatedState));
      }
    }

    this.notifyListeners();
  }

  /**
   * Toggle automatic playback of the current operation
   * 
   * Starts or stops automatic step-by-step playback of the currently
   * selected operation. If already playing, it stops; if stopped, it starts.
   * 
   * @example
   * ```typescript
   * controller.selectOperation(0);
   * controller.togglePlayback(); // Start playing
   * // ... wait for steps to complete
   * controller.togglePlayback(); // Stop playing
   * ```
   */
  togglePlayback(): void {
    if (this.state.selectedOperationIndex < 0) return;

    if (this.state.isPlaying) {
      this.stopAutoPlayback();
    } else {
      this.startAutoPlayback();
    }
  }

  /**
   * Start automatic playback of the current operation
   * 
   * Begins automatically advancing through steps of the currently selected
   * operation at the configured playback speed (1.5 seconds per step).
   * 
   * @private
   */
  private startAutoPlayback(): void {
    if (this.state.selectedOperationIndex < 0) return;
    
    this.state.isPlaying = true;
    this.notifyListeners();
    
    this.scheduleNextStep();
  }

  /**
   * Stop automatic playback
   * 
   * Stops the automatic step progression and clears any pending timers.
   * 
   * @private
   */
  private stopAutoPlayback(): void {
    this.state.isPlaying = false;
    if (this.playTimer) {
      clearTimeout(this.playTimer);
      this.playTimer = null;
    }
    this.notifyListeners();
  }

  /**
   * Schedule the next step in automatic playback
   * 
   * Sets up a timer to automatically advance to the next step after
   * the configured playback delay. Stops if we've reached the end
   * of the operation or if playback has been stopped.
   * 
   * @private
   */
  private scheduleNextStep(): void {
    if (!this.state.isPlaying || this.state.selectedOperationIndex < 0) return;

    const operation = this.state.operations[this.state.selectedOperationIndex];
    
    // Check if we've reached the end
    if (this.state.currentStepIndex >= operation.steps.length - 1) {
      this.stopAutoPlayback();
      return;
    }

    this.playTimer = setTimeout(() => {
      this.stepForward();
      this.scheduleNextStep();
    }, this.playbackSpeed);
  }

  /**
   * Reset current operation visualization
   * 
   * Resets the currently selected operation back to its initial state,
   * stopping any playback and returning to step -1 (before first step).
   * 
   * @example
   * ```typescript
   * controller.selectOperation(0);
   * controller.stepForward();
   * controller.stepForward();
   * controller.resetVisualization(); // Back to beginning
   * ```
   */
  resetVisualization(): void {
    if (this.state.selectedOperationIndex < 0) return;

    this.stopAutoPlayback();
    
    const operation = this.state.operations[this.state.selectedOperationIndex];
    this.state.currentStepIndex = -1;
    
    // Reset to initial state
    this.state.currentState = JSON.parse(JSON.stringify(operation.initialState));
    
    this.notifyListeners();
  }

  /**
   * Restart current operation visualization
   * 
   * Resets the currently selected operation back to the first step (step 0)
   * instead of dismissing it entirely. This maintains the operation context
   * while allowing users to replay from the beginning.
   * 
   * @example
   * ```typescript
   * controller.selectOperation(0);
   * controller.stepForward();
   * controller.stepForward();
   * controller.restartVisualization(); // Back to step 0
   * ```
   */
  restartVisualization(): void {
    if (this.state.selectedOperationIndex < 0) return;

    this.stopAutoPlayback();
    
    const operation = this.state.operations[this.state.selectedOperationIndex];
    this.state.currentStepIndex = 0;
    
    // Set to initial state but keep the operation selected
    this.state.currentState = JSON.parse(JSON.stringify(operation.initialState));
    
    // Apply the first step if it has a mutation
    const firstStep = operation.steps[0];
    if (firstStep?.mutatedState) {
      this.state.currentState = JSON.parse(JSON.stringify(firstStep.mutatedState));
    }
    
    this.notifyListeners();
  }

  /**
   * Clear all history and reset to initial state
   * 
   * Removes all operations from history and resets the controller to its
   * initial state with the provided data structure state.
   * 
   * @param initialState The initial state to reset to
   * 
   * @example
   * ```typescript
   * // Reset everything back to the original tree
   * controller.clearHistory(originalTree);
   * ```
   */
  clearHistory(initialState: TData): void {
    this.stopAutoPlayback();
    
    this.state = {
      operations: [],
      currentState: JSON.parse(JSON.stringify(initialState)),
      selectedOperationIndex: -1,
      currentStepIndex: -1,
      isPlaying: false,
      isExecuting: false,
    };
    
    this.notifyListeners();
  }

  /**
   * Set playback speed for automatic visualization
   * 
   * Configures how fast automatic playback progresses through steps.
   * 
   * @param speedMs The delay between steps in milliseconds
   * 
   * @example
   * ```typescript
   * controller.setPlaybackSpeed(1000); // 1 second per step
   * controller.setPlaybackSpeed(500);  // 0.5 seconds per step (faster)
   * ```
   */
  setPlaybackSpeed(speedMs: number): void {
    this.playbackSpeed = speedMs;
  }

  /**
   * Get current operation steps (for visualization)
   * 
   * Returns the array of visualization steps for the currently selected
   * operation. Returns empty array if no operation is selected.
   * 
   * @returns Array of steps for the current operation
   * 
   * @example
   * ```typescript
   * const steps = controller.getCurrentOperationSteps();
   * console.log(`Current operation has ${steps.length} steps`);
   * ```
   */
  getCurrentOperationSteps(): TStep[] {
    if (this.state.selectedOperationIndex < 0) return [];
    return (this.state.operations[this.state.selectedOperationIndex]?.steps || []) as TStep[];
  }

  /**
   * Get current operation details
   * 
   * Returns the complete operation object for the currently selected operation,
   * or null if no operation is selected.
   * 
   * @returns The current operation object or null
   * 
   * @example
   * ```typescript
   * const operation = controller.getCurrentOperation();
   * if (operation) {
   *   console.log(`Current operation: ${operation.type} (${operation.description})`);
   * }
   * ```
   */
  getCurrentOperation(): Operation<TData, TStep> | null {
    if (this.state.selectedOperationIndex < 0) return null;
    return (this.state.operations[this.state.selectedOperationIndex] || null) as Operation<TData, TStep> | null;
  }

  /**
   * Generate animation instructions for the current step
   * 
   * This method should be overridden by specific implementations to provide
   * context-aware animation instructions based on the step content.
   * 
   * @returns Animation instructions for the renderer
   */
  getAnimationInstructions(): AnimationInstructions {
    return {
      instructions: [],
      stepDirection: null
    };
  }

  /**
   * Cleanup controller resources
   * 
   * Stops any running timers and clears all listeners. Should be called
   * when the controller is no longer needed to prevent memory leaks.
   * 
   * @example
   * ```typescript
   * // In React useEffect cleanup
   * useEffect(() => {
   *   return () => {
   *     controller.destroy();
   *   };
   * }, [controller]);
   * ```
   */
  destroy(): void {
    this.stopAutoPlayback();
    this.listeners.clear();
  }
}
