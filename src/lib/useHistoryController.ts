/**
 * React Hook for History Controller Integration
 * 
 * This hook provides seamless integration between React components and the HistoryController,
 * handling state synchronization and providing convenient callback methods for UI interactions.
 * It automatically subscribes to controller state changes and provides memoized callbacks
 * for all controller operations.
 * 
 * @template TData The type of data structure being controlled
 * @template TStep The type of visualization steps
 * 
 * @example
 * ```typescript
 * function BSTVisualizer() {
 *   const bstController = useMemo(() => new BSTHistoryController(initialTree), []);
 *   const historyState = useHistoryController(bstController);
 * 
 *   return (
 *     <div>
 *       <button onClick={() => historyState.selectAndVisualize(0)}>
 *         Replay First Operation
 *       </button>
 *       <div>Operations: {historyState.operations.length}</div>
 *       <div>Current Step: {historyState.currentStepIndex}</div>
 *     </div>
 *   );
 * }
 * ```
 */

import { useEffect, useState, useCallback } from 'react';
import type { HistoryController, HistoryControllerState, VisualizationStep } from './HistoryController';

/**
 * React hook for integrating with HistoryController
 * 
 * Provides reactive state management and convenient callback methods for
 * interacting with a HistoryController instance. The hook automatically
 * subscribes to controller state changes and re-renders the component
 * when the state updates.
 * 
 * @param controller - The HistoryController instance to integrate with
 * @returns Combined state and control methods
 * 
 * @example
 * ```typescript
 * // In a React component
 * const controller = useMemo(() => new BSTHistoryController(initialTree), []);
 * const {
 *   operations,
 *   currentState,
 *   isPlaying,
 *   stepForward,
 *   togglePlayback,
 *   selectAndVisualize
 * } = useHistoryController(controller);
 * 
 * // Use state in render
 * <div>Operations performed: {operations.length}</div>
 * 
 * // Use callbacks in event handlers
 * <button onClick={togglePlayback}>
 *   {isPlaying ? 'Pause' : 'Play'}
 * </button>
 * ```
 */
export function useHistoryController<TData = any, TStep extends VisualizationStep = VisualizationStep>(
  controller: HistoryController<TData, TStep>
): HistoryControllerState<TData> & {
  /** Advance to the next step in the current operation */
  stepForward: () => void;
  /** Go back to the previous step in the current operation */
  stepBackward: () => void;
  /** Start or stop automatic playback of the current operation */
  togglePlayback: () => void;
  /** Reset the current operation to its initial state */
  resetVisualization: () => void;
  /** Restart the current operation from the first step */
  restartVisualization: () => void;
  /** Select an operation for visualization without starting playback */
  selectOperation: (index: number) => void;
  /** Select an operation and immediately start visualizing it */
  selectAndVisualize: (index: number) => void;
  /** Clear all history and reset to the provided initial state */
  clearHistory: (initialState: TData) => void;
  /** Get the steps for the currently selected operation */
  getCurrentOperationSteps: () => TStep[];
} {
  const [state, setState] = useState<HistoryControllerState<TData>>(controller.getState());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  const stepForward = useCallback(() => controller.stepForward(), [controller]);
  const stepBackward = useCallback(() => controller.stepBackward(), [controller]);
  const togglePlayback = useCallback(() => controller.togglePlayback(), [controller]);
  const resetVisualization = useCallback(() => controller.resetVisualization(), [controller]);
  const restartVisualization = useCallback(() => controller.restartVisualization(), [controller]);
  const selectOperation = useCallback((index: number) => controller.selectOperation(index), [controller]);
  const selectAndVisualize = useCallback((index: number) => controller.selectAndVisualize(index), [controller]);
  const clearHistory = useCallback((initialState: TData) => controller.clearHistory(initialState), [controller]);
  const getCurrentOperationSteps = useCallback(() => controller.getCurrentOperationSteps(), [controller]);

  return {
    ...state,
    stepForward,
    stepBackward,
    togglePlayback,
    resetVisualization,
    restartVisualization,
    selectOperation,
    selectAndVisualize,
    clearHistory,
    getCurrentOperationSteps,
  };
}
