/**
 * Generic Animation Controller for any visualization type. Visualizations register their own animation types and provide corresponding animation functions and metadata schemas, enabling a flexible system for any visualization now or in the future.
 */

import type { AnimationHint, AnimationRegistration } from '@/types/animations';
import { loggers } from '@/lib/core/Logger';

/**
 * Generic animation context - contains minimal required information
 * for any animation type.
 */
export interface GenericAnimationContext {
  /** The DOM element to animate */
  element: Element;
  
  /** Animation hint that triggered this animation */
  hint: AnimationHint;
  
  /** Optional context data specific to the animation type */
  contextData?: Record<string, any>;
  
  /** Callback when animation completes */
  onComplete?: () => void;
}

/**
 * Function signature for generic animations.
 */
export type GenericAnimationFunction = (context: GenericAnimationContext) => void;

/**
 * Configuration for a visualization's animation support.
 * Each visualization registers its animation types and how to process them.
 */
export interface VisualizationAnimationConfig {
  /** 
   * Map of animation type names to their registrations.
   * e.g., { 'node': {...}, 'link': {...}, 'edge': {...} }
   */
  animations: Map<string, AnimationRegistration>;
  
  /**
   * Function to process animation hints and determine which elements they target.
   * This function is called with all animation hints and should return a map
   * of element identifiers to the hints that should be applied to them.
   * 
   * @param hints - All animation hints to process
   * @returns Map from element identifier to array of hints for that element
   */
  processHints: (hints: readonly AnimationHint[]) => Map<string, AnimationHint[]>;
  
  /**
   * Function to execute animations on a specific element.
   * This is called for each element that has animation hints.
   * 
   * @param elementId - Identifier for the element (as returned by processHints)
   * @param element - The actual DOM element to animate
   * @param hints - Animation hints to apply to this element
   * @param contextData - Optional context data specific to this element
   * @param onComplete - Callback when all animations for this element complete
   */
  executeElementAnimations: (
    elementId: string,
    element: Element,
    hints: readonly AnimationHint[],
    contextData?: Record<string, any>,
    onComplete?: () => void
  ) => void;
}

/**
 * Animation Controller that works with any visualization type.
 */
export class AnimationController {
  private static visualizationConfigs = new Map<string, VisualizationAnimationConfig>();

  /**
   * Registers a visualization's animation configuration.
   * 
   * @param visualizationType - Unique identifier for the visualization type (e.g., 'binary-tree', 'graph', 'bar-chart')
   * @param config - Animation configuration for this visualization type
   */
  static registerVisualization(visualizationType: string, config: VisualizationAnimationConfig): void {
    this.visualizationConfigs.set(visualizationType, config);
    
    loggers.animation.info(`Registered visualization: ${visualizationType}`, {
      data: {
        animationTypes: Array.from(config.animations.keys())
      }
    });
  }

  /**
   * Unregisters a visualization configuration.
   * 
   * @param visualizationType - The visualization type to unregister
   */
  static unregisterVisualization(visualizationType: string): boolean {
    return this.visualizationConfigs.delete(visualizationType);
  }

  /**
   * Gets a registered visualization configuration.
   * 
   * @param visualizationType - The visualization type to get
   */
  static getVisualizationConfig(visualizationType: string): VisualizationAnimationConfig | undefined {
    return this.visualizationConfigs.get(visualizationType);
  }

  /**
   * Lists all registered visualization types.
   */
  static getRegisteredVisualizations(): string[] {
    return Array.from(this.visualizationConfigs.keys());
  }

  /**
   * Executes a specific animation by name for a visualization type.
   * 
   * @param visualizationType - The type of visualization
   * @param animationType - The type of animation to execute
   * @param context - Animation context
   */
  static executeAnimation(
    visualizationType: string,
    animationType: string,
    context: GenericAnimationContext
  ): void {
    const config = this.visualizationConfigs.get(visualizationType);
    if (!config) {
      loggers.animation.warn(`Visualization type '${visualizationType}' not registered`);
      context.onComplete?.();
      return;
    }

    const registration = config.animations.get(animationType);
    if (!registration) {
      loggers.animation.warn(`Animation type '${animationType}' not found for visualization '${visualizationType}'`);
      context.onComplete?.();
      return;
    }

    loggers.animation.info(`Executing animation: ${visualizationType}.${animationType}`);

    try {
      registration.animationFunction(context);
    } catch (error) {
      loggers.animation.error(`Error executing animation '${animationType}' for '${visualizationType}'`, { 
        error: error as Error 
      });
      context.onComplete?.();
    }
  }

