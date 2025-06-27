/**
 * Binary Tree Visualization Configuration
 * 
 * This configuration object contains all the visual and behavioral settings
 * for rendering binary trees in the visualization system. It provides a
 * centralized location for all styling, layout, animation, and interaction
 * parameters that control how binary trees are displayed and animated.
 * 
 * The configuration is designed to be generic and work with any binary tree
 * structure (BST, AVL, Heap, etc.) while providing consistent visual behavior
 * across different tree types.
 * 
 * @example
 * ```typescript
 * import { CONFIG } from './config';
 * 
 * // Access node sizing configuration
 * const nodeSize = CONFIG.nodes.MAX_SIZE;
 * 
 * // Access animation durations
 * const duration = CONFIG.animation.DURATION.normal;
 * 
 * // Access color scheme
 * const highlightColor = CONFIG.colors.HIGHLIGHT_FILL;
 * ```
 */
export const CONFIG = {
  /**
   * Layout Configuration
   * 
   * Controls the overall layout and positioning parameters for the tree structure.
   * These settings determine how much space the tree occupies and how nodes are
   * positioned relative to each other across different tree levels.
   */
  layout: {
    /** Minimum width allocated for tree layout, ensures readability even for small trees */
    MIN_LAYOUT_WIDTH: 800,
    /** Factor by which each tree level's width is reduced (0.65 = 35% reduction per level) */
    LEVEL_WIDTH_REDUCTION: 0.65,
  },
  
  /**
   * Node Configuration
   * 
   * Visual properties for tree nodes including size, text, and scaling behavior.
   * Nodes automatically scale based on tree size to maintain readability.
   */
  nodes: {
    /** Minimum node radius in pixels */
    MIN_SIZE: 16,
    /** Maximum node radius in pixels */
    MAX_SIZE: 32,
    /** Base size offset used in dynamic sizing calculation */
    SIZE_OFFSET: 60,
    /** Size reduction per additional node in tree */
    SIZE_STEP: 2,
    /** Font size for text inside nodes */
    TEXT_FONT_SIZE_PX: 24,
  },
  
  /**
   * Spacing Configuration
   * 
   * Controls vertical spacing between tree levels. Spacing automatically
   * adjusts based on tree size to prevent overcrowding in large trees.
   */
  spacing: {
    /** Minimum vertical distance between tree levels */
    MIN_VERTICAL: 60,
    /** Maximum vertical distance between tree levels */
    MAX_VERTICAL: 120,
    /** Base vertical offset used in dynamic spacing calculation */
    VERTICAL_OFFSET: 200,
    /** Spacing reduction per additional node in tree */
    VERTICAL_STEP: 4,
  },
  
  /**
   * Color Scheme
   * 
   * Defines the color palette used throughout the tree visualization.
   * Colors are chosen to provide clear visual feedback for different
   * states and operations while maintaining accessibility.
   */
  colors: {
    /** Default fill color for normal nodes */
    NODE_FILL: "#FFFFFF",
    /** Text color inside nodes */
    NODE_TEXT: "black",
    /** Fill color for highlighted/selected nodes */
    HIGHLIGHT_FILL: "#FFD700",
    /** Stroke color for highlighted/selected nodes */
    HIGHLIGHT_STROKE: "#FF6B35",
    /** Fill color for the currently active node during traversal */
    TRAVERSAL_CURRENT: "#FF6B35",
    /** Stroke color for the currently active node during traversal */
    TRAVERSAL_CURRENT_STROKE: "#FF4500",
    /** Fill color for previously visited nodes during traversal */
    TRAVERSAL_VISITED: "#87CEEB",
    /** Stroke color for previously visited nodes during traversal */
    TRAVERSAL_VISITED_STROKE: "#4682B4",
    /** Color for highlighting the path taken during operations */
    TRAVERSAL_PATH: "#32CD32",
  },
  
  /**
   * Zoom and Pan Configuration
   * 
   * Controls the zoom and pan behavior for large trees that don't fit
   * entirely within the viewport. Provides smooth navigation experience.
   */
  zoom: {
    /** Minimum zoom scale factor (0.1 = 10% of original size) */
    MIN_SCALE: 0.1,
    /** Maximum zoom scale factor (4 = 400% of original size) */
    MAX_SCALE: 4,
    /** Initial scale factor applied when first displaying the tree */
    INITIAL_SCALE_FACTOR: 0.8,
  },
  
  /**
   * Animation Configuration
   * 
   * Timing settings for various animations and transitions throughout
   * the visualization. Multiple speed options provide flexibility for
   * different use cases (learning vs demonstration).
   */
  animation: {
    /** Duration settings for different animation speeds */
    DURATION: {
      /** Slow animation speed (800ms) - good for educational purposes */
      slow: 800,
      /** Normal animation speed (500ms) - balanced for most use cases */
      normal: 500,
      /** Fast animation speed (200ms) - good for experienced users */
      fast: 200,
    },
    /** Duration for exit animations when nodes are removed */
    EXIT_DURATION: 300,
  },
} as const;
