import type { AnimationHint } from './animations';

// Generic types for data structure visualization system

/**
 * Base interface for all data structure states with enhanced abstract base class functionality.
 * All data structures must implement these methods to ensure consistency and extensibility.
 */
export interface DataStructureState {
  animationHints?: AnimationHint[];
  name?: string;
  _metadata?: Record<string, any>;
  
  // Abstract base class methods that all data structures must implement
  
  /**
   * Serializes the structure for storage or transmission.
   * Must return a JSON-serializable representation of the current state.
   */
  toJSON(): Record<string, any>;
  
  /**
   * Preserves element identity between states for smooth visual transitions.
   * This is crucial for animation systems that track element identity.
   * @param prevState - The previous state to reconcile with
   * @returns A new state with preserved element identities where possible
   */
  reconcile(prevState: DataStructureState | null): DataStructureState;
  
  /**
   * Returns a validation result for the current state.
   * Implementations should check structural integrity and data consistency.
   */
  validate(): ValidationResult;
}

/**
 * Static methods interface for data structure classes.
 * Defines factory and deserialization methods that must be implemented as static methods.
 */
export interface DataStructureClass<T extends DataStructureState> {
  /**
   * Deserializes from JSON representation.
   * Must be implemented as a static method on concrete classes.
   * @param json - JSON representation from toJSON()
   * @returns A new instance of the data structure
   */
  from(json: Record<string, any>): T;
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

/**
 * Base interface for all data structure elements with enhanced functionality.
 * Elements are the individual components (nodes, cells, etc.) within a data structure.
 */
export interface DataStructureElement {
  id?: string;
  metadata?: Record<string, any>;
  
  /**
   * Creates a deep copy of the element with optional updates.
   * Ensures immutability by returning a new instance.
   * @param updates - Partial updates to apply to the copied element
   * @returns A new element instance with updates applied
   */
  clone(updates?: Partial<this>): this;
}
