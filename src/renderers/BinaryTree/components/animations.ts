/**
 * Binary Tree Animation Configuration
 * 
 * Configures the AnimationController for binary tree visualizations.
 * This replaces the old rigid system with a flexible approach that defines
 * how binary tree animations work within the generic framework.
 */

import { AnimationController, createSimpleHintProcessor, createSimpleElementAnimationExecutor } from '@/lib/core/AnimationController';
import { defineAnimationHint, type AnimationHintDescriptor } from '@/lib/core/AnimationHintDescriptor';
import type {
  VisualizationAnimationConfig,
  GenericAnimationContext
} from '@/lib/core/AnimationController';
import type { AnimationHint } from '@/lib/core/types';
import * as d3 from 'd3';
import { BINARY_TREE_COLORS } from '@/renderers/BinaryTree/config.colors';

// =============================================================================
// ANIMATION HINT DESCRIPTOR SYSTEM
// =============================================================================

// (Moved to core. Use imported types and helpers.)

// =============================================================================
// BINARY TREE ANIMATION FUNCTIONS (move up for hoisting)
// =============================================================================

/**
 * Traverse down animation - shows a pulsing dot traveling from source to target
 * The link itself remains unchanged, only the traveling dot is animated
 */
const traverseDownAnimation = (context: GenericAnimationContext): void => {
  const { element, hint } = context;
  const duration = hint.duration || 600;
  
  if (import.meta.env.DEV) {
    console.log('🎬 Executing traverse-down animation:', {
      elementType: element.tagName,
      duration,
      metadata: hint.metadata
    });
  }
  
  // Find the actual DOM positions by looking at the link's coordinates
  const linkElement = d3.select(element as SVGLineElement);
  const x1 = parseFloat(linkElement.attr('x1') || '0');
  const y1 = parseFloat(linkElement.attr('y1') || '0');
  const x2 = parseFloat(linkElement.attr('x2') || '0');
  const y2 = parseFloat(linkElement.attr('y2') || '0');
  
  if (import.meta.env.DEV) {
    console.log('🎬 Animation coordinates:', { x1, y1, x2, y2 });
  }
  
  if (!element.parentNode) {
    console.warn('Animation element has no parent node');
    context.onComplete?.();
    return;
  }

  // Get the links group (parent of the link element)
  const linksGroup = d3.select(element.parentNode as Element);
  
  // Create unique class name for the traveling dot
  const dotClass = `traveling-dot-${hint.metadata?.sourceValue || 'unknown'}-${hint.metadata?.targetValue || 'unknown'}-${Date.now()}`;
  
  // Remove any existing dots to prevent accumulation
  linksGroup.selectAll('[class*="traveling-dot-"]').remove();

  // Create the traveling dot (similar to the original forwardTraverse)
  const theme = 'light'; // Use light theme by default, or pass as param if needed
  const dot = linksGroup
    .append('circle')
    .attr('class', dotClass)
    .attr('r', 4)
    .attr('fill', BINARY_TREE_COLORS[theme].node.active)
    .attr('stroke', BINARY_TREE_COLORS[theme].node.border.active)
    .attr('stroke-width', 2)
    .attr('opacity', 0)
    .attr('cx', x1)
    .attr('cy', y1);

  if (import.meta.env.DEV) {
    console.log('🎬 Created traveling dot:', dotClass);
  }

  // Animate the dot appearing, traveling, and disappearing
  // Step 1: Fade in
  dot
    .transition()
    .duration(100)
    .attr('opacity', 0.9)
    .on('end', () => {
      if (import.meta.env.DEV) {
        console.log('🎬 Fade-in complete, starting travel from:', { x1, y1, x2, y2 });
      }
      
      // Step 2: Travel from source to target
      dot
        .transition()
        .duration(duration)
        .ease(d3.easeQuadInOut)
        .attr('cx', x2)
        .attr('cy', y2)
        .on('end', () => {
          if (import.meta.env.DEV) {
            console.log('🎬 Travel complete, starting fade-out');
          }
          
          // Step 3: Fade out and expand
          dot
            .transition()
            .duration(200)
            .attr('opacity', 0)
            .attr('r', 6)
            .on('end', () => {
              // Clean up the dot element
              dot.remove();
              if (import.meta.env.DEV) {
                console.log('🎬 Animation completed:', dotClass);
              }
              context.onComplete?.();
            });
        });
    });
};

