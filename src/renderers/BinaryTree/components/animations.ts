/**
 * Binary Tree Animation System
 * 
 * Provides declarative animations for binary tree visualizations using D3.
 * All animations are triggered by hints embedded in tree states and follow
 * the "one step, one animation" principle.
 * 
 * This module registers binary tree specific animations with the core
 * AnimationController and provides D3-based implementations.
 */

import * as d3 from 'd3';
import { AnimationController } from '../../../lib/core/AnimationController';
import type { 
  LinkAnimationContext,
  AnimationMetadataSchema
} from '../../../lib/core/types';
import type { 
  BinaryTreeLinkAnimationContext
} from '../types';

// =============================================================================
// LINK ANIMATIONS
// =============================================================================

/**
 * Traverse down animation - shows a pulsing dot traveling from source to target
 * The link itself remains unchanged, only the traveling dot is animated
 */
const traverseDownAnimation = (context: BinaryTreeLinkAnimationContext): void => {
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
  const dot = linksGroup
    .append('circle')
    .attr('class', dotClass)
    .attr('r', 4)
    .attr('fill', '#3b82f6') // Blue color for the traveling dot
    .attr('stroke', '#1d4ed8')
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
// WRAPPER FUNCTIONS FOR REGISTRATION
// =============================================================================

/**
 * Creates a wrapper function that converts generic LinkAnimationContext
 * to BinaryTreeLinkAnimationContext for compatibility with the core system.
 */
function createLinkAnimationWrapper(
  animation: (context: BinaryTreeLinkAnimationContext) => void
) {
  return (context: LinkAnimationContext) => {
    if (import.meta.env.DEV) {
      console.log('🎬 LinkAnimation wrapper called:', {
        animationType: context.hint.type,
        metadata: context.hint.metadata,
        hasElement: !!context.element,
        sourceData: context.sourceData,
        targetData: context.targetData
      });
    }

    // Extract additional binary tree context from sourceData/targetData
    const sourceNode = context.sourceData as any; // Will be BinaryTreeNode
    const targetNode = context.targetData as any; // Will be BinaryTreeNode
    const treeState = { root: null } as any; // Mock tree state - not used in current animations
    
    const binaryTreeContext: BinaryTreeLinkAnimationContext = {
      ...context,
      sourceNode,
      targetNode,
      treeState,
    };
    
    try {
      animation(binaryTreeContext);
    } catch (error) {
      console.error('Animation execution failed:', error);
      // Call completion callback to prevent hanging
      context.onComplete?.();
    }
  };
}

// =============================================================================
// REGISTRATION
// =============================================================================

/**
 * Registers all binary tree animations with the core animation controller.
 * Call this function during application initialization.
 */
export function registerBinaryTreeAnimations(): void {
  if (import.meta.env.DEV) {
    console.log('🎬 Registering binary tree animations...');
  }
  
  // Define metadata schema for traverse-down animation
  const traverseDownSchema: AnimationMetadataSchema = {
    targetType: 'link',
    linkSourceField: 'sourceValue',
    linkTargetField: 'targetValue',
    validateMetadata: (metadata: Record<string, any>) => {
      const isValid = typeof metadata.sourceValue === 'number' && 
             typeof metadata.targetValue === 'number';
      if (import.meta.env.DEV) {
        console.log('🎬 Validating traverse-down metadata:', { metadata, isValid });
      }
      return isValid;
    }
  };

  // Link animations - only traverse-down as per requirements
  AnimationController.registerLink(
    'traverse-down', 
    createLinkAnimationWrapper(traverseDownAnimation),
    traverseDownSchema
  );
  
  if (import.meta.env.DEV) {
    console.log('🎬 Registered animations:', {
      linkAnimations: AnimationController.getRegisteredLinkAnimations(),
      nodeAnimations: AnimationController.getRegisteredNodeAnimations(),
      treeAnimations: AnimationController.getRegisteredTreeAnimations()
    });
  }
}

/**
 * Default export for convenience
 */
export default registerBinaryTreeAnimations;
