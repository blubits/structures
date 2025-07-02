How animations worked in the old system:

```
/**
 * Animation functions for binary tree visualizations
 * 
 * This module provides a centralized collection of animation functions for both
 * nodes and links in binary tree visualizations. All functions follow consistent
 * signatures for easy extensibility and maintenance.
 */

import * as d3 from "d3";
import { CONFIG } from "./config";
import type { BinaryTreeNode } from "./types";

/**
 * Context object for link animations
 * Contains all necessary data and DOM elements for animating links
 */
export interface LinkAnimationContext {
  /** The D3 selection of the link element */
  linkElement: d3.Selection<any, any, null, undefined>;
  /** The hierarchical link data */
  linkData: d3.HierarchyLink<BinaryTreeNode>;
  /** The parent group containing all links */
  linksGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  /** Base node size for scaling animations */
  baseNodeSize: number;
  /** Whether dark mode is active */
  isDarkMode: boolean;
  /** Helper function to get link color */
  getLinkColor: (sourceValue: number, targetValue: number) => string;
  /** Helper function to get link width */
  getLinkWidth: (sourceValue: number, targetValue: number) => number;
}

/**
 * Context object for node animations
 * Contains all necessary data and DOM elements for animating nodes
 */
export interface NodeAnimationContext {
  /** The D3 selection of the node group element */
  nodeGroup: d3.Selection<SVGGElement, any, null, undefined>;
  /** The D3 selection of the circle element within the node */
  circle: d3.Selection<any, any, null, undefined>;
  /** The D3 selection of the text element within the node */
  text: d3.Selection<any, any, null, undefined>;
  /** The hierarchical node data */
  nodeData: d3.HierarchyPointNode<BinaryTreeNode>;
  /** Base node size for scaling animations */
  baseNodeSize: number;
  /** Whether dark mode is active */
  isDarkMode: boolean;
  /** Helper function to get node fill color */
  getNodeColor: (d: d3.HierarchyPointNode<BinaryTreeNode>) => string;
  /** Helper function to get node stroke color */
  getNodeStrokeColor: (d: d3.HierarchyPointNode<BinaryTreeNode>) => string;
}

/**
 * Type definition for link animation functions
 */
export type LinkAnimationFunction = (context: LinkAnimationContext) => void;

/**
 * Type definition for node animation functions
 */
export type NodeAnimationFunction = (context: NodeAnimationContext) => void;

// =============================================================================
// LINK ANIMATIONS
// =============================================================================

/**
 * Forward traverse animation for links
 * Creates a pulsing effect and traveling dot to show traversal direction
 */
export const forwardTraverse: LinkAnimationFunction = (context) => {
  const { linkElement, linkData, linksGroup, baseNodeSize, getLinkWidth } = context;
  
  // Create a pulsing effect by animating opacity and stroke-width
  linkElement
    .transition()
    .duration(150)
    .attr("opacity", 0.6)
    .attr("stroke-width", getLinkWidth(linkData.source.data.value, linkData.target.data.value) * 1.5)
    .transition()
    .duration(150)
    .attr("opacity", 1)
    .attr("stroke-width", getLinkWidth(linkData.source.data.value, linkData.target.data.value));
  
  // Add a traveling dot animation to show direction
  const dotClass = `traveling-dot-${linkData.source.data.value}-${linkData.target.data.value}`;
  const existingDot = linksGroup.select(`.${dotClass}`);
  
  if (existingDot.empty()) {
    // Create a traveling dot that moves along the link
    const dot = linksGroup
      .append("circle")
      .attr("class", dotClass)
      .attr("r", Math.max(3, baseNodeSize / 6))
      .attr("fill", CONFIG.colors.TRAVERSAL_CURRENT)
      .attr("stroke", CONFIG.colors.TRAVERSAL_CURRENT_STROKE)
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .attr("cx", linkData.source.x ?? 0)
      .attr("cy", linkData.source.y ?? 0);
    
    // Animate the dot appearing and traveling along the link
    dot
      .transition()
      .duration(100)
      .attr("opacity", 0.9)
      .transition()
      .duration(600)
      .ease(d3.easeQuadInOut)
      .attr("cx", linkData.target.x ?? 0)
      .attr("cy", linkData.target.y ?? 0)
      .transition()
      .duration(200)
      .attr("opacity", 0)
      .attr("r", Math.max(5, baseNodeSize / 4))
      .remove();
    
    // Add a subtle glow effect on the target node
    const targetNodeGroup = d3.select(`g.nodes-group`).selectAll('.node')
      .filter((nodeData: any) => nodeData.data.value === linkData.target.data.value);
    
    if (!targetNodeGroup.empty()) {
      const targetCircle = targetNodeGroup.select('circle');
      targetCircle
        .transition()
        .duration(300)
        .attr("filter", "drop-shadow(0 0 4px rgba(255, 107, 53, 0.6))")
        .transition()
        .duration(300)
        .attr("filter", null);
    }
  }
};

/**
 * Reverse traverse animation for links
 * Shows backward movement through the tree with subtle reverse animations
 */
export const reverseTraverse: LinkAnimationFunction = (context) => {
  const { linkElement, linkData, linksGroup, baseNodeSize, getLinkWidth, getLinkColor } = context;
  
  // Reverse pulsing animation - more subtle to indicate backward movement
  linkElement
    .transition()
    .duration(300)
    .attr("opacity", 0.5)
    .attr("stroke-width", getLinkWidth(linkData.source.data.value, linkData.target.data.value) * 1.5)
    .attr("stroke", CONFIG.colors.TRAVERSAL_VISITED) // Use visited color for reverse
    .transition()
    .duration(300)
    .attr("opacity", 1)
    .attr("stroke-width", getLinkWidth(linkData.source.data.value, linkData.target.data.value))
    .attr("stroke", getLinkColor(linkData.source.data.value, linkData.target.data.value));
  
  // Add a reverse traveling dot animation showing we're undoing the traversal
  const dotClass = `reverse-dot-${linkData.source.data.value}-${linkData.target.data.value}`;
  const existingDot = linksGroup.select(`.${dotClass}`);
  
  if (existingDot.empty()) {
    const dot = linksGroup
      .append("circle")
      .attr("class", dotClass)
      .attr("r", Math.max(2, baseNodeSize / 8))
      .attr("fill", CONFIG.colors.TRAVERSAL_VISITED)
      .attr("stroke", CONFIG.colors.TRAVERSAL_VISITED_STROKE)
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .attr("cx", linkData.target.x ?? 0)  // Start from target (where we were)
      .attr("cy", linkData.target.y ?? 0);
    
    // Animate the dot traveling back to source (where we're going back to)
    dot
      .transition()
      .duration(100)
      .attr("opacity", 0.8)
      .transition()
      .duration(500)
      .ease(d3.easeQuadOut)
      .attr("cx", linkData.source.x ?? 0)  // Move back to source
      .attr("cy", linkData.source.y ?? 0)
      .transition()
      .duration(200)
      .attr("opacity", 0)
      .remove();
    
    // Add a subtle dimming effect on the target node to show we're leaving it
    const targetNodeGroup = d3.select(`g.nodes-group`).selectAll('.node')
      .filter((nodeData: any) => nodeData.data.value === linkData.target.data.value);
    
    if (!targetNodeGroup.empty()) {
      const targetCircle = targetNodeGroup.select('circle');
      targetCircle
        .transition()
        .duration(300)
        .attr("opacity", 0.6)
        .transition()
        .duration(300)
        .attr("opacity", 1);
    }
  }
};

// =============================================================================
// NODE ANIMATIONS
// =============================================================================

/**
 * Pulse animation for nodes
 * Forward step animation with orange glow effect
 */
export const pulse: NodeAnimationFunction = (context) => {
  const { circle, nodeData, baseNodeSize, getNodeColor, getNodeStrokeColor } = context;
  
  // Forward step: pulse the current node with orange glow
  const originalFill = getNodeColor(nodeData);
  const originalStroke = getNodeStrokeColor(nodeData);
  const originalStrokeWidth = Math.max(1, baseNodeSize / 12);
  
  // Start from white, then transition to orange, then back to original
  circle
    .attr("fill", CONFIG.colors.NODE_FILL) // Start from white
    .attr("stroke", originalStroke)
    .attr("stroke-width", originalStrokeWidth)
    .transition()
    .duration(200)
    .attr("r", baseNodeSize * 1.2)
    .attr("fill", CONFIG.colors.TRAVERSAL_CURRENT)
    .attr("stroke", CONFIG.colors.TRAVERSAL_CURRENT_STROKE)
    .attr("stroke-width", 3)
    .style("filter", "drop-shadow(0 0 8px rgba(255, 107, 53, 0.6))")
    .transition()
    .duration(200)
    .attr("r", baseNodeSize)
    .attr("fill", originalFill)
    .attr("stroke", originalStroke)
    .attr("stroke-width", originalStrokeWidth)
    .style("filter", null);
};

/**
 * Rewind animation for nodes
 * Backward step animation for the previous current node
 */
export const rewind: NodeAnimationFunction = (context) => {
  const { circle, baseNodeSize, isDarkMode } = context;
  
  // Backward step: rewind animation for the previous current node
  circle
    .transition()
    .duration(300)
    .attr("r", baseNodeSize * 0.8)
    .attr("fill", CONFIG.colors.TRAVERSAL_VISITED) // Change to visited color
    .attr("stroke", CONFIG.colors.TRAVERSAL_VISITED_STROKE)
    .transition()
    .duration(300)
    .attr("r", baseNodeSize)
    .attr("fill", CONFIG.colors.NODE_FILL) // Reset to normal white color
    .attr("stroke", isDarkMode ? "#FFFFFF" : "black") // Reset to normal stroke
};

/**
 * Shrink and disappear animation for nodes
 * Used for reverse insertion or deletion animations
 * This is the exact reverse of the growAppear animation
 */
export const shrinkDisappear: NodeAnimationFunction = (context) => {
  const { circle, text, baseNodeSize } = context;
  
  // Reverse insertion animation - exact reverse of growAppear
  // Start from normal state, go through expansion, then shrink to nothing
  circle
    .attr("r", baseNodeSize)
    .attr("opacity", 1)
    .transition()
    .duration(300)
    .ease(d3.easeQuadIn)
    .attr("r", baseNodeSize * 1.2)
    .attr("opacity", 0.8)
    .attr("fill", CONFIG.colors.NODE_FILL) // Keep white fill initially
    .style("filter", "drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))") // Red glow for deletion
    .transition()
    .duration(400)
    .ease(d3.easeBackIn)
    .attr("r", 0)
    .attr("opacity", 0)
    .style("filter", null);
  
  // Text animation - reverse of growAppear
  text
    .attr("opacity", 1)
    .transition()
    .duration(300)
    .attr("opacity", 0.8)
    .transition()
    .duration(400)
    .attr("opacity", 0);
  
  // After the animation, restore the node to its normal state for future renders
  // This timeout matches the total animation duration (300 + 400 = 700ms)
  setTimeout(() => {
    if (circle.node()) {
      circle
        .attr("r", baseNodeSize)
        .attr("opacity", 1)
        .style("filter", null);
    }
    if (text.node()) {
      text
        .attr("opacity", 1);
    }
  }, 700);
};

/**
 * Grow and appear animation for nodes
 * Used for reverse deletion or insertion animations
 * This animation is the exact reverse of shrinkDisappear
 */
export const growAppear: NodeAnimationFunction = (context) => {
  const { circle, text, baseNodeSize, nodeData, getNodeColor, getNodeStrokeColor } = context;
  
  // Get the final colors this node should have
  const finalFill = getNodeColor(nodeData);
  const finalStroke = getNodeStrokeColor(nodeData);
  
  // Forward insertion animation - starts from nothing and grows to normal size
  // Clean animation without glow or opacity effects
  circle
    .attr("r", 0)
    .attr("fill", finalFill)
    .attr("stroke", finalStroke)
    .transition()
    .duration(400)
    .ease(d3.easeBackOut)
    .attr("r", baseNodeSize * 1.2)
    .transition()
    .duration(300)
    .ease(d3.easeQuadOut)
    .attr("r", baseNodeSize);
  
  // Text animation - clean fade in
  text
    .attr("opacity", 0)
    .transition()
    .duration(300)
    .attr("opacity", 1);
};

/**
 * Fade animation for nodes
 * General purpose fade in/out animation
 */
export const fade: NodeAnimationFunction = (context) => {
  const { circle } = context;
  
  // General fade animation
  circle
    .transition()
    .duration(300)
    .attr("opacity", 0.6)
    .transition()
    .duration(300)
    .attr("opacity", 1);
};

// =============================================================================
// ANIMATION REGISTRIES
// =============================================================================

/**
 * Registry of all available link animations
 * Maps animation names to their corresponding functions
 */
export const linkAnimations: Record<string, LinkAnimationFunction> = {
  'forward-traverse': forwardTraverse,
  'reverse-traverse': reverseTraverse,
};

/**
 * Registry of all available node animations
 * Maps animation names to their corresponding functions
 */
export const nodeAnimations: Record<string, NodeAnimationFunction> = {
  'pulse': pulse,
  'rewind': rewind,
  'shrink-disappear': shrinkDisappear,
  'grow-appear': growAppear,
  'fade': fade,
};

/**
 * Execute a link animation by name
 * 
 * @param animationName - The name of the animation to execute
 * @param context - The animation context containing all necessary data
 */
export function executeLinkAnimation(animationName: string, context: LinkAnimationContext): void {
  const animationFunction = linkAnimations[animationName];
  if (animationFunction) {
    animationFunction(context);
  } else {
    console.warn(`Unknown link animation: ${animationName}`);
  }
}

/**
 * Execute a node animation by name
 * 
 * @param animationName - The name of the animation to execute
 * @param context - The animation context containing all necessary data
 */
export function executeNodeAnimation(animationName: string, context: NodeAnimationContext): void {
  const animationFunction = nodeAnimations[animationName];
  if (animationFunction) {
    animationFunction(context);
  } else {
    console.warn(`Unknown node animation: ${animationName}`);
  }
}
```

