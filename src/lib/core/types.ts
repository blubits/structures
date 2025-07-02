/**
 * Core types for the generic data structure visualization framework.
 * 
 * This module defines the base interfaces that all data structures must implement
 * to work with the time-machine architecture and animation system.
 */

/**
 * Base interface for all data structure states.
 * All data structures must extend this interface to work with the generic framework.
 */
export interface DataStructureState {
  /** 
   * Animation hints embedded directly in the state.
   * These hints tell the renderer what animations to apply.
   * One hint per atomic visual change - no complex multi-step animations.
   */
  animationHints?: AnimationHint[];
  
  /** 
   * Human-readable description of the current operation step.
   * Examples: "Inserting 42", "Traversing left", "Found node", etc.
   */
  name?: string;
  
  /** 
   * Internal system metadata for rendering assistance.
   * Used by renderers for layout, positioning, or other display concerns.
   */
  _metadata?: Record<string, any>;
}

/**
 * Animation hint for declarative animations.
 * Each hint represents one atomic visual change.
 */
export interface AnimationHint {
  /** Type of animation to apply */
  type: string;
  
  /** Animation-specific configuration */
  metadata?: Record<string, any>;
  
  /** Duration in milliseconds (optional, uses default if not specified) */
  duration?: number;
  
  /** Delay before starting animation in milliseconds */
  delay?: number;
  
  /** Sequence number for ordering multiple animations (lower = earlier) */
  sequence?: number;
}

/**
 * Represents a single operation performed on a data structure.
 */
export interface Operation {
  /** Unique identifier for this operation */
  id: string;
  
  /** Type of operation (e.g., 'insert', 'delete', 'search', 'rotate-left') */
  type: string;
  
  /** Parameters passed to the operation */
  params: Record<string, any>;
  
  /** When the operation was created */
  timestamp: number;
  
  /** Human-readable description of the operation */
  description: string;
}

/**
 * Groups an operation with all its intermediate animation states.
 * The final state (last element in states array) represents the completed operation.
 */
export interface OperationGroup<TState extends DataStructureState = DataStructureState> {
  /** The operation that was performed */
  operation: Operation;
  
  /** 
   * All intermediate states showing the step-by-step execution.
   * Each state represents one atomic step in the operation.
   * The last element is the final state after the operation completes.
   */
  states: readonly TState[];
}

/**
 * Result of performing an operation on a data structure.
 */
export interface OperationResult<TState extends DataStructureState = DataStructureState> {
  /** Whether the operation succeeded */
  success: boolean;
  
  /** 
   * All intermediate states for this operation.
   * Empty array if operation failed.
   */
  states: readonly TState[];
  
  /** Error message if operation failed */
  error?: string;
  
  /** Additional metadata about the operation result */
  metadata?: Record<string, any>;
}

/**
 * Validation result for a data structure state.
 */
export interface ValidationResult {
  /** Whether the state is valid */
  valid: boolean;
  
  /** List of validation errors */
  errors: readonly string[];
  
  /** List of validation warnings */
  warnings?: readonly string[];
}

/**
 * Interface for validating data structure states.
 */
export interface StateValidator<TState extends DataStructureState> {
  /**
   * Validates that a state is consistent and follows the data structure's invariants.
   */
  validate(state: TState): ValidationResult;
}

/**
 * Animation context types for the animation system.
 */

export interface NodeAnimationContext {
  /** The DOM element representing the node */
  element: Element;
  
  /** Animation hint that triggered this animation */
  hint: AnimationHint;
  
  /** Additional context specific to the node */
  nodeData?: any;
  
  /** Callback when animation completes */
  onComplete?: () => void;
}

export interface LinkAnimationContext {
  /** The DOM element representing the link/edge */
  element: Element;
  
  /** Animation hint that triggered this animation */
  hint: AnimationHint;
  
  /** Source node data */
  sourceData?: any;
  
  /** Target node data */
  targetData?: any;
  
  /** Callback when animation completes */
  onComplete?: () => void;
}

export interface TreeAnimationContext {
  /** The root SVG group containing the entire tree */
  container: Element;
  
  /** Animation hints for the entire tree */
  hints: readonly AnimationHint[];
  
  /** Tree data structure */
  treeData?: any;
  
  /** Callback when all animations complete */
  onComplete?: () => void;
}

/**
 * Function signature for node animations.
 */
export type NodeAnimationFunction = (context: NodeAnimationContext) => void;

/**
 * Function signature for link/edge animations.
 */
export type LinkAnimationFunction = (context: LinkAnimationContext) => void;

/**
 * Function signature for tree-wide animations.
 */
export type TreeAnimationFunction = (context: TreeAnimationContext) => void;

/**
 * Creates a new operation with a unique ID and timestamp.
 */
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

/**
 * Creates a successful operation result.
 */
export function createSuccessResult<TState extends DataStructureState>(
  states: readonly TState[],
  metadata?: Record<string, any>
): OperationResult<TState> {
  return {
    success: true,
    states,
    metadata,
  };
}

/**
 * Creates a failed operation result.
 */
export function createErrorResult<TState extends DataStructureState>(
  error: string,
  metadata?: Record<string, any>
): OperationResult<TState> {
  return {
    success: false,
    states: [],
    error,
    metadata,
  };
}

/**
 * Describes how to extract target information from animation hint metadata.
 */
export interface AnimationMetadataSchema {
  /** How to determine the target type (node, link, tree) */
  targetType: 'node' | 'link' | 'tree';
  
  /** For node animations: field name(s) that contain the target node value */
  nodeTargetFields?: string[];
  
  /** For link animations: field names for source and target values */
  linkSourceField?: string;
  linkTargetField?: string;
  
  /** Custom validation function for the metadata */
  validateMetadata?: (metadata: Record<string, any>) => boolean;
  
  /** Extract targets from metadata - returns array of target identifiers */
  extractTargets?: (metadata: Record<string, any>) => string[];
}

/**
 * Animation registration information including metadata schema.
 */
export interface AnimationRegistration {
  /** The animation function */
  animationFunction: NodeAnimationFunction | LinkAnimationFunction | TreeAnimationFunction;
  
  /** Schema describing expected metadata format */
  metadataSchema: AnimationMetadataSchema;
}
