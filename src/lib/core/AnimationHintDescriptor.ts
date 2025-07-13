import type { AnimationHint, AnimationMetadataSchema } from '@/types/animations';
import type { GenericAnimationContext } from '@/lib/core/AnimationController';

/**
 * Developer-friendly animation hint descriptor type
 */
export type AnimationHintDescriptor<Params extends object = any> = {
  type: string;
  create: (params: Params & { duration?: number }) => AnimationHint;
  animationFunction: (context: GenericAnimationContext) => void;
  metadataSchema: AnimationMetadataSchema;
  elementType: string;
};

/**
 * Helper to define an animation hint descriptor
 */
export function defineAnimationHint<Params extends object>(
  config: Omit<AnimationHintDescriptor<Params>, 'create'> & {
    create: (params: Params & { duration?: number }) => AnimationHint;
  }
): AnimationHintDescriptor<Params> {
  return config;
}
