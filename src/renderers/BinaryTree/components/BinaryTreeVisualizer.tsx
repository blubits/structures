import React, { useRef, useEffect, useMemo } from "react";
import { useTheme } from "../../../components/ThemeProvider";
import type { BinaryTree } from "../types";
import { renderBinaryTree } from "./renderer.js";
import { registerBinaryTreeAnimations } from "./animations.js";

// Initialize animations once when the module loads
let animationsInitialized = false;

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
  const renderCount = useRef(0);
  const prevVisualStateRef = useRef<{
    tree: any;
    animationSpeed: 'slow' | 'normal' | 'fast';
    theme: 'dark' | 'light';
    animationHints: any;
  } | null>(null);
  const { prefersDarkMode } = useTheme();

  // Initialize animations on first mount
  useEffect(() => {
    if (!animationsInitialized) {
      if (import.meta.env.DEV) {
        console.log('🎬 BinaryTreeVisualizer: Initializing animations...');
      }
      registerBinaryTreeAnimations();
      animationsInitialized = true;
    }
  }, []);

  // Track render count for debugging
  renderCount.current++;

  // Create visual state for the renderer with deep comparison for state object
  const visualState = useMemo(() => {
    if (import.meta.env.DEV) {
      console.log('🎨 BinaryTreeVisualizer: Creating visual state', {
        renderCount: renderCount.current,
        hasState: !!state,
        hasRoot: !!state?.root,
        stateName: state?.name,
        rootValue: state?.root?.value,
        nodeCount: state?.nodeCount,
        height: state?.height,
        animationHintsCount: state?.animationHints?.length || 0
      });
    }

    return {
      tree: state.root,
      animationSpeed,
      theme: (prefersDarkMode ? 'dark' : 'light') as 'dark' | 'light',
      animationHints: state.animationHints // Only source of animation data
    };
  }, [
    state.root, 
    state.name, 
    state.nodeCount, 
    state.height, 
    state.animationHints, 
    animationSpeed, 
    prefersDarkMode
  ]);

  // Initialize and update the renderer
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🖼️ BinaryTreeVisualizer: useEffect triggered', {
        renderCount: renderCount.current,
        hasSvgRef: !!svgRef.current,
        hasContainerRef: !!containerRef.current,
        isInitialized: isInitialized.current
      });
    }

    if (!svgRef.current || !containerRef.current) return;
    
    // Skip if the visual state hasn't actually changed (deep comparison for content)
    if (prevVisualStateRef.current && 
        prevVisualStateRef.current.tree === visualState.tree &&
        prevVisualStateRef.current.theme === visualState.theme &&
        prevVisualStateRef.current.animationSpeed === visualState.animationSpeed &&
        JSON.stringify(prevVisualStateRef.current.animationHints) === JSON.stringify(visualState.animationHints)) {
      if (import.meta.env.DEV) {
        console.log('🖼️ BinaryTreeVisualizer: Skipping render - no changes detected');
      }
      return;
    }

    prevVisualStateRef.current = visualState;
    
    try {
      const isFirstRender = !isInitialized.current;
      if (isFirstRender) {
        if (import.meta.env.DEV) {
          console.log('🖼️ BinaryTreeVisualizer: First render, initializing...');
        }
        renderBinaryTree(svgRef.current, containerRef.current, visualState, true);
        isInitialized.current = true;
      } else {
        if (import.meta.env.DEV) {
          console.log('🖼️ BinaryTreeVisualizer: Re-render update...');
        }
        renderBinaryTree(svgRef.current, containerRef.current, visualState, false);
      }
    } catch (error) {
      console.error('Error rendering binary tree:', error);
    }
  }, [visualState]);

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (isInitialized.current && svgRef.current && containerRef.current) {
        renderBinaryTree(svgRef.current, containerRef.current, visualState, false);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [visualState]);

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