  /**
   * Processes animation hints for a specific visualization.
   * This is the main entry point for executing animations.
   * 
   * @param visualizationType - The type of visualization
   * @param hints - Animation hints to process
   * @param elementProvider - Function that returns DOM element for a given element ID
   * @param contextDataProvider - Optional function that returns context data for a given element ID
   * @param onComplete - Callback when all animations complete
   */
  static processAnimationHints(
    visualizationType: string,
    hints: readonly AnimationHint[],
    elementProvider: (elementId: string) => Element | null,
    contextDataProvider?: (elementId: string) => Record<string, any>,
    onComplete?: () => void
  ): void {
    const config = this.visualizationConfigs.get(visualizationType);
    if (!config) {
      loggers.animation.warn(`Visualization type '${visualizationType}' not registered`);
      onComplete?.();
      return;
    }

    if (!hints || hints.length === 0) {
      onComplete?.();
      return;
    }

    loggers.animation.info(`Processing ${hints.length} animation hints for ${visualizationType}`);

    // Use the visualization's hint processing logic
    const elementHints = config.processHints(hints);
    
    if (elementHints.size === 0) {
      onComplete?.();
      return;
    }

    let completedElements = 0;
    const totalElements = elementHints.size;

    const handleElementComplete = () => {
      completedElements++;
      if (completedElements >= totalElements) {
        onComplete?.();
      }
    };

    // Execute animations for each element
    elementHints.forEach((elementAnimations, elementId) => {
      const element = elementProvider(elementId);
      if (!element) {
        loggers.animation.warn(`Element not found for ID: ${elementId}`);
        handleElementComplete();
        return;
      }

      const contextData = contextDataProvider?.(elementId);
      
      // Use the visualization's element animation execution logic
      config.executeElementAnimations(
        elementId,
        element,
        elementAnimations,
        contextData,
        handleElementComplete
      );
    });
  }

  /**
   * Validates an animation hint against its registered schema.
   * 
   * @param visualizationType - The type of visualization
   * @param hint - The animation hint to validate
   */
  static validateAnimationHint(visualizationType: string, hint: AnimationHint): boolean {
    const config = this.visualizationConfigs.get(visualizationType);
    if (!config) {
      return false;
    }

    const registration = config.animations.get(hint.type);
    if (!registration) {
      return false;
    }

    const { metadataSchema } = registration;
    
    // Use custom validation if provided, otherwise just check metadata exists
    if (metadataSchema.validateMetadata) {
      return metadataSchema.validateMetadata(hint.metadata || {});
    }
    
    return hint.metadata !== undefined;
  }

  /**
   * Extracts target identifiers from an animation hint using its schema.
   * 
   * @param visualizationType - The type of visualization
   * @param hint - The animation hint to extract targets from
   */
  static extractAnimationTargets(visualizationType: string, hint: AnimationHint): string[] {
    const config = this.visualizationConfigs.get(visualizationType);
    if (!config) {
      return [];
    }

    const registration = config.animations.get(hint.type);
    if (!registration || !hint.metadata) {
      return [];
    }

    const { metadataSchema } = registration;
    
    // Use custom extractor if provided
    if (metadataSchema.extractTargets) {
      return metadataSchema.extractTargets(hint.metadata);
    }
    
    // No default extraction - visualizations must provide their own logic
    return [];
  }

  /**
   * Clears all registered visualizations.
   */
  static clearAll(): void {
    this.visualizationConfigs.clear();
  }
}

/**
 * Utility function to create a simple hint processor for visualizations
 * that use a straightforward mapping of animation type to element type.
 * 
 * This is a helper for common cases where each animation type maps to
 * a specific element type (e.g., 'node' animations target nodes, 'link' animations target links).
 */
export function createSimpleHintProcessor(
  animationTypeToElementType: Map<string, string>,
  extractElementId: (animationType: string, hint: AnimationHint) => string[]
): (hints: readonly AnimationHint[]) => Map<string, AnimationHint[]> {
  return (hints: readonly AnimationHint[]) => {
    const elementHints = new Map<string, AnimationHint[]>();
    
    hints.forEach(hint => {
      const elementType = animationTypeToElementType.get(hint.type);
      if (!elementType) {
        loggers.animation.warn(`Unknown animation type: ${hint.type}`);
        return;
      }
      
      const elementIds = extractElementId(hint.type, hint);
      elementIds.forEach(elementId => {
        if (!elementHints.has(elementId)) {
          elementHints.set(elementId, []);
        }
        elementHints.get(elementId)!.push(hint);
      });
    });
    
    return elementHints;
  };
}

/**
 * Utility function to create a simple element animation executor
 * that processes hints sequentially with proper completion handling.
 */
export function createSimpleElementAnimationExecutor(
  animationController: typeof AnimationController,
  visualizationType: string
): (
  elementId: string,
  element: Element,
  hints: readonly AnimationHint[],
  contextData?: Record<string, any>,
  onComplete?: () => void
) => void {
  return (elementId, element, hints, contextData, onComplete) => {
    if (!hints || hints.length === 0) {
      onComplete?.();
      return;
    }

    loggers.animation.debug(`Executing animations for element: ${elementId}`, {
      data: {
        hintsCount: hints.length,
        hints: hints.map(h => ({ type: h.type, sequence: h.sequence }))
      }
    });

    // Sort hints by sequence number (lower = earlier)
    const sortedHints = [...hints].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    
    let completedCount = 0;
    const totalCount = sortedHints.length;

    const handleAnimationComplete = () => {
      completedCount++;
      if (completedCount >= totalCount) {
        onComplete?.();
      }
    };

    // Execute all animations
    sortedHints.forEach(hint => {
      const context: GenericAnimationContext = {
        element,
        hint,
        contextData,
        onComplete: handleAnimationComplete,
      };

      // Apply delay if specified
      const delay = hint.delay || 0;
      if (delay > 0) {
        setTimeout(() => {
          animationController.executeAnimation(visualizationType, hint.type, context);
        }, delay);
      } else {
        animationController.executeAnimation(visualizationType, hint.type, context);
      }
    });
  };
}

export type { AnimationRegistration } from '@/types/animations';
