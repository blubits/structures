import React, { useRef, useEffect, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { useTheme } from "./ThemeProvider";

type BSTNode = {
  value: number;
  left?: BSTNode;
  right?: BSTNode;
  // Optional: Add node metadata for enhanced features
  id?: string;
  highlighted?: boolean;
  color?: string;
};

interface BSTVisualizerProps {
  data: BSTNode;
  onNodeClick?: (node: BSTNode) => void;
  onNodeHover?: (node: BSTNode | null) => void;
  highlightPath?: number[]; // Array of values to highlight
  animationSpeed?: 'slow' | 'normal' | 'fast';
}

// Configuration object for better maintainability
const CONFIG = {
  layout: {
    MIN_LAYOUT_WIDTH: 800,
    LEVEL_WIDTH_REDUCTION: 0.65,
  },
  nodes: {
    MIN_SIZE: 16,
    MAX_SIZE: 32,
    SIZE_OFFSET: 60,
    SIZE_STEP: 2,
    TEXT_FONT_SIZE_PX: 24,
  },
  spacing: {
    MIN_VERTICAL: 60,
    MAX_VERTICAL: 120,
    VERTICAL_OFFSET: 200,
    VERTICAL_STEP: 4,
  },
  colors: {
    NODE_FILL: "#FFFFFF",
    NODE_TEXT: "black",
    HIGHLIGHT_FILL: "#FFD700",
    HIGHLIGHT_STROKE: "#FF6B35",
  },
  zoom: {
    MIN_SCALE: 0.1,
    MAX_SCALE: 4,
    INITIAL_SCALE_FACTOR: 0.8,
  },
  animation: {
    DURATION: {
      slow: 800,
      normal: 500,
      fast: 200,
    },
    EXIT_DURATION: 300,
  },
} as const;

/**
 * Enhanced BST positioning with better balance detection
 */
function positionBST(
  node: d3.HierarchyNode<BSTNode>,
  layoutWidth: number,
  baseSpacing: number,
  x = layoutWidth / 2,
  y = baseSpacing,
  levelWidth = layoutWidth / 3
) {
  const pointNode = node as d3.HierarchyPointNode<BSTNode>;
  pointNode.x = x;
  pointNode.y = y;
  
  if (node.children && node.children.length > 0) {
    const leftChild = node.children.find(child => child.data.value < node.data.value);
    const rightChild = node.children.find(child => child.data.value > node.data.value);
    
    const nextLevelWidth = levelWidth * CONFIG.layout.LEVEL_WIDTH_REDUCTION;
    
    if (leftChild) {
      positionBST(leftChild, layoutWidth, baseSpacing, x - levelWidth / 2, y + baseSpacing, nextLevelWidth);
    }
    if (rightChild) {
      positionBST(rightChild, layoutWidth, baseSpacing, x + levelWidth / 2, y + baseSpacing, nextLevelWidth);
    }
  }
}

/**
 * Calculate tree metrics for better layout decisions
 */
function calculateTreeMetrics(root: d3.HierarchyNode<BSTNode>) {
  const descendants = root.descendants();
  const maxDepth = Math.max(...descendants.map(d => d.depth));
  const nodeCount = descendants.length;
  
  // Calculate balance factor (simplified)
  const leftSubtreeSize = root.children?.[0]?.descendants().length || 0;
  const rightSubtreeSize = root.children?.[1]?.descendants().length || 0;
  const balanceFactor = Math.abs(leftSubtreeSize - rightSubtreeSize);
  
  return { maxDepth, nodeCount, balanceFactor };
}

/**
 * Enhanced rendering function with better performance and features
 */
function renderBST({
  svgRef,
  containerRef,
  isInitialized,
  data,
  isDarkMode,
  onNodeClick,
  onNodeHover,
  highlightPath = [],
  animationSpeed = 'normal',
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isInitialized: React.RefObject<boolean>;
  data: BSTNode;
  isDarkMode: boolean;
  onNodeClick?: (node: BSTNode) => void;
  onNodeHover?: (node: BSTNode | null) => void;
  highlightPath?: number[];
  animationSpeed?: 'slow' | 'normal' | 'fast';
}) {
  if (!svgRef.current || !containerRef.current) return;

  const containerRect = containerRef.current.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  // Create hierarchy
  const root = d3.hierarchy<BSTNode>(data, (d) => {
    const children = [];
    if (d.left) children.push(d.left);
    if (d.right) children.push(d.right);
    return children.length > 0 ? children : null;
  });

  // Calculate metrics and layout parameters
  const { nodeCount, maxDepth } = calculateTreeMetrics(root);
  const baseNodeSize = Math.max(
    CONFIG.nodes.MIN_SIZE,
    Math.min(CONFIG.nodes.MAX_SIZE, CONFIG.nodes.SIZE_OFFSET - nodeCount * CONFIG.nodes.SIZE_STEP)
  );
  const baseSpacing = Math.max(
    CONFIG.spacing.MIN_VERTICAL,
    Math.min(CONFIG.spacing.MAX_VERTICAL, CONFIG.spacing.VERTICAL_OFFSET - nodeCount * CONFIG.spacing.VERTICAL_STEP)
  );
  const layoutWidth = Math.max(CONFIG.layout.MIN_LAYOUT_WIDTH, containerWidth);

  positionBST(root, layoutWidth, baseSpacing);

  // Calculate viewbox
  const allNodes = root.descendants() as d3.HierarchyPointNode<BSTNode>[];
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

  // Enhanced zoom setup with better UX
  let mainGroup = svgElement.select<SVGGElement>("g.main-group");
  if (mainGroup.empty()) {
    mainGroup = svgElement.append("g").attr("class", "main-group");
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([CONFIG.zoom.MIN_SCALE, CONFIG.zoom.MAX_SCALE])
      .on("zoom", (event) => {
        mainGroup.attr("transform", event.transform);
      });

    svgElement.call(zoom);

    // Double-click to reset zoom
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

  // Enhanced link rendering with highlighting
  const linkStroke = isDarkMode ? "#FFFFFF" : "black";

  linksGroup
    .selectAll<SVGLineElement, d3.HierarchyLink<BSTNode>>(".link")
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
          .attr("stroke", (d) => {
            const sourceHighlighted = highlightPath.includes(d.source.data.value);
            const targetHighlighted = highlightPath.includes(d.target.data.value);
            if (sourceHighlighted && targetHighlighted) {
              return CONFIG.colors.HIGHLIGHT_STROKE;
            }
            return linkStroke;
          })
          .attr("stroke-width", Math.max(1, baseNodeSize / 16))
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
        return update
          .transition()
          .duration(animationDuration)
          .attr("x1", (d) => d.source.x ?? 0)
          .attr("y1", (d) => d.source.y ?? 0)
          .attr("x2", (d) => d.target.x ?? 0)
          .attr("y2", (d) => d.target.y ?? 0)
          .attr("stroke", (d) => {
            const sourceHighlighted = highlightPath.includes(d.source.data.value);
            const targetHighlighted = highlightPath.includes(d.target.data.value);
            if (sourceHighlighted && targetHighlighted) {
              return CONFIG.colors.HIGHLIGHT_STROKE;
            }
            return linkStroke;
          })
          .attr("stroke-width", Math.max(1, baseNodeSize / 16));
      },
      (exit) =>
        exit
          .transition()
          .duration(CONFIG.animation.EXIT_DURATION)
          .attr("opacity", 0)
          .remove()
    );

  // Enhanced node rendering with interactions
  const nodeColor = (d: d3.HierarchyPointNode<BSTNode>) => {
    if (highlightPath.includes(d.data.value)) {
      return CONFIG.colors.HIGHLIGHT_FILL;
    }
    return d.data.color || CONFIG.colors.NODE_FILL;
  };

  const nodeStrokeColor = (d: d3.HierarchyPointNode<BSTNode>) => {
    if (highlightPath.includes(d.data.value)) {
      return CONFIG.colors.HIGHLIGHT_STROKE;
    }
    return isDarkMode ? "#FFFFFF" : "black";
  };

  nodesGroup
    .selectAll<SVGGElement, d3.HierarchyPointNode<BSTNode>>(".node")
    .data(
      root.descendants() as d3.HierarchyPointNode<BSTNode>[],
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
            .on("mouseenter", (event, d) => onNodeHover(d.data))
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
          nodes
            .transition()
            .duration(animationDuration)
            .ease(d3.easeCubicOut)
            .attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
            .call((transition) => {
              transition.select("circle")
                .transition()
                .duration(animationDuration)
                .attr("r", baseNodeSize);
            });
        });

        return nodes;
      },
      (update) => {
        return update
          .transition()
          .duration(animationDuration)
          .attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
          .call((transition) => {
            transition.select("circle")
              .attr("r", baseNodeSize)
              .attr("fill", nodeColor)
              .attr("stroke", nodeStrokeColor);
          });
      },
      (exit) => {
        return exit
          .transition()
          .duration(CONFIG.animation.EXIT_DURATION)
          .attr("opacity", 0)
          .call((transition) => {
            transition.select("circle").attr("r", 0);
          })
          .remove();
      }
    );
}

