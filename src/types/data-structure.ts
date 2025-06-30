// Generic types for data structure visualization system

/**
 * Base interface for all data structure states
 * Contains common visualization metadata
 */
export interface DataStructureState {
  animationHints?: Array<{
    type: string;
    metadata?: Record<string, any>;
  }>;
  name?: string; // Operation description: "Inserting 42", "Traversing left", etc.
  _metadata?: any; // Internal system metadata for rendering assistance
}

/**
 * Represents a single operation performed on a data structure
 */
export interface Operation {
  id: string;
  type: string; // 'insert', 'delete', 'search'
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
  states: TState[]; // Animation states for this operation (final state is last element)
}

/**
 * Animation function type for nodes
 */
export type NodeAnimationFunction = (context: NodeAnimationContext) => void;

/**
 * Animation function type for links/edges
 */
export type LinkAnimationFunction = (context: LinkAnimationContext) => void;

/**
 * Context passed to node animations
 */
export interface NodeAnimationContext {
  element: SVGElement;
  node: any; // The data structure node
  metadata?: Record<string, any>;
}

/**
 * Context passed to link animations
 */
export interface LinkAnimationContext {
  element: SVGElement;
  sourceNode: any;
  targetNode: any;
  metadata?: Record<string, any>;
}

/**
 * Context passed to tree-level animations
 */
export interface TreeAnimationContext {
  container: SVGElement;
  state: DataStructureState;
  metadata?: Record<string, any>;
}
