import React, { useRef, useEffect, useCallback } from "react";
import { useTheme } from "../../../components/ThemeProvider";
import type { BinaryTree, BinaryTreeNode } from "../types";
import { renderBinaryTree } from "./renderer.js";

interface BinaryTreeVisualizerProps {
  state: BinaryTree;
  animationSpeed?: 'slow' | 'normal' | 'fast';
}

export const BinaryTreeVisualizer: React.FC<BinaryTreeVisualizerProps> = ({
  state,
  animationSpeed = 'normal'
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef(false);
  const { prefersDarkMode } = useTheme();

  // Create visual state for the renderer
  const createVisualState = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log('🎨 BinaryTreeVisualizer: Creating visual state', {
        hasState: !!state,
        hasRoot: !!state?.root,
        stateName: state?.name,
        rootValue: state?.root?.value,
        nodeCount: state?.nodeCount,
        height: state?.height
      });
    }

    // Extract information for visual state from the new state structure
    const visitedNodes = new Set<number>();
    const highlightPath: number[] = [];
    let currentNode: number | null = null;
    const traversalLinks: Array<{from: number, to: number}> = [];

    // Walk tree to find nodes with special states
    const walkTree = (node: BinaryTreeNode | null, path: number[] = []) => {
      if (!node) return;

      if (node.state === 'active') {
        currentNode = node.value;
        highlightPath.push(...path, node.value);
      } else if (node.state === 'visited') {
        visitedNodes.add(node.value);
      }

      walkTree(node.left, [...path, node.value]);
      walkTree(node.right, [...path, node.value]);
    };

    walkTree(state.root);

    if (import.meta.env.DEV) {
      console.log('🎨 BinaryTreeVisualizer: Visual state created', {
        hasTree: !!state.root,
        visitedNodesCount: visitedNodes.size,
        highlightPathLength: highlightPath.length,
        currentNode,
        animationSpeed,
        theme: prefersDarkMode ? 'dark' : 'light'
      });
    }

    return {
      tree: state.root,
      visitedNodes,
      highlightPath,
      currentNode,
      traversalLinks,
      animationSpeed,
      theme: (prefersDarkMode ? 'dark' : 'light') as 'dark' | 'light'
    };
  }, [state.root, animationSpeed, prefersDarkMode]);

  // Initialize and update the renderer
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🖼️ BinaryTreeVisualizer: useEffect triggered', {
        hasSvgRef: !!svgRef.current,
        hasContainerRef: !!containerRef.current,
        isInitialized: isInitialized.current
      });
    }

    if (!svgRef.current || !containerRef.current) return;

    const visualState = createVisualState();
    
    try {
      if (!isInitialized.current) {
        if (import.meta.env.DEV) {
          console.log('🖼️ BinaryTreeVisualizer: First render, initializing...');
        }
        renderBinaryTree(svgRef.current, containerRef.current, visualState);
        isInitialized.current = true;
      } else {
        if (import.meta.env.DEV) {
          console.log('🖼️ BinaryTreeVisualizer: Re-render update...');
        }
        renderBinaryTree(svgRef.current, containerRef.current, visualState);
      }
    } catch (error) {
      console.error('Error rendering binary tree:', error);
    }
  }, [createVisualState]);

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (isInitialized.current && svgRef.current && containerRef.current) {
        const visualState = createVisualState();
        renderBinaryTree(svgRef.current, containerRef.current, visualState);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [createVisualState]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-white dark:bg-zinc-900 overflow-hidden relative cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    >
      <svg
        ref={svgRef}
        className="w-full h-full block"
        style={{ 
          overflow: 'visible',
          backgroundColor: 'transparent',
          userSelect: 'none'
        }}
      />
      
      {/* Status overlay */}
      {state._metadata?.operation && (
        <div className="absolute top-4 right-4 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-black dark:text-white">
            Operation: {state._metadata.operation}
          </div>
          {state._metadata.operand !== undefined && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Value: {state._metadata.operand}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
