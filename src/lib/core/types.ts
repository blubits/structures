/**
 * Animation system types and helpers
 * (All core data structure types have been moved to data-structure.ts)
 */

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

/**
 * Standard interface for any data structure element (node, item, etc).
 * Provides a unique id and optional metadata for all elements.
 */
export interface DataStructureElement {
  id?: string;
  metadata?: Record<string, any>;
}
