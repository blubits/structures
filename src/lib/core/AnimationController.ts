import type {
  AnimationHint,
  NodeAnimationFunction,
  LinkAnimationFunction,
  TreeAnimationFunction,
  NodeAnimationContext,
  LinkAnimationContext,
  TreeAnimationContext,
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
  private static nodeAnimations = new Map<string, NodeAnimationFunction>();
  private static linkAnimations = new Map<string, LinkAnimationFunction>();
  private static treeAnimations = new Map<string, TreeAnimationFunction>();

  // Registration methods for different animation types

  /**
   * Registers a node animation function.
   * 
   * @param name - Unique name for the animation
   * @param animation - Function that performs the animation
   */
  static registerNode(name: string, animation: NodeAnimationFunction): void {
    this.nodeAnimations.set(name, animation);
  }

  /**
   * Registers a link/edge animation function.
   * 
   * @param name - Unique name for the animation
   * @param animation - Function that performs the animation
   */
  static registerLink(name: string, animation: LinkAnimationFunction): void {
    this.linkAnimations.set(name, animation);
  }

  /**
   * Registers a tree-wide animation function.
   * 
   * @param name - Unique name for the animation
   * @param animation - Function that performs the animation
   */
  static registerTree(name: string, animation: TreeAnimationFunction): void {
    this.treeAnimations.set(name, animation);
  }

  // Execution methods

  /**
   * Executes a node animation by name.
   * 
   * @param name - Name of the registered animation
   * @param context - Animation context containing element and metadata
   */
  static executeNode(name: string, context: NodeAnimationContext): void {
    const animation = this.nodeAnimations.get(name);
    if (!animation) {
      console.warn(`Node animation '${name}' not found`);
      return;
    }

    try {
      animation(context);
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
    const animation = this.linkAnimations.get(name);
    if (!animation) {
      console.warn(`Link animation '${name}' not found`);
      return;
    }

    try {
      animation(context);
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
    const animation = this.treeAnimations.get(name);
    if (!animation) {
      console.warn(`Tree animation '${name}' not found`);
      return;
    }

    try {
      animation(context);
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
      const context: LinkAnimationContext = {
        element: linkElement,
        hint,
        sourceData,
        targetData,
        onComplete: handleAnimationComplete,
      };

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
}
