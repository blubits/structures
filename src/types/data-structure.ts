import type { AnimationHint } from './animations';

// Generic types for data structure visualization system

/**
 * Base interface for all data structure states
 * Contains common visualization metadata
 */
export interface DataStructureState {
  animationHints?: AnimationHint[];
  name?: string;
  _metadata?: Record<string, any>;
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

export interface DataStructureElement {
  id?: string;
  metadata?: Record<string, any>;
}
