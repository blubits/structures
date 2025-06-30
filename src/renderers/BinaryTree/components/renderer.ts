import * as d3 from 'd3';
import type { BinaryTreeNode } from '../types';

/**
 * Visual state interface for the binary tree renderer
 */
export interface BinaryTreeVisualState {
  tree: BinaryTreeNode | null;
  visitedNodes: Set<number>;
  highlightPath: number[];
  currentNode: number | null;
  traversalLinks: Array<{from: number, to: number}>;
  animationSpeed: 'slow' | 'normal' | 'fast';
  theme: 'light' | 'dark';
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
  colors: {
    light: {
      node: {
        default: '#ffffff',
        active: '#3b82f6',
        visited: '#10b981',
        border: '#e5e7eb',
        text: '#374151'
      },
      link: {
        default: '#9ca3af',
        active: '#3b82f6',
        visited: '#10b981'
      }
    },
    dark: {
      node: {
        default: '#ffffff',
        active: '#3b82f6',
        visited: '#10b981',
        border: '#ffffff',
        text: '#000000'
      },
      link: {
        default: '#ffffff',
        active: '#3b82f6',
        visited: '#10b981'
      }
    }
  }
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
 */
export function renderBinaryTree(
  svgElement: SVGSVGElement, 
  containerElement: HTMLElement, 
  visualState: BinaryTreeVisualState
): void {
  if (import.meta.env.DEV) {
    console.log('🌳 renderBinaryTree: Function called', {
      hasSvgElement: !!svgElement,
      hasTree: !!visualState.tree,
      treeValue: visualState.tree?.value,
      visitedNodesCount: visualState.visitedNodes.size,
      theme: visualState.theme,
      animationSpeed: visualState.animationSpeed
    });
  }

  const { tree, visitedNodes, currentNode, theme } = visualState;
  
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
    minX: minX - CONFIG.nodeRadius * 2,
    maxX: maxX + CONFIG.nodeRadius * 2,
    minY: minY - CONFIG.nodeRadius,
    maxY: maxY + CONFIG.nodeRadius
  };
  
  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;
  
  // Get container dimensions
  const containerRect = containerElement.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  // Set up SVG with proper dimensions
  const svg = d3.select(svgElement)
    .attr('width', containerWidth)
    .attr('height', containerHeight);

  // Set up or get main group for zoom/pan
  let mainGroup = svg.select<SVGGElement>('g.main-group');
  if (mainGroup.empty()) {
    mainGroup = svg.append('g').attr('class', 'main-group');
  }

  // Set up zoom behavior if not already done
  if (!zoomBehavior) {
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

  // Set initial zoom if not already initialized
  if (!isZoomInitialized) {
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
    isZoomInitialized = true;
  }

  // Clear previous content in main group
  mainGroup.selectAll('*').remove();

  // Create groups for links and nodes
  const linkGroup = mainGroup.append('g').attr('class', 'links');
  const nodeGroup = mainGroup.append('g').attr('class', 'nodes');

  // Get color scheme
  const colors = CONFIG.colors[theme];

  // Collect all nodes and links
  const nodes: Array<{value: number, x: number, y: number, state: string}> = [];
  const links: Array<{source: {x: number, y: number}, target: {x: number, y: number}, state: string}> = [];

  const collectNodesAndLinks = (node: BinaryTreeNode | null): void => {
    if (!node) return;

    const pos = positions.get(node.value);
    if (!pos) return;

    // Determine node state for styling
    let nodeState = 'default';
    if (currentNode === node.value) {
      nodeState = 'active';
    } else if (visitedNodes.has(node.value)) {
      nodeState = 'visited';
    }

    nodes.push({
      value: node.value,
      x: pos.x,
      y: pos.y,
      state: nodeState
    });

    // Add links to children
    if (node.left) {
      const childPos = positions.get(node.left.value);
      if (childPos) {
        links.push({
          source: { x: pos.x, y: pos.y },
          target: { x: childPos.x, y: childPos.y },
          state: nodeState
        });
      }
      collectNodesAndLinks(node.left);
    }

    if (node.right) {
      const childPos = positions.get(node.right.value);
      if (childPos) {
        links.push({
          source: { x: pos.x, y: pos.y },
          target: { x: childPos.x, y: childPos.y },
          state: nodeState
        });
      }
      collectNodesAndLinks(node.right);
    }
  };

  collectNodesAndLinks(tree);

  if (import.meta.env.DEV) {
    console.log('🌳 renderBinaryTree: Collected nodes and links', {
      nodesCount: nodes.length,
      linksCount: links.length,
      nodes: nodes.map(n => ({ value: n.value, state: n.state })),
      links: links.length
    });
  }

  // Render links
  linkGroup.selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y)
    .attr('stroke', d => {
      switch (d.state) {
        case 'active': return colors.link.active;
        case 'visited': return colors.link.visited;
        default: return colors.link.default;
      }
    })
    .attr('stroke-width', 2)
    .attr('opacity', 0.8);

  // Render nodes
  const nodeElements = nodeGroup.selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${d.x}, ${d.y})`)
    .style('cursor', 'pointer');

  // Node circles
  nodeElements.append('circle')
    .attr('r', CONFIG.nodeRadius)
    .attr('fill', d => {
      switch (d.state) {
        case 'active': return colors.node.active;
        case 'visited': return colors.node.visited;
        default: return colors.node.default;
      }
    })
    .attr('stroke', colors.node.border)
    .attr('stroke-width', 2);

  // Node text
  nodeElements.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('font-size', CONFIG.fontSize)
    .attr('font-weight', 'bold')
    .attr('fill', colors.node.text)
    .text(d => d.value);

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
}
