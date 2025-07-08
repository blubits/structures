import React, { useRef, useEffect, useMemo } from "react";
import { useTheme } from "@/components/ThemeProvider";
import type { BinaryTree } from "@/structures/BinaryTree/types";
import { normalizeBinaryTree, reconcileBinaryTree, arrayEqual } from "@/structures/BinaryTree/types";
import { renderBinaryTree } from "@/structures/BinaryTree/renderer";
import { registerBinaryTreeAnimations } from "@/structures/BinaryTree/animations";

// Initialize animations once when the module loads
let animationsInitialized = false;

interface BinaryTreeVisualizerProps {
  state: BinaryTree;
  animationSpeed?: 'slow' | 'normal' | 'fast';
  disableResize?: boolean; // Add prop to disable resize handling
  enableReconciliation?: boolean; // Enable smart reconciliation for performance
}

export const BinaryTreeVisualizer: React.FC<BinaryTreeVisualizerProps> = ({
  state,
  animationSpeed = 'normal',
  disableResize = true, // Default to true since we now use CSS-based responsive design
  enableReconciliation = true // Enable reconciliation by default for better performance
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef(false);
  const renderCount = useRef(0);
  const prevTreeRef = useRef<BinaryTree | null>(null);
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

  // Process the tree state with optional reconciliation for efficiency
  const processedTree = useMemo(() => {
    if (import.meta.env.DEV) {
      console.log('🔄 BinaryTreeVisualizer: Processing tree state', {
        renderCount: renderCount.current,
        hasState: !!state,
        enableReconciliation,
        prevTree: prevTreeRef.current?.name,
        newName: state?.name,
      });
    }

    let normalizedTree: BinaryTree;

    if (enableReconciliation) {
      // Use reconciliation to preserve node identities where possible
      normalizedTree = reconcileBinaryTree(prevTreeRef.current, state);
      prevTreeRef.current = normalizedTree;

      if (import.meta.env.DEV) {
        console.log('🔄 BinaryTreeVisualizer: Reconciliation complete', {
          hasRoot: !!normalizedTree.root,
          rootValue: normalizedTree.root?.value,
          rootId: normalizedTree.root?.id,
          animationHintsCount: normalizedTree.animationHints?.length || 0,
        });
      }
    } else {
      // Simple normalization without reconciliation
      normalizedTree = normalizeBinaryTree(state);

      if (import.meta.env.DEV) {
        console.log('🔄 BinaryTreeVisualizer: Normalization complete', {
          hasRoot: !!normalizedTree.root,
          rootValue: normalizedTree.root?.value,
          animationHintsCount: normalizedTree.animationHints?.length || 0,
        });
      }
    }

    return normalizedTree;
  }, [state, enableReconciliation]);

  // Create visual state for the renderer with deep comparison for state object
  const visualState = useMemo(() => {
    if (import.meta.env.DEV) {
      console.log('🎨 BinaryTreeVisualizer: Creating visual state', {
        renderCount: renderCount.current,
        hasState: !!state,
        hasRoot: !!processedTree?.root,
        stateName: processedTree?.name,
        rootValue: processedTree?.root?.value,
        animationHintsCount: processedTree?.animationHints?.length || 0,
        stateObjectId: `state-${JSON.stringify(processedTree?.name)}`
      });
    }

    const newVisualState = {
      tree: processedTree.root,
      animationSpeed,
      theme: (prefersDarkMode ? 'dark' : 'light') as 'dark' | 'light',
      animationHints: processedTree.animationHints // Only source of animation data
    };

    if (import.meta.env.DEV) {
      console.log('🎨 BinaryTreeVisualizer: New visual state created', newVisualState);
    }

    return newVisualState;
  }, [
    processedTree, 
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
    
    // Skip if the visual state hasn't actually changed (efficient comparison)
    if (prevVisualStateRef.current && 
        prevVisualStateRef.current.tree === visualState.tree &&
        prevVisualStateRef.current.theme === visualState.theme &&
        prevVisualStateRef.current.animationSpeed === visualState.animationSpeed &&
        arrayEqual(prevVisualStateRef.current.animationHints, visualState.animationHints)) {
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
        renderBinaryTree(svgRef.current, visualState, true);
        isInitialized.current = true;
      } else {
        if (import.meta.env.DEV) {
          console.log('🖼️ BinaryTreeVisualizer: Re-render update...');
        }
        renderBinaryTree(svgRef.current, visualState, false);
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
            tree: processedTree.root,
            animationSpeed,
            theme: (prefersDarkMode ? 'dark' : 'light') as 'dark' | 'light',
            animationHints: processedTree.animationHints
          };
          
          renderBinaryTree(svgRef.current, currentVisualState, false);
          
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
  }, [processedTree]); // Use processedTree instead of visualState dependency to prevent infinite loop

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
