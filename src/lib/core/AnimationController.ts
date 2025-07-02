import type {
  AnimationHint,
  NodeAnimationFunction,
  LinkAnimationFunction,
  TreeAnimationFunction,
  NodeAnimationContext,
  LinkAnimationContext,
  TreeAnimationContext,
  AnimationMetadataSchema,
  AnimationRegistration,
} from './types';

/**
 * Generic animation controller with registration system.
 * 
 * Provides a declarative animation system where animations are triggered
 * by hints embedded in the data structure states. Each animation represents
 * one atomic visual change.
 * 
 * The controller uses a registration pattern to allow custom animations
 * to be added for different data structures or visualization needs.
 */
export class AnimationController {
  private static nodeAnimations = new Map<string, AnimationRegistration>();
  private static linkAnimations = new Map<string, AnimationRegistration>();
  private static treeAnimations = new Map<string, AnimationRegistration>();

  // Registration methods for different animation types

  /**
   * Registers a node animation function with its metadata schema.
   * 
   * @param name - Unique name for the animation
   * @param animation - Function that performs the animation
   * @param metadataSchema - Schema describing expected metadata format
   */
  static registerNode(name: string, animation: NodeAnimationFunction, metadataSchema: AnimationMetadataSchema): void {
    this.nodeAnimations.set(name, { animationFunction: animation, metadataSchema });
  }

  /**
   * Registers a link/edge animation function with its metadata schema.
   * 
   * @param name - Unique name for the animation
   * @param animation - Function that performs the animation
   * @param metadataSchema - Schema describing expected metadata format
   */
  static registerLink(name: string, animation: LinkAnimationFunction, metadataSchema: AnimationMetadataSchema): void {
    this.linkAnimations.set(name, { animationFunction: animation, metadataSchema });
  }

  /**
   * Registers a tree-wide animation function with its metadata schema.
   * 
   * @param name - Unique name for the animation
   * @param animation - Function that performs the animation
   * @param metadataSchema - Schema describing expected metadata format
   */
  static registerTree(name: string, animation: TreeAnimationFunction, metadataSchema: AnimationMetadataSchema): void {
    this.treeAnimations.set(name, { animationFunction: animation, metadataSchema });
  }

  // Execution methods

  /**
   * Executes a node animation by name.
   * 
   * @param name - Name of the registered animation
   * @param context - Animation context containing element and metadata
   */
  static executeNode(name: string, context: NodeAnimationContext): void {
    const registration = this.nodeAnimations.get(name);
    if (!registration) {
      console.warn(`Node animation '${name}' not found`);
      return;
    }

    try {
      (registration.animationFunction as NodeAnimationFunction)(context);
    } catch (error) {
      console.error(`Error executing node animation '${name}':`, error);
    }
  }

  /**
   * Executes a link animation by name.
   * 
   * @param name - Name of the registered animation
   * @param context - Animation context containing element and metadata
   */
  static executeLink(name: string, context: LinkAnimationContext): void {
    if (import.meta.env.DEV) {
      console.log('🎬 executeLink: Attempting to execute', { 
        name, 
        hasRegistration: this.linkAnimations.has(name),
        allRegistrations: Array.from(this.linkAnimations.keys())
      });
    }

    const registration = this.linkAnimations.get(name);
    if (!registration) {
      console.warn(`Link animation '${name}' not found`);
      return;
    }

    if (import.meta.env.DEV) {
      console.log('🎬 executeLink: Executing animation function', { name });
    }

    try {
      (registration.animationFunction as LinkAnimationFunction)(context);
    } catch (error) {
      console.error(`Error executing link animation '${name}':`, error);
    }
  }

  /**
   * Executes a tree animation by name.
   * 
   * @param name - Name of the registered animation
   * @param context - Animation context containing container and metadata
   */
  static executeTree(name: string, context: TreeAnimationContext): void {
    const registration = this.treeAnimations.get(name);
    if (!registration) {
      console.warn(`Tree animation '${name}' not found`);
      return;
    }

    try {
      (registration.animationFunction as TreeAnimationFunction)(context);
    } catch (error) {
      console.error(`Error executing tree animation '${name}':`, error);
    }
  }

  // Processing methods for animation hints