const BSTVisualizer: React.FC<BSTVisualizerProps> = ({ 
  data, 
  onNodeClick, 
  onNodeHover, 
  highlightPath = [],
  animationSpeed = 'normal'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef(false);
  const { prefersDarkMode } = useTheme();

  // Memoize the render function to prevent unnecessary re-renders
  const memoizedRenderBST = useCallback(() => {
    renderBST({ 
      svgRef, 
      containerRef, 
      isInitialized, 
      data, 
      isDarkMode: prefersDarkMode,
      onNodeClick,
      onNodeHover,
      highlightPath,
      animationSpeed,
    });
  }, [data, prefersDarkMode, onNodeClick, onNodeHover, highlightPath, animationSpeed]);

  useEffect(() => {
    memoizedRenderBST();
  }, [memoizedRenderBST]);

  // Optimized resize handling with debouncing
  useEffect(() => {
    if (!containerRef.current) return;

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        memoizedRenderBST();
      }, 100); // Debounce resize events
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [memoizedRenderBST]);

  // Calculate tree statistics for display
  const treeStats = useMemo(() => {
    const root = d3.hierarchy<BSTNode>(data, (d) => {
      const children = [];
      if (d.left) children.push(d.left);
      if (d.right) children.push(d.right);
      return children.length > 0 ? children : null;
    });
    
    const { nodeCount, maxDepth } = calculateTreeMetrics(root);
    return { nodeCount, maxDepth };
  }, [data]);

  return (
    <div className="w-full h-full relative">
      <div 
        ref={containerRef} 
        className="w-full h-full bg-transparent cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <svg 
          ref={svgRef} 
          className="w-full h-full block" 
          style={{ userSelect: 'none' }}
        />
      </div>
      
      {/* Enhanced instructions overlay */}
      <div className="absolute bottom-6 right-6 bg-black/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm pointer-events-none">
        <div>Drag to pan • Scroll to zoom • Double-click to reset</div>
        <div className="text-xs opacity-75 mt-1">
          Nodes: {treeStats.nodeCount} • Depth: {treeStats.maxDepth}
        </div>
      </div>
    </div>
  );
};

export type { BSTNode, BSTVisualizerProps };
export default BSTVisualizer;