import { useMemo, useCallback, useSyncExternalStore } from 'react';
import type { DataStructureState } from '@/types/data-structure';
import type { Operation, OperationGroup } from '@/types/operations';
import type { HistoryController } from '@/lib/core/History';

/**
 * Hook return type for history controllers.
 */
export interface UseHistoryResult<
  TState extends DataStructureState,
  TController extends HistoryController<TState>
> {
  /** The controller instance */
  controller: TController;
  
  /** Current final state (SSOT) - result of the last completed operation */
  currentState: TState | null;
  
  /** Current visualization state (for display) - may be an intermediate animation state */
  currentVisualizationState: TState | null;
  
  /** Whether we're currently stepping through animation states within an operation */
  isAnimating: boolean;
  
  /** Current operation index in history */
  currentOperationIndex: number;
  
  /** Current animation index within the current operation */
  currentAnimationIndex: number;
  
  // Navigation methods
  /** Steps forward to the next animation state within the current operation */
  stepForward: () => TState | null;
  
  /** Steps backward to the previous animation state within the current operation */
  stepBackward: () => TState | null;
  
  /** Undoes the last operation */
  undo: () => { state: TState | null; operation: Operation | null };
  
  /** Redoes the next operation */
  redo: () => { state: TState | null; operation: Operation | null };
  
  /** Jumps directly to a specific operation in the history */
  jumpTo: (operationIndex: number) => TState | null;
  
  // Capability checks
  /** Whether we can step forward in the current operation */
  canStepForward: boolean;
  
  /** Whether we can step backward in the current operation */
  canStepBackward: boolean;
  
  /** Whether we can undo the last operation */
  canUndo: boolean;
  
  /** Whether we can redo the next operation */
  canRedo: boolean;
  
  // History access
  /** Complete operation history */
  history: readonly OperationGroup<TState>[];
  
  /** Clears all history and resets to initial state */
  clear: (newInitialState?: TState | null) => void;
}

/**
 * Generic React hook for data structure controllers.
 * 
 * Provides reactive state management for any data structure that extends
 * HistoryController. Uses React's useSyncExternalStore
 * for optimal performance and consistency.
 * 
 * @param ControllerClass - Constructor for the controller class
 * @param initialState - Initial state for the data structure
 * @param dependencies - Additional dependencies that should trigger controller recreation
 * @returns Hook result with controller instance and reactive state
 */
export function useHistory<
  TState extends DataStructureState,
  TController extends HistoryController<TState>
>(
  ControllerClass: new (initialState: TState | null, ...args: any[]) => TController,
  initialState: TState | null = null,
  dependencies: React.DependencyList = []
): UseHistoryResult<TState, TController> {
  // Create controller instance (stable across re-renders unless dependencies change)
  const controller = useMemo(() => {
    return new ControllerClass(initialState);
  }, [ControllerClass, ...dependencies]);

  // Subscribe to controller state changes using React's useSyncExternalStore
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot
  );

  // Create stable callback functions
  const stepForward = useCallback(() => {
    return controller.stepForward();
  }, [controller]);

  const stepBackward = useCallback(() => {
    return controller.stepBackward();
  }, [controller]);

  const undo = useCallback(() => {
    return controller.undo();
  }, [controller]);

  const redo = useCallback(() => {
    return controller.redo();
  }, [controller]);

  const jumpTo = useCallback((operationIndex: number) => {
    return controller.jumpTo(operationIndex);
  }, [controller]);

  const clear = useCallback((newInitialState?: TState | null) => {
    controller.clear(newInitialState);
  }, [controller]);

  // Get history (this is stable as the controller returns the same reference)
  const history = controller.getHistory();

  return {
    controller,
    currentState: (state as any).currentState,
    currentVisualizationState: (state as any).currentVisualizationState,
    isAnimating: (state as any).isAnimating,
    currentOperationIndex: (state as any).currentOperationIndex,
    currentAnimationIndex: (state as any).currentAnimationIndex,
    
    // Navigation methods
    stepForward,
    stepBackward,
    undo,
    redo,
    jumpTo,
    
    // Capability checks
    canStepForward: controller.canStepForward(),
    canStepBackward: controller.canStepBackward(),
    canUndo: controller.canUndo(),
    canRedo: controller.canRedo(),
    
    // History access
    history,
    clear,
  };
}
