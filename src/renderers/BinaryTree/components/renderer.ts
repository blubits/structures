import * as d3 from 'd3';
import { processBinaryTreeAnimations } from './animations';
import type { BinaryTreeNode } from '../types';
import type { AnimationHint } from '../../../lib/core/types';
import { BINARY_TREE_COLORS } from '../config.colors';

/**
 * Visual state interface for the binary tree renderer
 * Now simplified to focus on pure data representation
 */
export interface BinaryTreeVisualState {
  tree: BinaryTreeNode | null;
  animationSpeed: 'slow' | 'normal' | 'fast';
  theme: 'light' | 'dark';
  // Animation hints - the ONLY source of animation data
  animationHints?: AnimationHint[];
}

/**
 * Configuration for tree layout and appearance
 */
const CONFIG = {
  nodeRadius: 20,
  fontSize: 12,
  levelHeight: 80,
  siblingDistance: 60,
  margins: { top: 40, right: 40, bottom: 40, left: 40 },
  zoom: {
    minScale: 0.1,
    maxScale: 4,
    initialScaleFactor: 1.5
  },
  colors: BINARY_TREE_COLORS
};

/**
 * Calculate positions for tree nodes using a simple algorithm
 */
function calculateTreeLayout(root: BinaryTreeNode | null): Map<number, {x: number, y: number}> {
  const positions = new Map<number, {x: number, y: number}>();
  if (!root) return positions;

  // Calculate horizontal spacing based on tree width
  const getTreeWidth = (node: BinaryTreeNode | null): number => {
    if (!node) return 0;
    if (!node.left && !node.right) return 1;
    return getTreeWidth(node.left) + getTreeWidth(node.right);
  };

  const treeWidth = getTreeWidth(root);
  const totalWidth = Math.max(treeWidth * CONFIG.siblingDistance, 400);

  // Position nodes using in-order traversal
  let currentX = CONFIG.margins.left;
  
  const positionNodes = (node: BinaryTreeNode | null, depth: number = 0): void => {
    if (!node) return;

    // Position left subtree first
    if (node.left) {
      positionNodes(node.left, depth + 1);
    }

    // Position current node
    const y = CONFIG.margins.top + depth * CONFIG.levelHeight;
    positions.set(node.value, { x: currentX, y });
    currentX += CONFIG.siblingDistance;

    // Position right subtree
    if (node.right) {
      positionNodes(node.right, depth + 1);
    }
  };

  positionNodes(root);
  
  // Center the tree horizontally
  const allPositions = Array.from(positions.values());
  const minX = Math.min(...allPositions.map(p => p.x));
  const maxX = Math.max(...allPositions.map(p => p.x));
  const treeActualWidth = maxX - minX;
  const offsetX = (totalWidth - treeActualWidth) / 2;

  // Apply horizontal centering
  for (const [value, pos] of positions.entries()) {
    positions.set(value, { x: pos.x + offsetX, y: pos.y });
  }

  return positions;
}

// Store zoom behavior globally to maintain state between renders
let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;
let isZoomInitialized = false;

/**
 * Render the binary tree with D3 including zoom and pan functionality
 * Animation is now handled solely through AnimationController via hints
 */
