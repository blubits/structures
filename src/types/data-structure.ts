// Generic types for data structure visualization system

/**
 * Base interface for all data structure states
 * Contains common visualization metadata
 */
export interface AnimationHint {
  type: string;
  metadata?: Record<string, any>;
  duration?: number;
  delay?: number;
  sequence?: number;
}

export interface DataStructureState {
  animationHints?: AnimationHint[];
  name?: string;
  _metadata?: Record<string, any>;
}

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

export interface ValidationResult {
  valid: boolean;
  errors: readonly string[];
  warnings?: readonly string[];
}

export interface StateValidator<TState extends DataStructureState> {
  validate(state: TState): ValidationResult;
}

export interface PseudocodeLine {
  lineNumber: number;
  content: string;
  indentLevel: number;
}

export interface OperationWithPseudocode extends Operation {
  pseudocode: PseudocodeLine[];
  generateStates(initialState: DataStructureState): DataStructureState[];
  generateHighlights(states: DataStructureState[], stepIndex: number): number[];
}

export interface DataStructureElement {
  id?: string;
  metadata?: Record<string, any>;
}

export interface AnimationMetadataSchema {
  targetType: 'node' | 'link' | 'tree';
  nodeTargetFields?: string[];
  linkSourceField?: string;
  linkTargetField?: string;
  validateMetadata?: (metadata: Record<string, any>) => boolean;
  extractTargets?: (metadata: Record<string, any>) => string[];
}

export interface AnimationRegistration {
  animationFunction: any; // Updated to generic type, since specific animation function types are removed
  metadataSchema: AnimationMetadataSchema;
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