How they hooked onto the renderer:

```
/**
 * Renderer for the binary tree.
 * 
 * This module provides the core rendering engine for binary tree visualizations.
 * It handles SVG-based rendering with D3.js, supporting features like:
 * 
 * - Interactive node manipulation (click, hover)
 * - Step-by-step algorithm visualization
 * - Smooth animations and transitions
 * - Zoom and pan capabilities
 * - Traversal path highlighting
 * - Dark/light theme support
 * - Responsive layout adaptation
 * 
 * The renderer is designed to be generic and work with any binary tree structure
 * while providing rich visual feedback for educational and demonstration purposes.
 * 
 * @example
 * ```typescript
 * import { renderBinaryTree } from './renderer';
 * 
 * renderBinaryTree({
 *   svgRef,
 *   containerRef,
 *   isInitialized,
 *   data: binaryTreeData,
 *   isDarkMode: false,
 *   onNodeClick: (node) => console.log('Clicked:', node.value),
 *   isTraversing: true,
 *   visitedNodes: new Set([1, 3, 5]),
 *   currentStep: currentTraversalStep
 * });
 * ```
 */

import * as d3 from "d3";
import { CONFIG } from "./config";
import { positionBinaryTree, calculateTreeMetrics } from "./layout";
import type { BinaryTreeNode, TreeTypeConfig } from "./types";
import type { AnimationInstructions } from "../../lib/HistoryController";
import { executeLinkAnimation, executeNodeAnimation, type LinkAnimationContext, type NodeAnimationContext } from "./animations";
import type { BinaryTreeVisualState } from "./visual-state";

/**
 * Parameters for binary tree rendering
 * 
 * Simplified configuration object that focuses on pure rendering concerns.
 * All step-related logic has been moved to visual state computation.
 */
export interface RenderBinaryTreeParams {
  /** Reference to the SVG element where the tree will be rendered */
  svgRef: React.RefObject<SVGSVGElement | null>;
  /** Reference to the container div for size calculations */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Reference to track initialization state to prevent re-initialization */
  isInitialized: React.RefObject<boolean>;
  /** The visual state to render */
  visualState: BinaryTreeVisualState;
  /** Optional tree type configuration for specific tree behaviors */
  treeType?: TreeTypeConfig;
  /** Whether dark mode styling should be applied */
  isDarkMode: boolean;
  /** Callback fired when a node is clicked */
  onNodeClick?: (node: BinaryTreeNode) => void;
  /** Callback fired when a node is hovered (null when hover ends) */
  onNodeHover?: (node: BinaryTreeNode | null) => void;
  /** Animation speed for transitions ('slow' | 'normal' | 'fast') */
  animationSpeed?: 'slow' | 'normal' | 'fast';
}

/**
 * Generic binary tree rendering function
 * 
 * The main rendering function that orchestrates the complete visualization process.
 * It handles SVG setup, zoom/pan initialization, layout calculation, and delegates
 * to specialized functions for rendering nodes and links.
 * 
 * This function is called on every visual state update and efficiently handles both
 * initial rendering and subsequent updates with smooth animations.
 * 
 * @param params Configuration object controlling all rendering aspects
 * 
 * @example
 * ```typescript
 * // Basic tree rendering
 * renderBinaryTree({
 *   svgRef,
 *   containerRef, 
 *   isInitialized,
 *   visualState: {
 *     data: myTree,
 *     visitedNodes: new Set(),
 *     highlightPath: [],
 *     currentNode: null,
 *     isTraversing: false
 *   },
 *   isDarkMode: false
 * });
 * 
 * // Advanced rendering with traversal visualization
 * renderBinaryTree({
 *   svgRef,
 *   containerRef,
 *   isInitialized,
 *   visualState: {
 *     data: myTree,
 *     visitedNodes: new Set([5, 8, 12]),
 *     highlightPath: [5, 8, 12],
 *     currentNode: 8,
 *     isTraversing: true,
 *     animationInstructions: currentAnimations
 *   },
 *   isDarkMode: true,
 *   onNodeClick: handleNodeClick
 * });
 * ```
 */
export function renderBinaryTree({
  svgRef,
  containerRef,
  isInitialized,
  visualState,
  treeType: _treeType, // Prefixed with _ to indicate intentionally unused (for future extensibility)
  isDarkMode,
  onNodeClick,
  onNodeHover,
  animationSpeed = 'normal',
}: RenderBinaryTreeParams) {
  // Early return if required DOM elements are not available
  if (!svgRef.current || !containerRef.current) return;

  // Extract visual state properties
  const { 
    data, 
    visitedNodes, 
    highlightPath, 
    currentNode, 
    isTraversing, 
    animationInstructions 
  } = visualState;

  // Get container dimensions for responsive layout
  const containerRect = containerRef.current.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  // Create D3 hierarchy from binary tree data
  // This transforms the flat tree structure into a hierarchical format that D3 can work with
  const root = d3.hierarchy<BinaryTreeNode>(data, (d) => {
    const children = [];
    if (d.left) children.push(d.left);
    if (d.right) children.push(d.right);
    return children.length > 0 ? children : null;
  });

  // Calculate dynamic layout parameters based on tree characteristics
  const { nodeCount } = calculateTreeMetrics(root);
  
  // Dynamic node sizing: larger trees get smaller nodes to fit better
  const baseNodeSize = Math.max(
    CONFIG.nodes.MIN_SIZE,
    Math.min(CONFIG.nodes.MAX_SIZE, CONFIG.nodes.SIZE_OFFSET - nodeCount * CONFIG.nodes.SIZE_STEP)
  );
  
  // Dynamic vertical spacing: larger trees get tighter spacing
  const baseSpacing = Math.max(
    CONFIG.spacing.MIN_VERTICAL,
    Math.min(CONFIG.spacing.MAX_VERTICAL, CONFIG.spacing.VERTICAL_OFFSET - nodeCount * CONFIG.spacing.VERTICAL_STEP)
  );
  
  // Ensure adequate layout width for proper node spacing
  const layoutWidth = Math.max(CONFIG.layout.MIN_LAYOUT_WIDTH, containerWidth);

  // Apply positioning algorithm to all nodes
  positionBinaryTree(root, layoutWidth, baseSpacing);

  // Calculate bounding box for the entire tree to set up viewbox and zoom
  const allNodes = root.descendants() as d3.HierarchyPointNode<BinaryTreeNode>[];
  const bounds = {
    minX: Math.min(...allNodes.map(n => n.x ?? 0)) - baseNodeSize * 2,
    maxX: Math.max(...allNodes.map(n => n.x ?? 0)) + baseNodeSize * 2,
    minY: Math.min(...allNodes.map(n => n.y ?? 0)) - baseNodeSize,
    maxY: Math.max(...allNodes.map(n => n.y ?? 0)) + baseNodeSize,
  };
  
  const vbWidth = bounds.maxX - bounds.minX;
  const vbHeight = bounds.maxY - bounds.minY;

  const svgElement = d3.select(svgRef.current);
  svgElement.attr("width", containerWidth).attr("height", containerHeight);

  // Set up zoom and pan functionality for large trees
  // This provides a smooth navigation experience when trees don't fit in the viewport
  let mainGroup = svgElement.select<SVGGElement>("g.main-group");
  if (mainGroup.empty()) {
    mainGroup = svgElement.append("g").attr("class", "main-group");
    
    // Configure zoom behavior with appropriate constraints
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([CONFIG.zoom.MIN_SCALE, CONFIG.zoom.MAX_SCALE])
      .on("zoom", (event) => {
        mainGroup.attr("transform", event.transform);
      });

    svgElement.call(zoom);

    // Double-click to reset zoom to fit the entire tree
    svgElement.on("dblclick.zoom", () => {
      const scaleX = containerWidth / vbWidth;
      const scaleY = containerHeight / vbHeight;
      const initialScale = Math.min(scaleX, scaleY, 1) * CONFIG.zoom.INITIAL_SCALE_FACTOR;
      const centerX = containerWidth / 2 - (vbWidth * initialScale) / 2;
      const centerY = containerHeight / 2 - (vbHeight * initialScale) / 2;
      const resetTransform = d3.zoomIdentity
        .translate(centerX, centerY)
        .scale(initialScale)
        .translate(-bounds.minX, -bounds.minY);
      
      svgElement.transition()
        .duration(CONFIG.animation.DURATION[animationSpeed])
        .call(zoom.transform, resetTransform);
    });

    // Set initial zoom level to fit the tree nicely in the viewport
    if (!isInitialized.current) {
      const scaleX = containerWidth / vbWidth;
      const scaleY = containerHeight / vbHeight;
      const initialScale = Math.min(scaleX, scaleY, 1) * CONFIG.zoom.INITIAL_SCALE_FACTOR;
      const centerX = containerWidth / 2 - (vbWidth * initialScale) / 2;
      const centerY = containerHeight / 2 - (vbHeight * initialScale) / 2;
      const initialTransform = d3.zoomIdentity
        .translate(centerX, centerY)
        .scale(initialScale)
        .translate(-bounds.minX, -bounds.minY);
      svgElement.call(zoom.transform, initialTransform);
      isInitialized.current = true;
    }
  }

  const svg = mainGroup;

  // Create groups
  let linksGroup = svg.select<SVGGElement>("g.links-group");
  let nodesGroup = svg.select<SVGGElement>("g.nodes-group");
  if (linksGroup.empty()) linksGroup = svg.append("g").attr("class", "links-group");
  if (nodesGroup.empty()) nodesGroup = svg.append("g").attr("class", "nodes-group");

  const animationDuration = CONFIG.animation.DURATION[animationSpeed];

  // Render links
  renderLinks({
    linksGroup,
    root,
    highlightPath,
    visitedNodes,
    isTraversing,
    isDarkMode,
    baseNodeSize,
    animationDuration,
    animationInstructions,
  });

  // Render nodes
  renderNodes({
    nodesGroup,
    root,
    highlightPath,
    visitedNodes,
    currentNode,
    isTraversing,
    isDarkMode,
    baseNodeSize,
    animationDuration,
    onNodeClick,
    onNodeHover,
    animationInstructions,
  });
}

function renderLinks({
  linksGroup,
  root,
  highlightPath,
  visitedNodes,
  isTraversing,
  isDarkMode,
  baseNodeSize,
  animationDuration,
  animationInstructions,
}: {
  linksGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  root: d3.HierarchyNode<BinaryTreeNode>;
  highlightPath: number[];
  visitedNodes: Set<number>;
  isTraversing: boolean;
  isDarkMode: boolean;
  baseNodeSize: number;
  animationDuration: number;
  animationInstructions?: AnimationInstructions;
}) {
  const linkStroke = isDarkMode ? "#FFFFFF" : "black";

  // Helper function to get link animation from instructions
  const getLinkAnimation = (sourceValue: number, targetValue: number) => {
    if (!animationInstructions) return null;
    
    return animationInstructions.instructions.find(instruction => 
      instruction.type === 'link' && 
      instruction.fromValue === sourceValue && 
      instruction.toValue === targetValue
    ) as any;
  };

  // Helper function to get reverse link animation from instructions
  const getReverseLinkAnimation = (sourceValue: number, targetValue: number) => {
    if (!animationInstructions) return null;
    
    return animationInstructions.instructions.find(instruction => 
      instruction.type === 'link' && 
      instruction.fromValue === targetValue && 
      instruction.toValue === sourceValue &&
      instruction.animation === 'reverse-traverse'
    ) as any;
  };

  // Helper function to get link color based on state
  const getLinkColor = (sourceValue: number, targetValue: number) => {
    const sourceHighlighted = highlightPath.includes(sourceValue);
    const targetHighlighted = highlightPath.includes(targetValue);
    const sourceVisited = visitedNodes.has(sourceValue);
    const targetVisited = visitedNodes.has(targetValue);
    const linkAnimation = getLinkAnimation(sourceValue, targetValue);
    const reverseLinkAnimation = getReverseLinkAnimation(sourceValue, targetValue);
    
    // Active traversal link takes highest priority
    if (linkAnimation?.animation === 'forward-traverse') {
      return CONFIG.colors.TRAVERSAL_CURRENT;
    }
    
    // Reverse traversal link - this explicitly resets the link color
    if (reverseLinkAnimation) {
      return CONFIG.colors.TRAVERSAL_VISITED;
    }
    
    // Visited links during traversal (green) - this should maintain color during rewind
    if (isTraversing && sourceVisited && targetVisited) {
      return CONFIG.colors.TRAVERSAL_PATH;
    }
    
    if (sourceHighlighted && targetHighlighted) {
      return CONFIG.colors.HIGHLIGHT_STROKE;
    }
    
    return linkStroke;
  };

  // Helper function to get link width based on state
  const getLinkWidth = (sourceValue: number, targetValue: number) => {
    const linkAnimation = getLinkAnimation(sourceValue, targetValue);
    const reverseLinkAnimation = getReverseLinkAnimation(sourceValue, targetValue);
    const baseWidth = Math.max(1, baseNodeSize / 16);
    
    return (linkAnimation || reverseLinkAnimation) ? baseWidth * 3 : baseWidth;
  };

  // Clean up any glow filters from nodes
  const allNodeCircles = d3.select(`g.nodes-group`).selectAll('.node circle');
  allNodeCircles.attr("filter", null);

  // Clean up only old traveling dots, not ones that are currently being created
  // We'll let the animations clean themselves up when they complete

  linksGroup
    .selectAll<SVGLineElement, d3.HierarchyLink<BinaryTreeNode>>(".link")
    .data(root.links(), (d: any) => `${d.source.data.value}-${d.target.data.value}`)
    .join(
      (enter) => {
        const links = enter
          .append("line")
          .attr("class", "link")
          .attr("x1", (d) => d.source.x ?? 0)
          .attr("y1", (d) => d.source.y ?? 0)
          .attr("x2", (d) => d.source.x ?? 0)
          .attr("y2", (d) => d.source.y ?? 0)
          .attr("stroke", (d) => getLinkColor(d.source.data.value, d.target.data.value))
          .attr("stroke-width", (d) => getLinkWidth(d.source.data.value, d.target.data.value))
          .attr("opacity", 1);

        requestAnimationFrame(() => {
          links
            .transition()
            .delay((_, i) => i * 50 + 150)
            .duration(animationDuration)
            .attr("x2", (d) => d.target.x ?? 0)
            .attr("y2", (d) => d.target.y ?? 0);
        });

        return links;
      },
      (update) => {
        const updatedLinks = update
          .transition()
          .duration(animationDuration)
          .attr("x1", (d) => d.source.x ?? 0)
          .attr("y1", (d) => d.source.y ?? 0)
          .attr("x2", (d) => d.target.x ?? 0)
          .attr("y2", (d) => d.target.y ?? 0)
          .attr("stroke", (d) => getLinkColor(d.source.data.value, d.target.data.value))
          .attr("stroke-width", (d) => getLinkWidth(d.source.data.value, d.target.data.value));

        // Execute animation instructions for links
        update.each(function(d) {
          const linkAnimation = getLinkAnimation(d.source.data.value, d.target.data.value);
          const reverseLinkAnimation = getReverseLinkAnimation(d.source.data.value, d.target.data.value);
          
          if (linkAnimation?.animation === 'forward-traverse') {
            const animationContext: LinkAnimationContext = {
              linkElement: d3.select(this),
              linkData: d,
              linksGroup,
              baseNodeSize,
              isDarkMode,
              getLinkColor,
              getLinkWidth,
            };
            executeLinkAnimation('forward-traverse', animationContext);
          } else if (reverseLinkAnimation?.animation === 'reverse-traverse') {
            const animationContext: LinkAnimationContext = {
              linkElement: d3.select(this),
              linkData: d,
              linksGroup,
              baseNodeSize,
              isDarkMode,
              getLinkColor,
              getLinkWidth,
            };
            executeLinkAnimation('reverse-traverse', animationContext);
          }
        });

        return updatedLinks;
      },
      (exit) =>
        exit
          .transition()
          .duration(CONFIG.animation.EXIT_DURATION)
          .attr("opacity", 0)
          .remove()
    );
}

function renderNodes({
  nodesGroup,
  root,
  highlightPath,
  visitedNodes,
  currentNode,
  isTraversing,
  isDarkMode,
  baseNodeSize,
  animationDuration,
  onNodeClick,
  onNodeHover,
  animationInstructions,
}: {
  nodesGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  root: d3.HierarchyNode<BinaryTreeNode>;
  highlightPath: number[];
  visitedNodes: Set<number>;
  currentNode: number | null;
  isTraversing: boolean;
  isDarkMode: boolean;
  baseNodeSize: number;
  animationDuration: number;
  onNodeClick?: (node: BinaryTreeNode) => void;
  onNodeHover?: (node: BinaryTreeNode | null) => void;
  animationInstructions?: AnimationInstructions;
}) {
  const nodeColor = (d: d3.HierarchyPointNode<BinaryTreeNode>) => {
    const nodeValue = d.data.value;
    
    // Current traversal node takes highest priority
    if (currentNode !== null && nodeValue === currentNode) {
      return CONFIG.colors.TRAVERSAL_CURRENT;
    }
    
    // Visited nodes during traversal
    if (isTraversing && visitedNodes.has(nodeValue)) {
      return CONFIG.colors.TRAVERSAL_VISITED;
    }
    
    // Regular highlight path
    if (highlightPath.includes(nodeValue)) {
      return CONFIG.colors.HIGHLIGHT_FILL;
    }
    
    return d.data.color || CONFIG.colors.NODE_FILL;
  };

  const nodeStrokeColor = (d: d3.HierarchyPointNode<BinaryTreeNode>) => {
    const nodeValue = d.data.value;
    
    // Current traversal node
    if (currentNode !== null && nodeValue === currentNode) {
      return CONFIG.colors.TRAVERSAL_CURRENT_STROKE;
    }
    
    // Visited nodes during traversal
    if (isTraversing && visitedNodes.has(nodeValue)) {
      return CONFIG.colors.TRAVERSAL_VISITED_STROKE;
    }
    
    // Regular highlight path
    if (highlightPath.includes(nodeValue)) {
      return CONFIG.colors.HIGHLIGHT_STROKE;
    }
    
    return isDarkMode ? "#FFFFFF" : "black";
  };

  // Helper function to get node animation from instructions
  const getNodeAnimation = (nodeValue: number) => {
    if (!animationInstructions) return null;
    
    return animationInstructions.instructions.find(instruction => 
      instruction.type === 'node' && 
      instruction.nodeValue === nodeValue
    ) as any;
  };

  nodesGroup
    .selectAll<SVGGElement, d3.HierarchyPointNode<BinaryTreeNode>>(".node")
    .data(
      root.descendants() as d3.HierarchyPointNode<BinaryTreeNode>[],
      (d: any) => d.data.value
    )
    .join(
      (enter) => {
        const nodes = enter
          .append("g")
          .attr("class", "node")
          .attr("transform", (d) => {
            const parent = d.parent;
            const startX = parent?.x ?? d.x ?? 0;
            const startY = parent?.y ?? d.y ?? 0;
            return `translate(${startX},${startY})`;
          })
          .style("cursor", onNodeClick ? "pointer" : "default");

        nodes
          .append("circle")
          .attr("r", 0)
          .attr("fill", nodeColor)
          .attr("stroke", nodeStrokeColor)
          .attr("stroke-width", Math.max(1, baseNodeSize / 16));

        nodes
          .append("text")
          .attr("dominant-baseline", "middle")
          .attr("text-anchor", "middle")
          .attr("fill", CONFIG.colors.NODE_TEXT)
          .attr("font-weight", "bold")
          .attr("font-size", `${CONFIG.nodes.TEXT_FONT_SIZE_PX}px`)
          .attr("opacity", 1)
          .text((d) => String(d.data.value));

        // Add interaction handlers
        if (onNodeClick) {
          nodes.on("click", (event, d) => {
            event.stopPropagation();
            onNodeClick(d.data);
          });
        }

        if (onNodeHover) {
          nodes
            .on("mouseenter", (_, d) => onNodeHover(d.data))
            .on("mouseleave", () => onNodeHover(null));
        }

        // Add hover effects
        nodes
          .on("mouseenter", function() {
            d3.select(this).select("circle")
              .transition()
              .duration(200)
              .attr("stroke-width", Math.max(2, baseNodeSize / 8));
          })
          .on("mouseleave", function() {
            d3.select(this).select("circle")
              .transition()
              .duration(200)
              .attr("stroke-width", Math.max(1, baseNodeSize / 16));
          });

        requestAnimationFrame(() => {
          // Position nodes first
          nodes
            .transition()
            .duration(animationDuration)
            .ease(d3.easeCubicOut)
            .attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
          
          // Then execute growAppear animation for each new node
          nodes.each(function(d) {
            const nodeGroup = d3.select(this);
            const circle = nodeGroup.select("circle");
            const text = nodeGroup.select("text");
            
            const animationContext: NodeAnimationContext = {
              nodeGroup,
              circle,
              text,
              nodeData: d,
              baseNodeSize,
              isDarkMode,
              getNodeColor: nodeColor,
              getNodeStrokeColor: nodeStrokeColor,
            };
            
            executeNodeAnimation('grow-appear', animationContext);
          });
        });

        return nodes;
      },
      (update) => {
        const updatedNodes = update
          .transition()
          .duration(animationDuration)
          .attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
          .call((transition) => {
            transition.select("circle")
              .attr("r", baseNodeSize)
              .attr("fill", nodeColor)
              .attr("stroke", nodeStrokeColor);
          });

        // Execute animation instructions for nodes (excluding exit animations)
        update.each(function(d) {
          const nodeValue = d.data.value;
          const nodeAnimation = getNodeAnimation(nodeValue);
          
          // Only execute non-exit animations here (exit animations are handled in the exit selection)
          if (nodeAnimation && nodeAnimation.animation !== 'shrink-disappear') {
            const nodeGroup = d3.select(this);
            const circle = nodeGroup.select("circle");
            const text = nodeGroup.select("text");
            
            const animationContext: NodeAnimationContext = {
              nodeGroup,
              circle,
              text,
              nodeData: d,
              baseNodeSize,
              isDarkMode,
              getNodeColor: nodeColor,
              getNodeStrokeColor: nodeStrokeColor,
            };
            
            executeNodeAnimation(nodeAnimation.animation, animationContext);
          }
        });

        return updatedNodes;
      },
      (exit) => {
        // Use the refined delete animation for all exiting nodes
        return exit.each(function(d) {
          const nodeGroup = d3.select(this);
          const circle = nodeGroup.select("circle");
          const text = nodeGroup.select("text");
          
          // Execute the shrink-disappear animation for all exiting nodes
          const animationContext: NodeAnimationContext = {
            nodeGroup,
            circle,
            text,
            nodeData: d,
            baseNodeSize,
            isDarkMode,
            getNodeColor: nodeColor,
            getNodeStrokeColor: nodeStrokeColor,
          };
          
          executeNodeAnimation('shrink-disappear', animationContext);
          
          // Remove the node after the animation completes (700ms total duration)
          setTimeout(() => {
            nodeGroup.remove();
          }, 700);
        });
      }
    );
}
```