export function renderBinaryTree(
  svgElement: SVGSVGElement, 
  containerElement: HTMLElement, 
  visualState: BinaryTreeVisualState,
  isFirstRender: boolean = false
): void {
  if (import.meta.env.DEV) {
    console.log('🌳 renderBinaryTree: Function called', {
      hasSvgElement: !!svgElement,
      hasTree: !!visualState.tree,
      treeValue: visualState.tree?.value,
      theme: visualState.theme,
      animationSpeed: visualState.animationSpeed,
      animationHintsCount: visualState.animationHints?.length || 0,
      isFirstRender,
      stackTrace: new Error().stack?.split('\n').slice(1, 6) // First 5 stack frames
    });
  }

  const { tree, theme } = visualState;
  
  if (!tree) {
    if (import.meta.env.DEV) {
      console.log('🌳 renderBinaryTree: No tree data, clearing SVG');
    }
    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();
    
    // Reset zoom initialization when tree is cleared
    isZoomInitialized = false;
    zoomBehavior = null;
    
    // Add a helpful message for empty tree using native DOM manipulation
    const containerElementRef = svgElement.parentElement;
    if (containerElementRef) {
      // Remove existing empty message
      const existingMessage = containerElementRef.querySelector('.empty-tree-message');
      if (existingMessage) {
        existingMessage.remove();
      }
      
      // Create new empty message
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-tree-message';
      emptyMessage.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: #6b7280;
        font-size: 18px;
        pointer-events: none;
      `;
      
      emptyMessage.innerHTML = `
        <div>
          <div style="font-size: 48px; margin-bottom: 16px;">🌳</div>
          <div style="font-weight: 600; margin-bottom: 8px;">Empty Binary Search Tree</div>
          <div style="font-size: 14px;">Use the operations menu to add nodes</div>
        </div>
      `;
      
      containerElementRef.appendChild(emptyMessage);
    }
    
    return;
  } else {
    // Remove empty message if tree exists
    const containerElementRef = svgElement.parentElement;
    if (containerElementRef) {
      const existingMessage = containerElementRef.querySelector('.empty-tree-message');
      if (existingMessage) {
        existingMessage.remove();
      }
    }
  }

  // Calculate layout
  const positions = calculateTreeLayout(tree);
  const allPositions = Array.from(positions.values());
  
  if (import.meta.env.DEV) {
    console.log('🌳 renderBinaryTree: Layout calculated', {
      positionsCount: positions.size,
      allPositionsLength: allPositions.length,
      positions: Object.fromEntries(positions)
    });
  }
  
  if (allPositions.length === 0) return;

  // Calculate SVG dimensions and bounds
  const minX = Math.min(...allPositions.map(p => p.x));
  const maxX = Math.max(...allPositions.map(p => p.x));
  const minY = Math.min(...allPositions.map(p => p.y));
  const maxY = Math.max(...allPositions.map(p => p.y));
  
  const bounds = {
    minX: minX - CONFIG.nodeRadius * 6, // Increased padding
    maxX: maxX + CONFIG.nodeRadius * 6,
    minY: minY - CONFIG.nodeRadius * 4, // Increased padding
    maxY: maxY + CONFIG.nodeRadius * 4
  };
  
  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;

  // Set up SVG with responsive dimensions
  const svg = d3.select(svgElement)
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `${bounds.minX} ${bounds.minY} ${contentWidth} ${contentHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('max-width', '100%')
    .style('max-height', '100%');

  // Set up or get main group for zoom/pan
  let mainGroup = svg.select<SVGGElement>('g.main-group');
  if (mainGroup.empty()) {
    mainGroup = svg.append('g').attr('class', 'main-group');
  }

  // Initialize zoom behavior if needed (simplified for responsive design)
  if (!zoomBehavior) {
    zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
      });
    
    svg.call(zoomBehavior);
    isZoomInitialized = true;
  }

  // Get or create persistent groups for links and nodes (don't clear them)
  let linkGroup = mainGroup.select<SVGGElement>('g.links');
  if (linkGroup.empty()) {
    linkGroup = mainGroup.append('g').attr('class', 'links');
  }
  
  let nodeGroup = mainGroup.select<SVGGElement>('g.nodes');
  if (nodeGroup.empty()) {
    nodeGroup = mainGroup.append('g').attr('class', 'nodes');
  }

  // Get color scheme
  const colors = CONFIG.colors[theme];

  if (import.meta.env.DEV) {
    console.log('🎨 Color scheme:', { theme, colors });
  }

  // Collect all nodes and links for rendering
  const { nodes, links } = collectNodesAndLinks(tree, positions);

  if (import.meta.env.DEV) {
    console.log('🌳 renderBinaryTree: Collected nodes and links', {
      nodesCount: nodes.length,
      linksCount: links.length,
      nodes: nodes.map((n: NodeData) => ({ value: n.value, state: n.state }))
    });
  }

  // Get animation duration for transitions
  const animationDuration = isFirstRender ? 0 : getAnimationDuration(visualState.animationSpeed);

  // Render links with D3 join pattern
  linkGroup.selectAll('line')
    .data(links, (d: any) => (d as LinkData).id)
    .join(
      enter => enter.append('line')
        .attr('x1', (d: any) => (d as LinkData).source.x)
        .attr('y1', (d: any) => (d as LinkData).source.y)
        .attr('x2', isFirstRender ? (d: any) => (d as LinkData).target.x : (d: any) => (d as LinkData).source.x) // Skip animation on first render
        .attr('y2', isFirstRender ? (d: any) => (d as LinkData).target.y : (d: any) => (d as LinkData).source.y)
        .attr('stroke', colors.link.default)
        .attr('stroke-width', 2)
        .attr('opacity', isFirstRender ? 0.8 : 0)
        .call(enter => isFirstRender ? enter : enter.transition()
          .duration(animationDuration)
          .attr('x2', (d: any) => (d as LinkData).target.x)
          .attr('y2', (d: any) => (d as LinkData).target.y)
          .attr('opacity', 0.8)
        ),
      update => update
        .call(update => update.transition()
          .duration(animationDuration)
          .attr('x1', (d: any) => (d as LinkData).source.x)
          .attr('y1', (d: any) => (d as LinkData).source.y)
          .attr('x2', (d: any) => (d as LinkData).target.x)
          .attr('y2', (d: any) => (d as LinkData).target.y)
          .attr('stroke', colors.link.default)
          .attr('opacity', 0.8)
        ),
      exit => exit
        .call(exit => exit.transition()
          .duration(animationDuration)
          .attr('opacity', 0)
          .remove()
        )
    )
    // Execute animations using the new generic system
    .each(function(d: any) {
      const linkData = d as LinkData;
      if (visualState.animationHints && visualState.animationHints.length > 0) {
        // Store element reference for the link
        const linkElement = this as Element;
        linkElement.setAttribute('data-link-id', linkData.id);
      }
    });

  // Render nodes with D3 join pattern
  const nodeElements = nodeGroup.selectAll('g.node')
    .data(nodes, (d: any) => (d as NodeData).value)
    .join(
      enter => {
        const nodeGroup = enter.append('g')
          .attr('class', 'node')
          .attr('transform', (d: any) => `translate(${(d as NodeData).x}, ${(d as NodeData).y})`)
          .style('cursor', 'pointer');

        // Add circles
        nodeGroup.append('circle')
          .attr('r', CONFIG.nodeRadius)
          .attr('fill', (d: any) => getNodeFillColor((d as NodeData).state, colors))
          .attr('stroke', (d: any) => {
            const state = (d as NodeData).state as 'default' | 'active' | 'visited';
            return colors.node.border[state] || colors.node.border.default;
          })
          .attr('stroke-width', 2)
          .style('opacity', 1);

        // Add text
        nodeGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('font-size', CONFIG.fontSize)
          .attr('font-weight', 'bold')
          .attr('fill', colors.node.text)
          .text((d: any) => (d as NodeData).value);

        return nodeGroup;
      },
      update => {
        // Update positions and states with smooth transitions
        const updatedNodes = update
          .call(update => isFirstRender ? update.attr('transform', (d: any) => `translate(${(d as NodeData).x}, ${(d as NodeData).y})`) : update.transition()
            .duration(animationDuration / 2)
            .attr('transform', (d: any) => `translate(${(d as NodeData).x}, ${(d as NodeData).y})`)
          );

        // Update circle colors based on state changes
        updatedNodes.select('circle')
          .call(circles => isFirstRender ? circles.attr('fill', (d: any) => getNodeFillColor((d as NodeData).state, colors)) : circles.transition()
            .duration(animationDuration / 2)
            .attr('fill', (d: any) => getNodeFillColor((d as NodeData).state, colors))
          );

        return updatedNodes;
      },
      exit => exit
        .call(exit => exit.transition()
          .duration(animationDuration)
          .call(transition => {
            transition.select('circle').attr('r', 0);
            transition.select('text').style('opacity', 0);
          })
          .remove()
        )
    )
    // Execute animations using the new generic system
    .each(function(d: any) {
      const nodeData = d as NodeData;
      if (visualState.animationHints && visualState.animationHints.length > 0) {
        // Store element reference for the node
        const nodeElement = this as Element;
        nodeElement.setAttribute('data-node-value', nodeData.value.toString());
      }
    });

  // Add hover effects
  nodeElements
    .on('mouseenter', function() {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('stroke-width', 4);
    })
    .on('mouseleave', function() {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('stroke-width', 2);
    });

  // Handle all animations using the new generic system
  if (visualState.animationHints && visualState.animationHints.length > 0) {
    // Create element provider function
    const elementProvider = (elementId: string): Element | null => {
      // Check if it's a link ID
      if (elementId.includes('-')) {
        const linkElement = mainGroup.select(`[data-link-id="${elementId}"]`).node();
        if (linkElement) return linkElement as Element;
      } else {
        // Check if it's a node value
        const nodeElement = mainGroup.select(`[data-node-value="${elementId}"]`).node();
        if (nodeElement) return nodeElement as Element;
      }
      return null;
    };

    const animationHints = visualState.animationHints;

    // Process all animations through the generic system immediately
    processBinaryTreeAnimations(
      animationHints,
      elementProvider
    );
  }
}

/**
 * Helper function to get node fill color based on state
 */
function getNodeFillColor(state: string, colors: any): string {
  switch (state) {
    case 'active': return colors.node.active;
    case 'visited': return colors.node.visited;
    default: return colors.node.default;
  }
}

/**
 * Helper function to get animation duration based on speed
 */
function getAnimationDuration(speed: 'slow' | 'normal' | 'fast'): number {
  switch (speed) {
    case 'slow': return 1000;
    case 'fast': return 300;
    default: return 600;
  }
}

/**
 * Initialize zoom behavior for the SVG
 */
function initializeZoomBehavior(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  contentWidth: number,
  contentHeight: number,
  containerWidth: number,
  containerHeight: number,
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
): void {
  zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([CONFIG.zoom.minScale, CONFIG.zoom.maxScale])
    .on('zoom', (event) => {
      mainGroup.attr('transform', event.transform);
    });

  svg.call(zoomBehavior);

  // Double-click to reset zoom
  svg.on('dblclick.zoom', () => {
    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const fitScale = Math.min(scaleX, scaleY, 1) * CONFIG.zoom.initialScaleFactor;
    
    const centerX = containerWidth / 2 - (contentWidth * fitScale) / 2;
    const centerY = containerHeight / 2 - (contentHeight * fitScale) / 2;
    
    const resetTransform = d3.zoomIdentity
      .translate(centerX, centerY)
      .scale(fitScale)
      .translate(-bounds.minX, -bounds.minY);
    
    svg.transition()
      .duration(750)
      .call(zoomBehavior!.transform, resetTransform);
  });
}

/**
 * Set initial zoom for the tree view
 */
function setInitialZoom(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>,
  contentWidth: number,
  contentHeight: number,
  containerWidth: number,
  containerHeight: number,
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
): void {
  const scaleX = containerWidth / contentWidth;
  const scaleY = containerHeight / contentHeight;
  const initialScale = Math.min(scaleX, scaleY, 1) * CONFIG.zoom.initialScaleFactor;
  
  const centerX = containerWidth / 2 - (contentWidth * initialScale) / 2;
  const centerY = containerHeight / 2 - (contentHeight * initialScale) / 2;
  
  const initialTransform = d3.zoomIdentity
    .translate(centerX, centerY)
    .scale(initialScale)
    .translate(-bounds.minX, -bounds.minY);
  
  svg.call(zoomBehavior.transform, initialTransform);
}

/**
 * Types for nodes and links data
 */
type NodeData = {
  value: number;
  x: number;
  y: number;
  state: string;
};

type LinkData = {
  source: { x: number; y: number };
  target: { x: number; y: number };
  id: string;
  sourceValue: number;
  targetValue: number;
};

/**
 * Collect all nodes and links for rendering
 */
function collectNodesAndLinks(
  tree: BinaryTreeNode,
  positions: Map<number, { x: number; y: number }>
): { nodes: NodeData[]; links: LinkData[] } {
  const nodes: NodeData[] = [];
  const links: LinkData[] = [];

  const traverse = (node: BinaryTreeNode | null): void => {
    if (!node) return;

    const pos = positions.get(node.value);
    if (!pos) return;

    // Use the node's internal state directly
    const nodeState = node.state || 'default';

    nodes.push({
      value: node.value,
      x: pos.x,
      y: pos.y,
      state: nodeState
    });

    // Add links to children with unique IDs
    if (node.left) {
      const childPos = positions.get(node.left.value);
      if (childPos) {
        links.push({
          source: { x: pos.x, y: pos.y },
          target: { x: childPos.x, y: childPos.y },
          id: `${node.value}-${node.left.value}`,
          sourceValue: node.value,
          targetValue: node.left.value
        });
      }
      traverse(node.left);
    }

    if (node.right) {
      const childPos = positions.get(node.right.value);
      if (childPos) {
        links.push({
          source: { x: pos.x, y: pos.y },
          target: { x: childPos.x, y: childPos.y },
          id: `${node.value}-${node.right.value}`,
          sourceValue: node.value,
          targetValue: node.right.value
        });
      }
      traverse(node.right);
    }
  };

  traverse(tree);
  return { nodes, links };
}
