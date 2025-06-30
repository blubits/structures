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
  NodeAnimationContext,
  LinkAnimationContext,
  TreeAnimationContext
} from '../../../lib/core/types';
import type { 
  BinaryTreeNodeAnimationContext, 
  BinaryTreeLinkAnimationContext,
  BinaryTreeVisualizationContext 
} from '../types';

// =============================================================================
// NODE ANIMATIONS
// =============================================================================

/**
 * Pulse animation - highlights a node with a gentle pulse effect
 */
const pulseNodeAnimation = (context: BinaryTreeNodeAnimationContext): void => {
  const { element, hint, nodeData } = context;
  const circle = d3.select(element).select('circle');
  const duration = hint.duration || 400;
  
  const originalRadius = circle.attr('r');
  const pulseRadius = parseFloat(originalRadius) * 1.2;
  
  circle
    .transition()
    .duration(duration / 2)
    .attr('r', pulseRadius)
    .attr('fill', '#3b82f6')
    .attr('stroke', '#1d4ed8')
    .attr('stroke-width', 3)
    .transition()
    .duration(duration / 2)
    .attr('r', originalRadius)
    .attr('fill', getNodeColor(nodeData.state))
    .attr('stroke', getNodeStrokeColor(nodeData.state))
    .attr('stroke-width', 2)
    .on('end', () => context.onComplete?.());
};

/**
 * Appear animation - node grows from nothing
 */
const appearNodeAnimation = (context: BinaryTreeNodeAnimationContext): void => {
  const { element, hint } = context;
  const circle = d3.select(element).select('circle');
  const text = d3.select(element).select('text');
  const duration = hint.duration || 500;
  
  const finalRadius = circle.attr('r') || '25';
  
  // Start from zero size
  circle
    .attr('r', 0)
    .attr('opacity', 0)
    .transition()
    .duration(duration * 0.8)
    .ease(d3.easeBackOut)
    .attr('r', finalRadius)
    .attr('opacity', 1);
    
  text
    .attr('opacity', 0)
    .transition()
    .duration(duration * 0.6)
    .delay(duration * 0.2)
    .attr('opacity', 1)
    .on('end', () => context.onComplete?.());
};

/**
 * Disappear animation - node shrinks to nothing
 */
const disappearNodeAnimation = (context: BinaryTreeNodeAnimationContext): void => {
  const { element, hint } = context;
  const circle = d3.select(element).select('circle');
  const text = d3.select(element).select('text');
  const duration = hint.duration || 400;
  
  text
    .transition()
    .duration(duration * 0.4)
    .attr('opacity', 0);
    
  circle
    .transition()
    .duration(duration * 0.8)
    .delay(duration * 0.2)
    .ease(d3.easeBackIn)
    .attr('r', 0)
    .attr('opacity', 0)
    .on('end', () => {
      d3.select(element).remove();
      context.onComplete?.();
    });
};

/**
 * Highlight left animation - shows direction to left child
 */
const highlightLeftAnimation = (context: BinaryTreeNodeAnimationContext): void => {
  const { element, hint } = context;
  const duration = hint.duration || 300;
  
  // Add a visual indicator pointing left
  const indicator = d3.select(element)
    .append('path')
    .attr('d', 'M -35 0 L -45 -5 L -45 5 Z')
    .attr('fill', '#10b981')
    .attr('opacity', 0);
    
  indicator
    .transition()
    .duration(duration / 2)
    .attr('opacity', 0.8)
    .transition()
    .duration(duration / 2)
    .attr('opacity', 0)
    .on('end', () => {
      indicator.remove();
      context.onComplete?.();
    });
};

/**
 * Highlight right animation - shows direction to right child
 */
const highlightRightAnimation = (context: BinaryTreeNodeAnimationContext): void => {
  const { element, hint } = context;
  const duration = hint.duration || 300;
  
  // Add a visual indicator pointing right
  const indicator = d3.select(element)
    .append('path')
    .attr('d', 'M 35 0 L 45 -5 L 45 5 Z')
    .attr('fill', '#10b981')
    .attr('opacity', 0);
    
  indicator
    .transition()
    .duration(duration / 2)
    .attr('opacity', 0.8)
    .transition()
    .duration(duration / 2)
    .attr('opacity', 0)
    .on('end', () => {
      indicator.remove();
      context.onComplete?.();
    });
};

