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