// =============================================================================
// BINARY TREE ANIMATION HINTS (DESCRIPTORS)
// =============================================================================

export interface TraverseDownParams {
  sourceValue: number;
  targetValue: number;
}

export const traverseDown = defineAnimationHint<TraverseDownParams>({
  type: 'traverse-down',
  create: ({ sourceValue, targetValue, duration }) => ({
    type: 'traverse-down',
    metadata: { sourceValue, targetValue },
    duration: duration || 600
  }),
  animationFunction: traverseDownAnimation,
  metadataSchema: {
    validateMetadata: (metadata) =>
      typeof metadata?.sourceValue === 'number' &&
      typeof metadata?.targetValue === 'number',
    extractTargets: (metadata) => {
      if (!metadata) return [];
      const { sourceValue, targetValue } = metadata;
      return sourceValue !== undefined && targetValue !== undefined
        ? [`${sourceValue}-${targetValue}`]
        : [];
    }
  },
  elementType: 'link'
});

// =============================================================================
// ANIMATION HINT REGISTRATION UTILITY
// =============================================================================

/**
 * Register all animation hint descriptors for a visualization
 */
export function registerAnimationHints(
  controller: typeof AnimationController,
  visualization: string,
  descriptors: AnimationHintDescriptor[]
) {
  const animations = new Map(
    descriptors.map(d => [
      d.type,
      {
        animationFunction: d.animationFunction,
        metadataSchema: d.metadataSchema
      }
    ])
  );
  const animationTypeToElementType = new Map(
    descriptors.map(d => [d.type, d.elementType])
  );
  const config: VisualizationAnimationConfig = {
    animations,
    processHints: createSimpleHintProcessor(animationTypeToElementType, (type, hint) =>
      animations.get(type)?.metadataSchema.extractTargets?.(hint.metadata ?? {}) || []
    ),
    executeElementAnimations: createSimpleElementAnimationExecutor(controller, visualization)
  };
  controller.registerVisualization(visualization, config);
}

// =============================================================================
// REGISTRATION (NEW SYSTEM)
// =============================================================================

/**
 * Registers all binary tree animation hints with the generic animation controller.
 * Call this function during application initialization.
 */
export function registerBinaryTreeAnimations(): void {
  if (import.meta.env.DEV) {
    console.log('🎬 Registering binary tree animations with AnimationController...');
  }
  registerAnimationHints(AnimationController, 'binary-tree', [traverseDown]);
  if (import.meta.env.DEV) {
    console.log('🎬 Registered binary tree visualization:', {
      animationTypes: ['traverse-down'],
      registeredVisualizations: AnimationController.getRegisteredVisualizations()
    });
  }
}

/**
 * Helper function to process animation hints for binary tree visualizations.
 * This is the main entry point for executing binary tree animations.
 * 
 * @param hints - Animation hints to process
 * @param elementProvider - Function that returns DOM element for a given element ID
 * @param contextDataProvider - Optional function that returns context data for a given element ID
 * @param onComplete - Callback when all animations complete
 */
export function processBinaryTreeAnimations(
  hints: readonly AnimationHint[],
  elementProvider: (elementId: string) => Element | null,
  contextDataProvider?: (elementId: string) => Record<string, any>,
  onComplete?: () => void
): void {
  AnimationController.processAnimationHints(
    'binary-tree',
    hints,
    elementProvider,
    contextDataProvider,
    onComplete
  );
}

/**
 * Usage example (in renderer or logic):
 *   animationHints: [traverseDown.create({ sourceValue: 8, targetValue: 3 })]
 *
 * To register all hints:
 *   registerBinaryTreeAnimations();
 */

/**
 * Default export for convenience
 */
export default registerBinaryTreeAnimations;
