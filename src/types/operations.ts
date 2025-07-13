import type { DataStructureState, PseudocodeLine } from './data-structure';

/**
 * Represents a single operation performed on a data structure
 */
export interface Operation {
  id: string;
  type: string;
  params: Record<string, any>;
  timestamp: number;
  description: string;
}

/**
 * Groups an operation with all its animation states
 * The last element in states array is the final state after operation completes
 */
export interface OperationGroup<TState extends DataStructureState = DataStructureState> {
  operation: Operation;
  states: readonly TState[];
}

export interface OperationResult<TState extends DataStructureState = DataStructureState> {
  success: boolean;
  states: readonly TState[];
  error?: string;
  metadata?: Record<string, any>;
}

export interface OperationWithPseudocode extends Operation {
  pseudocode: PseudocodeLine[];
  generateStates(initialState: DataStructureState): DataStructureState[];
  generateHighlights(states: DataStructureState[], stepIndex: number): number[];
}

export function createOperation(
  type: string,
  params: Record<string, any>,
  description: string
): Operation {
  return {
    id: crypto.randomUUID(),
    type,
    params,
    timestamp: Date.now(),
    description,
  };
}