/**
 * Found animation - celebrates finding the target
 */
const foundNodeAnimation = (context: BinaryTreeNodeAnimationContext): void => {
  const { element, hint } = context;
  const circle = d3.select(element).select('circle');
  const duration = hint.duration || 600;
  
  const originalRadius = circle.attr('r');
  
  // Celebratory pulsing with color change
  circle
    .transition()
    .duration(duration / 3)
    .attr('r', parseFloat(originalRadius) * 1.3)
    .attr('fill', '#10b981')
    .attr('stroke', '#059669')
    .transition()
    .duration(duration / 3)
    .attr('r', originalRadius)
    .transition()
    .duration(duration / 3)
    .attr('r', parseFloat(originalRadius) * 1.1)
    .transition()
    .duration(duration / 3)
    .attr('r', originalRadius)
    .on('end', () => context.onComplete?.());
};

/**
 * Shake animation - indicates error or conflict
 */
const shakeNodeAnimation = (context: BinaryTreeNodeAnimationContext): void => {
  const { element, hint } = context;
  const duration = hint.duration || 400;
  const originalTransform = d3.select(element).attr('transform') || '';
  
  let shakeCount = 0;
  const maxShakes = 6;
  const shakeDistance = 3;
  
  const shake = () => {
    if (shakeCount >= maxShakes) {
      d3.select(element).attr('transform', originalTransform);
      context.onComplete?.();
      return;
    }
    
    const direction = shakeCount % 2 === 0 ? shakeDistance : -shakeDistance;
    const transform = `${originalTransform} translate(${direction}, 0)`;
    
    d3.select(element)
      .transition()
      .duration(duration / maxShakes)
      .attr('transform', transform)
      .on('end', () => {
        shakeCount++;
        shake();
      });
  };
  
  shake();
};

// =============================================================================
// LINK ANIMATIONS
// =============================================================================

/**
 * Traverse animation - shows movement along a link
 */
const traverseLinkAnimation = (context: BinaryTreeLinkAnimationContext): void => {
  const { element, hint, sourceNode, targetNode } = context;
  const duration = hint.duration || 600;
  
  const link = d3.select(element);
  const originalWidth = link.attr('stroke-width') || '2';
  
  // Pulse the link
  link
    .transition()
    .duration(duration / 3)
    .attr('stroke-width', parseFloat(originalWidth) * 2)
    .attr('stroke', '#3b82f6')
    .transition()
    .duration(duration / 3)
    .attr('stroke-width', originalWidth)
    .attr('stroke', '#6b7280')
    .on('end', () => context.onComplete?.());
  
  // Add traveling dot
  const sourcePos = getNodePosition(sourceNode);
  const targetPos = getNodePosition(targetNode);
  
  if (sourcePos && targetPos && element.parentNode) {
    const parentElement = element.parentNode as Element;
    const dot = d3.select(parentElement)
      .append('circle')
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .attr('cx', sourcePos.x)
      .attr('cy', sourcePos.y)
      .attr('opacity', 0);
      
    dot
      .transition()
      .duration(duration / 4)
      .attr('opacity', 1)
      .transition()
      .duration(duration / 2)
      .attr('cx', targetPos.x)
      .attr('cy', targetPos.y)
      .transition()
      .duration(duration / 4)
      .attr('opacity', 0)
      .on('end', () => dot.remove());
  }
};

// =============================================================================
// TREE ANIMATIONS
// =============================================================================

/**
 * Tree layout animation - animates layout changes
 */