  /**
   * Processes animation hints for a single node.
   * Executes all animation hints attached to the node in sequence order.
   * 
   * @param nodeElement - DOM element representing the node
   * @param hints - Animation hints to process
   * @param nodeData - Additional data about the node
   * @param onComplete - Callback when all animations complete
   */
  static processNodeHints(
    nodeElement: Element,
    hints: readonly AnimationHint[],
    nodeData?: any,
    onComplete?: () => void
  ): void {
    if (!hints || hints.length === 0) {
      onComplete?.();
      return;
    }

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
      const context: NodeAnimationContext = {
        element: nodeElement,
        hint,
        nodeData,
        onComplete: handleAnimationComplete,
      };

      // Apply delay if specified
      const delay = hint.delay || 0;
      if (delay > 0) {
        setTimeout(() => {
          this.executeNode(hint.type, context);
        }, delay);
      } else {
        this.executeNode(hint.type, context);
      }
    });
  }

  /**
   * Processes animation hints for a single link/edge.
   * 
   * @param linkElement - DOM element representing the link
   * @param hints - Animation hints to process
   * @param sourceData - Data about the source node
   * @param targetData - Data about the target node
   * @param onComplete - Callback when all animations complete
   */
  static processLinkHints(
    linkElement: Element,
    hints: readonly AnimationHint[],
    sourceData?: any,
    targetData?: any,
    onComplete?: () => void
  ): void {
    if (!hints || hints.length === 0) {
      onComplete?.();
      return;
    }

    if (import.meta.env.DEV) {
      console.log('🎬 processLinkHints: Starting processing', {
        hintsCount: hints.length,
        hints: hints.map(h => ({ type: h.type, metadata: h.metadata })),
        elementType: linkElement.tagName
      });
    }

    // Sort hints by sequence number
    const sortedHints = [...hints].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    
    let completedCount = 0;
    const totalCount = sortedHints.length;

    const handleAnimationComplete = () => {
      completedCount++;
      if (import.meta.env.DEV) {
        console.log('🎬 processLinkHints: Animation completed', { completedCount, totalCount });
      }
      if (completedCount >= totalCount) {
        onComplete?.();
      }
    };

    // Execute all animations
    sortedHints.forEach((hint, index) => {
      const context: LinkAnimationContext = {
        element: linkElement,
        hint,
        sourceData,
        targetData,
        onComplete: handleAnimationComplete,
      };

      if (import.meta.env.DEV) {
        console.log('🎬 processLinkHints: Executing animation', { 
          index, 
          type: hint.type, 
          delay: hint.delay 
        });
      }

      // Apply delay if specified
      const delay = hint.delay || 0;
      if (delay > 0) {
        setTimeout(() => {
          this.executeLink(hint.type, context);
        }, delay);
      } else {
        this.executeLink(hint.type, context);
      }
    });
  }

  /**
   * Processes tree-level animation hints.
   * 
   * @param container - Root container element for the tree
   * @param hints - Animation hints to process
   * @param treeData - Data about the entire tree
   * @param onComplete - Callback when all animations complete
   */
  static processTreeHints(
    container: Element,
    hints: readonly AnimationHint[],
    treeData?: any,
    onComplete?: () => void
  ): void {
    if (!hints || hints.length === 0) {
      onComplete?.();
      return;
    }

    // Sort hints by sequence number
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
      const context: TreeAnimationContext = {
        container,
        hints: [hint],
        treeData,
        onComplete: handleAnimationComplete,
      };

      // Apply delay if specified
      const delay = hint.delay || 0;
      if (delay > 0) {
        setTimeout(() => {
          this.executeTree(hint.type, context);
        }, delay);
      } else {
        this.executeTree(hint.type, context);
      }
    });
  }

  // Utility methods

  /**
   * Gets all registered node animation names.
   */
  static getRegisteredNodeAnimations(): string[] {
    return Array.from(this.nodeAnimations.keys());
  }

  /**
   * Gets all registered link animation names.
   */
  static getRegisteredLinkAnimations(): string[] {
    return Array.from(this.linkAnimations.keys());
  }

  /**
   * Gets all registered tree animation names.
   */
  static getRegisteredTreeAnimations(): string[] {
    return Array.from(this.treeAnimations.keys());
  }

  /**
   * Checks if a node animation is registered.
   */
  static hasNodeAnimation(name: string): boolean {
    return this.nodeAnimations.has(name);
  }

  /**
   * Checks if a link animation is registered.
   */
  static hasLinkAnimation(name: string): boolean {
    return this.linkAnimations.has(name);
  }

  /**
   * Checks if a tree animation is registered.
   */
  static hasTreeAnimation(name: string): boolean {
    return this.treeAnimations.has(name);
  }

  /**
   * Unregisters a node animation.
   */
  static unregisterNode(name: string): boolean {
    return this.nodeAnimations.delete(name);
  }

  /**
   * Unregisters a link animation.
   */
  static unregisterLink(name: string): boolean {
    return this.linkAnimations.delete(name);
  }

  /**
   * Unregisters a tree animation.
   */
  static unregisterTree(name: string): boolean {
    return this.treeAnimations.delete(name);
  }

  /**
   * Clears all registered animations.
   */
  static clearAll(): void {
    this.nodeAnimations.clear();
    this.linkAnimations.clear();
    this.treeAnimations.clear();
  }

  /**
   * Gets the metadata schema for a registered animation.
   */
  static getNodeAnimationSchema(name: string): AnimationMetadataSchema | undefined {
    return this.nodeAnimations.get(name)?.metadataSchema;
  }

  /**
   * Gets the metadata schema for a registered link animation.
   */
  static getLinkAnimationSchema(name: string): AnimationMetadataSchema | undefined {
    return this.linkAnimations.get(name)?.metadataSchema;
  }

  /**
   * Gets the metadata schema for a registered tree animation.
   */
  static getTreeAnimationSchema(name: string): AnimationMetadataSchema | undefined {
    return this.treeAnimations.get(name)?.metadataSchema;
  }

  /**
   * Validates an animation hint against its registered schema.
   */
  static validateAnimationHint(hint: AnimationHint): boolean {
    let schema: AnimationMetadataSchema | undefined;
    
    if (this.hasNodeAnimation(hint.type)) {
      schema = this.getNodeAnimationSchema(hint.type);
    } else if (this.hasLinkAnimation(hint.type)) {
      schema = this.getLinkAnimationSchema(hint.type);
    } else if (this.hasTreeAnimation(hint.type)) {
      schema = this.getTreeAnimationSchema(hint.type);
    }
    
    if (!schema) return false;
    
    // Use custom validation if provided, otherwise just check metadata exists
    if (schema.validateMetadata) {
      return schema.validateMetadata(hint.metadata || {});
    }
    
    return hint.metadata !== undefined;
  }

  /**
   * Extracts target identifiers from an animation hint using its schema.
   */
  static extractAnimationTargets(hint: AnimationHint): string[] {
    let schema: AnimationMetadataSchema | undefined;
    
    if (this.hasNodeAnimation(hint.type)) {
      schema = this.getNodeAnimationSchema(hint.type);
    } else if (this.hasLinkAnimation(hint.type)) {
      schema = this.getLinkAnimationSchema(hint.type);
    } else if (this.hasTreeAnimation(hint.type)) {
      schema = this.getTreeAnimationSchema(hint.type);
    }
    
    if (!schema || !hint.metadata) {
      if (import.meta.env.DEV) {
        console.log('🎯 extractAnimationTargets: No schema or metadata', { 
          hintType: hint.type, 
          hasSchema: !!schema, 
          hasMetadata: !!hint.metadata 
        });
      }
      return [];
    }
    
    // Use custom extractor if provided
    if (schema.extractTargets) {
      const targets = schema.extractTargets(hint.metadata);
      if (import.meta.env.DEV) {
        console.log('🎯 extractAnimationTargets: Custom extractor result', { targets });
      }
      return targets;
    }
    
    // Default extraction based on target type
    const targets: string[] = [];
    
    if (schema.targetType === 'node' && schema.nodeTargetFields) {
      for (const field of schema.nodeTargetFields) {
        const value = hint.metadata[field];
        if (value !== undefined) {
          targets.push(String(value));
        }
      }
    } else if (schema.targetType === 'link' && schema.linkSourceField && schema.linkTargetField) {
      const source = hint.metadata[schema.linkSourceField];
      const target = hint.metadata[schema.linkTargetField];
      if (source !== undefined && target !== undefined) {
        const linkId = `${source}-${target}`;
        targets.push(linkId);
        if (import.meta.env.DEV) {
          console.log('🎯 extractAnimationTargets: Link target created', { 
            source, 
            target, 
            linkId,
            sourceField: schema.linkSourceField,
            targetField: schema.linkTargetField
          });
        }
      }
    }
    
    if (import.meta.env.DEV) {
      console.log('🎯 extractAnimationTargets: Final targets', { targets, schema: schema.targetType });
    }
    
    return targets;
  }

  /**
   * Gets all animation hints that target a specific node.
   * Used by renderers to determine which animations to apply to a node element.
   */
  static getNodeAnimations(nodeValue: number, hints: readonly AnimationHint[]): AnimationHint[] {
    const nodeHints: AnimationHint[] = [];
    
    hints.forEach(hint => {
      if (this.hasNodeAnimation(hint.type)) {
        const targets = this.extractAnimationTargets(hint);
        if (targets.includes(String(nodeValue))) {
          nodeHints.push(hint);
        }
      }
    });
    
    return nodeHints;
  }

  /**
   * Gets all animation hints that target a specific link.
   * Used by renderers to determine which animations to apply to a link element.
   */
  static getLinkAnimations(linkId: string, hints: readonly AnimationHint[]): AnimationHint[] {
    const linkHints: AnimationHint[] = [];
    
    hints.forEach(hint => {
      if (this.hasLinkAnimation(hint.type)) {
        const targets = this.extractAnimationTargets(hint);
        if (import.meta.env.DEV) {
          console.log('🎯 Link animation target check:', {
            hintType: hint.type,
            linkId,
            extractedTargets: targets,
            matches: targets.includes(linkId)
          });
        }
        if (targets.includes(linkId)) {
          linkHints.push(hint);
        }
      }
    });
    
    return linkHints;
  }

  /**
   * Gets all animation hints that target the tree level.
   * Used by renderers to determine which animations to apply to the entire tree.
   */
  static getTreeAnimations(hints: readonly AnimationHint[]): AnimationHint[] {
    const treeHints: AnimationHint[] = [];
    
    hints.forEach(hint => {
      if (this.hasTreeAnimation(hint.type)) {
        treeHints.push(hint);
      }
    });
    
    return treeHints;
  }

  /**
   * Executes all animations for a specific node element.
   * Used in the D3 join pattern: nodeElements.each((d, i, nodes) => ...)
   */
  static executeNodeAnimations(
    element: Element, 
    nodeValue: number,
    nodeData: any,
    hints: readonly AnimationHint[]
  ): void {
    if (import.meta.env.DEV) {
      console.log('🎬 AnimationController.executeNodeAnimations called:', {
        nodeValue,
        hintsCount: hints.length,
        hints: hints.map(h => ({ type: h.type, metadata: h.metadata })),
        registeredNodeAnimations: this.getRegisteredNodeAnimations()
      });
    }
    
    const nodeHints = this.getNodeAnimations(nodeValue, hints);
    if (nodeHints.length > 0) {
      if (import.meta.env.DEV) {
        console.log('🎬 Processing node hints:', nodeHints);
      }
      this.processNodeHints(element, nodeHints, nodeData);
    } else if (import.meta.env.DEV) {
      console.log('🎬 No node hints found for nodeValue:', nodeValue);
    }
  }

  /**
   * Executes all animations for a specific link element.
   * Used in the D3 join pattern: linkElements.each((d, i, nodes) => ...)
   */
  static executeLinkAnimations(
    element: Element,
    linkId: string,
    sourceData: any,
    targetData: any,
    hints: readonly AnimationHint[]
  ): void {
    if (import.meta.env.DEV) {
      console.log('🎬 AnimationController.executeLinkAnimations called:', {
        linkId,
        hintsCount: hints.length,
        hints: hints.map(h => ({ type: h.type, metadata: h.metadata })),
        registeredLinkAnimations: this.getRegisteredLinkAnimations()
      });
    }
    
    const linkHints = this.getLinkAnimations(linkId, hints);
    if (linkHints.length > 0) {
      if (import.meta.env.DEV) {
        console.log('🎬 Processing link hints:', linkHints);
      }
      this.processLinkHints(element, linkHints, sourceData, targetData);
    } else if (import.meta.env.DEV) {
      console.log('🎬 No link hints found for linkId:', linkId);
    }
  }
}
