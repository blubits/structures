import * as d3 from 'd3';
import { processBinaryTreeAnimations } from '@/structures/BinaryTree/animations';
import type { BinaryTreeNode } from '@structures/BinaryTree/types';
import type { AnimationHint } from '@/lib/core/types';
import { BINARY_TREE_COLORS } from '@structures/BinaryTree/config.colors';
import {
  calculateTreeLayout,
  getNodeFillColor,
  getAnimationDuration,
  collectNodesAndLinks,
  type NodeData,
  type LinkData
} from '@/structures/BinaryTree/rendererUtils';

/**
 * Visual state for the binary tree renderer, including tree data, animation speed, theme, and animation hints.
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
 * Store zoom behavior globally to maintain state between renders
 */
let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;

/**
 * Renders a binary tree using D3.
 */
export function renderBinaryTree(
  svgElement: SVGSVGElement, 
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
    
    // Reset zoom when tree is cleared
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

  // ============================================================================
  // STEP 1: ASSIGNMENT
  // Assign IDs to each data structure element (nodes and links)
  // ============================================================================
  
  // Calculate layout positions for all nodes
  const positions = calculateTreeLayout(tree, CONFIG);
  const allPositions = Array.from(positions.values());
  
  if (import.meta.env.DEV) {
    console.log('🌳 STEP 1 - Assignment: Layout calculated', {
      positionsCount: positions.size,
      allPositionsLength: allPositions.length,
      positions: Object.fromEntries(positions)
    });
  }
  
  if (allPositions.length === 0) return;

  // Collect all nodes and links with assigned IDs
  const { nodes, links } = collectNodesAndLinks(tree, positions);

  if (import.meta.env.DEV) {
    console.log('🌳 STEP 1 - Assignment: Collected nodes and links with IDs', {
      nodesCount: nodes.length,
      linksCount: links.length,
      nodes: nodes.map((n: NodeData) => ({ value: n.value, id: n.id, state: n.state })),
      links: links.map((l: LinkData) => ({ id: l.id, sourceValue: l.sourceValue, targetValue: l.targetValue }))
    });
  }

  // ============================================================================
  // STEP 2: RECONCILIATION
  // Set up SVG structure and prepare for reconciliation with previous state
  // ============================================================================

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
  }

  // Get or create persistent groups for links and nodes (preparation for reconciliation)
  let linkGroup = mainGroup.select<SVGGElement>('g.links');
  if (linkGroup.empty()) {
    linkGroup = mainGroup.append('g').attr('class', 'links');
  }
  
  let nodeGroup = mainGroup.select<SVGGElement>('g.nodes');
  if (nodeGroup.empty()) {
    nodeGroup = mainGroup.append('g').attr('class', 'nodes');
  }

  // Get color scheme for styling
  const colors = CONFIG.colors[theme];

  if (import.meta.env.DEV) {
    console.log('� STEP 2 - Reconciliation: SVG structure prepared', { 
      theme, 
      colors,
      bounds,
      contentWidth,
      contentHeight
    });
  }

  // Track previous node states for reconciliation
  const prevNodeStates: Map<string | number, string> = (renderBinaryTree as any)._prevNodeStates || new Map();

  // Get animation duration for transitions
  const animationDuration = isFirstRender ? 0 : getAnimationDuration(visualState.animationSpeed);

  // ============================================================================
  // STEP 3: DIFFING
  // Determine elements that need to be added, deleted, or updated using D3 joins
  // ============================================================================

  if (import.meta.env.DEV) {
    console.log('🌳 STEP 3 - Diffing: Preparing D3 joins for reconciliation', {
      animationDuration,
      isFirstRender
    });
  }

  // ============================================================================
  // STEP 4: RENDERING AND STYLING
  // Update the view and apply element styling based on metadata
  // ============================================================================

  // Render links with D3 join pattern (handles add/update/remove diffing)
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
    // Set data attributes for animations
    .each(function(d: any) {
      const linkData = d as LinkData;
      const linkElement = this as Element;
      
      // Store element reference for the link
      linkElement.setAttribute('data-link-id', linkData.id);
      linkElement.setAttribute('data-source-value', linkData.sourceValue.toString());
      linkElement.setAttribute('data-target-value', linkData.targetValue.toString());
    });

  // Render nodes with D3 join pattern using node IDs for better reconciliation
  const nodeElements = nodeGroup.selectAll('g.node')
    .data(nodes, (d: any) => (d as NodeData).id || (d as NodeData).value)
    .join(
      enter => {
        const nodeGroup = enter.append('g')
          .attr('class', 'node')
          .attr('transform', (d: any) => `translate(${(d as NodeData).x}, ${(d as NodeData).y})`)
          .style('cursor', 'pointer');

        nodeGroup.append('circle')
          .attr('r', CONFIG.nodeRadius)
          .attr('fill', (d: any) => getNodeFillColor((d as NodeData).state, colors))
          .attr('stroke', (d: any) => {
            const state = (d as NodeData).state as 'default' | 'active' | 'visited';
            return colors.node.border[state] || colors.node.border.default;
          })
          .attr('stroke-width', 2)
          .style('opacity', 1);

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
        const updatedNodes = update
          .call(update => isFirstRender ? update.attr('transform', (d: any) => `translate(${(d as NodeData).x}, ${(d as NodeData).y})`) : update.transition()
            .duration(animationDuration / 2)
            .attr('transform', (d: any) => `translate(${(d as NodeData).x}, ${(d as NodeData).y})`)
          );

        updatedNodes.select('circle')
          .each(function(d: any) {
            // Set fill/stroke to previous state before transition
            const node = d as NodeData;
            const key = node.id || node.value;
            const prevState = prevNodeStates.get(key) || node.state;
            d3.select(this)
              .attr('fill', getNodeFillColor(prevState, colors))
              .attr('stroke', () => {
                const state = prevState as 'default' | 'active' | 'visited';
                return colors.node.border[state] || colors.node.border.default;
              });
          })
          .transition()
          .duration(animationDuration / 2)
          .attr('fill', (d: any) => getNodeFillColor((d as NodeData).state, colors))
          .attr('stroke', (d: any) => {
            const state = (d as NodeData).state as 'default' | 'active' | 'visited';
            return colors.node.border[state] || colors.node.border.default;
          });

        // After transition, update prevNodeStates for next render
        updatedNodes.select('circle').each(function(d: any) {
          const node = d as NodeData;
          const key = node.id || node.value;
          prevNodeStates.set(key, node.state);
        });

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
    // Set data attributes for animations
    .each(function(d: any) {
      const nodeData = d as NodeData;
      const nodeElement = this as Element;
      
      // Set both the node value and ID for animation targeting
      nodeElement.setAttribute('data-node-value', nodeData.value.toString());
      if (nodeData.id) {
        nodeElement.setAttribute('data-node-id', nodeData.id);
      }
    });

  // Add hover effects for better interactivity
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

  if (import.meta.env.DEV) {
    console.log('🌳 STEP 4 - Rendering and styling: Elements rendered and styled', {
      nodeElementsCount: nodeElements.size(),
      linksRendered: linkGroup.selectAll('line').size()
    });
  }

  // ============================================================================
  // STEP 5: ANIMATION
  // Determine and process animations using the animation layer
  // ============================================================================
  // Handle all animations using the animation layer
  if (visualState.animationHints && visualState.animationHints.length > 0) {
    if (import.meta.env.DEV) {
      console.log('� STEP 5 - Animation: Processing animations with hints', {
        hintsCount: visualState.animationHints.length,
        hints: visualState.animationHints.map(h => ({ type: h.type, metadata: h.metadata }))
      });
    }

    // Create element provider function that handles both old and new ID formats
    const elementProvider = (elementId: string): Element | null => {
      if (import.meta.env.DEV) {
        console.log('🎬 Element provider called with ID:', elementId);
      }

      // Check if it's a link ID (format: "sourceValue-targetValue" for animations)
      if (elementId.includes('-') && !elementId.includes('node-')) {
        // Legacy format: "8-3" - find link by source and target values
        const [sourceValue, targetValue] = elementId.split('-').map(Number);
        if (!isNaN(sourceValue) && !isNaN(targetValue)) {
          // Find the link element by checking all links for matching source/target values
          const linkElements = mainGroup.selectAll(`line[data-link-id]`).nodes();
          const linkElement = linkElements.find(node => {
            const element = node as Element;
            const linkId = element.getAttribute('data-link-id');
            if (linkId) {
              // Parse the link ID to extract source and target values
              const linkData = links.find(l => l.id === linkId);
              if (linkData && linkData.sourceValue === sourceValue && linkData.targetValue === targetValue) {
                return true;
              }
            }
            return false;
          });
          
          if (linkElement) {
            if (import.meta.env.DEV) {
              console.log('🎬 Found link element by values:', { sourceValue, targetValue, linkElement });
            }
            return linkElement as Element;
          }
        }
      }
      
      // Check if it's a node ID (format: "node-..." or just a number)
      if (elementId.startsWith('node-') || !isNaN(Number(elementId))) {
        if (elementId.startsWith('node-')) {
          // Find node by ID attribute
          const nodeElement = mainGroup.select(`[data-node-id="${elementId}"]`).node();
          if (nodeElement) {
            if (import.meta.env.DEV) {
              console.log('🎬 Found node element by ID:', { elementId, nodeElement });
            }
            return nodeElement as Element;
          }
        } else {
          // Numeric ID - treat as node value
          const nodeValue = Number(elementId);
          const nodeElement = mainGroup.select(`[data-node-value="${nodeValue}"]`).node();
          if (nodeElement) {
            if (import.meta.env.DEV) {
              console.log('🎬 Found node element by value:', { nodeValue, nodeElement });
            }
            return nodeElement as Element;
          }
        }
      }
      
      if (import.meta.env.DEV) {
        console.warn('🎬 Element provider could not find element for ID:', elementId);
      }
      return null;
    };

    const animationHints = visualState.animationHints;

    // Process all animations through the generic system immediately
    processBinaryTreeAnimations(
      animationHints,
      elementProvider
    );

    if (import.meta.env.DEV) {
      console.log('🌳 STEP 5 - Animation: Animations processed successfully');
    }
  }

  // Store prevNodeStates for next render (part of reconciliation state)
  (renderBinaryTree as any)._prevNodeStates = prevNodeStates;

  if (import.meta.env.DEV) {
    console.log('🌳 renderBinaryTree: Rendering pipeline completed successfully');
  }
}