const layoutTreeAnimation = (context: BinaryTreeVisualizationContext): void => {
  const { container, hints } = context;
  const duration = hints[0]?.duration || 800;
  
  // Find all nodes and links in the tree
  const nodes = d3.select(container).selectAll('.node');
  const links = d3.select(container).selectAll('.link');
  
  // Animate layout transitions
  nodes
    .transition()
    .duration(duration)
    .ease(d3.easeQuadInOut)
    .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    
  links
    .transition()
    .duration(duration)
    .ease(d3.easeQuadInOut)
    .attr('d', (d: any) => createLinkPath(d));
    
  setTimeout(() => context.onComplete?.(), duration);
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Gets the color for a node based on its state
 */
function getNodeColor(state: 'default' | 'active' | 'visited'): string {
  switch (state) {
    case 'active': return '#3b82f6';
    case 'visited': return '#10b981';
    default: return '#e5e7eb';
  }
}

/**
 * Gets the stroke color for a node based on its state
 */
function getNodeStrokeColor(state: 'default' | 'active' | 'visited'): string {
  switch (state) {
    case 'active': return '#1d4ed8';
    case 'visited': return '#059669';
    default: return '#6b7280';
  }
}

/**
 * Gets the position of a node element
 */
function getNodePosition(node: any): { x: number; y: number } | null {
  if (!node || !node.x || !node.y) return null;
  return { x: node.x, y: node.y };
}

/**
 * Creates a curved path between two nodes
 */
function createLinkPath(linkData: any): string {
  const source = linkData.source;
  const target = linkData.target;
  
  return `M ${source.x} ${source.y} 
          C ${source.x} ${(source.y + target.y) / 2} 
            ${target.x} ${(source.y + target.y) / 2} 
            ${target.x} ${target.y}`;
}

// =============================================================================
// WRAPPER FUNCTIONS FOR REGISTRATION
// =============================================================================

/**
 * Creates a wrapper function that converts generic NodeAnimationContext
 * to BinaryTreeNodeAnimationContext for compatibility with the core system.
 */
function createNodeAnimationWrapper(
  animation: (context: BinaryTreeNodeAnimationContext) => void
) {
  return (context: NodeAnimationContext) => {
    // Extract additional binary tree context from nodeData
    const nodeData = context.nodeData as any; // Will be BinaryTreeNode
    const treeState = context.nodeData as any; // Mock tree state - in real usage this would come from renderer
    
    const binaryTreeContext: BinaryTreeNodeAnimationContext = {
      ...context,
      nodeData,
      treeState,
    };
    
    animation(binaryTreeContext);
  };
}

/**
 * Creates a wrapper function that converts generic LinkAnimationContext
 * to BinaryTreeLinkAnimationContext for compatibility with the core system.
 */
function createLinkAnimationWrapper(
  animation: (context: BinaryTreeLinkAnimationContext) => void
) {
  return (context: LinkAnimationContext) => {
    // Extract additional binary tree context from sourceData/targetData
    const sourceNode = context.sourceData as any; // Will be BinaryTreeNode
    const targetNode = context.targetData as any; // Will be BinaryTreeNode
    const treeState = context.sourceData as any; // Mock tree state
    
    const binaryTreeContext: BinaryTreeLinkAnimationContext = {
      ...context,
      sourceNode,
      targetNode,
      treeState,
    };
    
    animation(binaryTreeContext);
  };
}

/**
 * Creates a wrapper function that converts generic TreeAnimationContext
 * to BinaryTreeVisualizationContext for compatibility with the core system.
 */
function createTreeAnimationWrapper(
  animation: (context: BinaryTreeVisualizationContext) => void
) {
  return (context: TreeAnimationContext) => {
    // Extract binary tree context from treeData
    const treeState = context.treeData as any; // Will be BinaryTree
    
    const binaryTreeContext: BinaryTreeVisualizationContext = {
      ...context,
      treeState,
    };
    
    animation(binaryTreeContext);
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
  // Node animations
  AnimationController.registerNode('pulse', createNodeAnimationWrapper(pulseNodeAnimation));
  AnimationController.registerNode('appear', createNodeAnimationWrapper(appearNodeAnimation));
  AnimationController.registerNode('disappear', createNodeAnimationWrapper(disappearNodeAnimation));
  AnimationController.registerNode('highlight-left', createNodeAnimationWrapper(highlightLeftAnimation));
  AnimationController.registerNode('highlight-right', createNodeAnimationWrapper(highlightRightAnimation));
  AnimationController.registerNode('found', createNodeAnimationWrapper(foundNodeAnimation));
  AnimationController.registerNode('shake', createNodeAnimationWrapper(shakeNodeAnimation));
  
  // Link animations
  AnimationController.registerLink('traverse', createLinkAnimationWrapper(traverseLinkAnimation));
  AnimationController.registerLink('traverse-left', createLinkAnimationWrapper(traverseLinkAnimation));
  AnimationController.registerLink('traverse-right', createLinkAnimationWrapper(traverseLinkAnimation));
  
  // Tree animations
  AnimationController.registerTree('layout', createTreeAnimationWrapper(layoutTreeAnimation));
}

/**
 * Default export for convenience
 */
export default registerBinaryTreeAnimations;
