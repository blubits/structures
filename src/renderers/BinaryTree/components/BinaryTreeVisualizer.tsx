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
  disableResize?: boolean; // Add prop to disable resize handling
}

export const BinaryTreeVisualizer: React.FC<BinaryTreeVisualizerProps> = ({
  state,
  animationSpeed = 'normal',
  disableResize = true // Default to true since we now use CSS-based responsive design
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
        animationHintsCount: state?.animationHints?.length || 0,
        stateObjectId: `state-${JSON.stringify(state?.name)}`
      });
    }

    const newVisualState = {
      tree: state.root,
      animationSpeed,
      theme: (prefersDarkMode ? 'dark' : 'light') as 'dark' | 'light',
      animationHints: state.animationHints // Only source of animation data
    };

    if (import.meta.env.DEV) {
      console.log('🎨 BinaryTreeVisualizer: New visual state created', newVisualState);
    }

    return newVisualState;
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
        isInitialized: isInitialized.current,
        stackTrace: new Error().stack?.split('\n').slice(1, 4) // First 3 stack frames
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
    if (!containerRef.current || disableResize) return;

    if (import.meta.env.DEV) {
      console.log('🔍 BinaryTreeVisualizer: Setting up ResizeObserver');
    }

    let resizeTimeout: NodeJS.Timeout | null = null;

    const resizeObserver = new ResizeObserver(() => {
      if (import.meta.env.DEV) {
        console.log('🔍 BinaryTreeVisualizer: ResizeObserver callback triggered', {
          isInitialized: isInitialized.current,
          hasSvgRef: !!svgRef.current,
          hasContainerRef: !!containerRef.current,
          hasTimeout: !!resizeTimeout
        });
      }
      
      // Clear any pending resize handling
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      // Debounce resize handling to prevent infinite loops
      resizeTimeout = setTimeout(() => {
        if (import.meta.env.DEV) {
          console.log('🔍 BinaryTreeVisualizer: Executing debounced resize');
        }
        
        if (isInitialized.current && svgRef.current && containerRef.current) {
          // Temporarily disconnect the observer to prevent recursive calls
          resizeObserver.disconnect();
          
          // Get the current visualState at the time of resize
          const currentVisualState = {
            tree: state.root,
            animationSpeed,
            theme: (prefersDarkMode ? 'dark' : 'light') as 'dark' | 'light',
            animationHints: state.animationHints
          };
          
          renderBinaryTree(svgRef.current, containerRef.current, currentVisualState, false);
          
          // Reconnect the observer after a brief delay
          setTimeout(() => {
            if (containerRef.current) {
              resizeObserver.observe(containerRef.current);
            }
          }, 100);
        }
        resizeTimeout = null;
      }, 50); // 50ms debounce
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      if (import.meta.env.DEV) {
        console.log('🔍 BinaryTreeVisualizer: Disconnecting ResizeObserver');
      }
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeObserver.disconnect();
    };
  }, []); // Remove visualState dependency to prevent infinite loop

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-white dark:bg-zinc-900 overflow-hidden relative cursor-grab active:cursor-grabbing flex items-center justify-center"
      style={{ touchAction: 'none' }}
    >
      <svg
        ref={svgRef}
        className="w-full h-full block"
        style={{ 
          overflow: 'visible',
          backgroundColor: 'transparent',
          userSelect: 'none',
          maxWidth: '100%',
          maxHeight: '100%'
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
