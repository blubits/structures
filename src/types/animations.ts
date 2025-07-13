// Animation-related type definitions for visualization system

export interface AnimationHint {
  type: string;
  metadata?: Record<string, any>;
  duration?: number;
  delay?: number;
  sequence?: number;
}

export interface AnimationMetadataSchema {
  targetType: string;
  nodeTargetFields?: string[];
  linkSourceField?: string;
  linkTargetField?: string;
  validateMetadata?: (metadata: Record<string, any>) => boolean;
  extractTargets?: (metadata: Record<string, any>) => string[];
}

export interface AnimationRegistration {
  animationFunction: any;
  metadataSchema: AnimationMetadataSchema;
}
