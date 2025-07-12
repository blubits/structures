import React, { useRef, useEffect, useMemo } from "react";
import { useTheme } from "@components/ThemeProvider";
import { normalizeBinaryTree, reconcileBinaryTree, arrayEqual, type BinaryTree, registerBinaryTreeAnimations, renderBinaryTree } from "@structures/BinaryTree";
import { loggers } from "@/lib/core";

// Initialize animations once when the module loads
let animationsInitialized = false;

interface BinaryTreeVisualizerProps {
  state: BinaryTree;
  animationSpeed?: number; // Now accepts a number (e.g., 0.25–2, 1 = normal)
  disableResize?: boolean;
  enableReconciliation?: boolean;
}

/**
 * React component for visualizing a binary tree with animation, reconciliation, and responsive design.
 */
export const BinaryTreeVisualizer: React.FC<BinaryTreeVisualizerProps> = ({
  state,
  animationSpeed = 1, // Default to normal speed
  disableResize = true,
  enableReconciliation = true
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef(false);
  const renderCount = useRef(0);
  const prevTreeRef = useRef<BinaryTree | null>(null);
  const prevVisualStateRef = useRef<{
    tree: any;
    animationSpeed: number;
    theme: 'dark' | 'light';
    animationHints: any;
  } | null>(null);
  const { prefersDarkMode } = useTheme();

  // Initialize animations on first mount
  useEffect(() => {
    if (!animationsInitialized) {
      loggers.visualizer.info('Initializing animations');
      registerBinaryTreeAnimations();
      animationsInitialized = true;
    }
  }, []);

  // Track render count for debugging
  renderCount.current++;

  // Process the tree state with optional reconciliation for efficiency
  const processedTree = useMemo(() => {
    loggers.visualizer.debug('Processing tree state', {
      data: {
        renderCount: renderCount.current,
        hasState: !!state,
        enableReconciliation,
        prevTree: prevTreeRef.current?.name,
        newName: state?.name,
      }
    });

    let normalizedTree: BinaryTree;

    if (enableReconciliation) {
      // Use reconciliation to preserve node identities where possible
      normalizedTree = reconcileBinaryTree(prevTreeRef.current, state);
      prevTreeRef.current = normalizedTree;

      loggers.visualizer.debug('Reconciliation complete', {
        data: {
          hasRoot: !!normalizedTree.root,
          rootValue: normalizedTree.root?.value,
          rootId: normalizedTree.root?.id,
          animationHintsCount: normalizedTree.animationHints?.length || 0,
        }
      });
    } else {
      // Simple normalization without reconciliation
      normalizedTree = normalizeBinaryTree(state);

      loggers.visualizer.debug('Normalization complete', {
        data: {
          hasRoot: !!normalizedTree.root,
          rootValue: normalizedTree.root?.value,
          animationHintsCount: normalizedTree.animationHints?.length || 0,
        }
      });
    }

    return normalizedTree;
  }, [state, enableReconciliation]);

  // Create visual state for the renderer with deep comparison for state object
  const visualState = useMemo(() => {
    loggers.visualizer.debug('Creating visual state', {
      data: {
        renderCount: renderCount.current,
        hasState: !!state,
        hasRoot: !!processedTree?.root,
        stateName: processedTree?.name,
        rootValue: processedTree?.root?.value,
        animationHintsCount: processedTree?.animationHints?.length || 0,
        stateObjectId: `state-${JSON.stringify(processedTree?.name)}`
      }
    });

    const newVisualState = {
      tree: processedTree.root,
      animationSpeed, // Pass as number
      theme: (prefersDarkMode ? 'dark' : 'light') as 'dark' | 'light',
      animationHints: processedTree.animationHints // Only source of animation data
    };

    loggers.visualizer.debug('New visual state created', { 
      data: newVisualState 
    });

    return newVisualState;
  }, [
    processedTree,
    animationSpeed,
    prefersDarkMode
  ]);

  // Initialize and update the renderer
  useEffect(() => {
    loggers.visualizer.debug('useEffect triggered', {
      data: {
        renderCount: renderCount.current,
        hasSvgRef: !!svgRef.current,
        hasContainerRef: !!containerRef.current,
        isInitialized: isInitialized.current,
      },
      stackDepth: 3
    });

    if (!svgRef.current || !containerRef.current) return;
    
    // Skip if the visual state hasn't actually changed (efficient comparison)
    if (prevVisualStateRef.current &&
        prevVisualStateRef.current.tree === visualState.tree &&
        prevVisualStateRef.current.theme === visualState.theme &&
        prevVisualStateRef.current.animationSpeed === visualState.animationSpeed &&
        arrayEqual(prevVisualStateRef.current.animationHints, visualState.animationHints)) {
      loggers.visualizer.debug('Skipping render - no changes detected');
      return;
    }
    prevVisualStateRef.current = visualState;
    try {
      const isFirstRender = !isInitialized.current;
      if (isFirstRender) {
        loggers.visualizer.info('First render, initializing');
        renderBinaryTree(svgRef.current, visualState, true);
        isInitialized.current = true;
      } else {
        loggers.visualizer.info('Re-render update');
        renderBinaryTree(svgRef.current, visualState, false);
      }
    } catch (error) {
      loggers.visualizer.error('Error rendering binary tree', { error: error as Error });
    }
  }, [visualState]);

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current || disableResize) return;

    loggers.resize.debug('Setting up ResizeObserver');

    let resizeTimeout: NodeJS.Timeout | null = null;

    const resizeObserver = new ResizeObserver(() => {
      loggers.resize.debug('ResizeObserver callback triggered', {
        data: {
          isInitialized: isInitialized.current,
          hasSvgRef: !!svgRef.current,
          hasContainerRef: !!containerRef.current,
          hasTimeout: !!resizeTimeout
        }
      });
      
      // Clear any pending resize handling
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      // Debounce resize handling to prevent infinite loops
      resizeTimeout = setTimeout(() => {
        loggers.resize.debug('Executing debounced resize');
        if (isInitialized.current && svgRef.current && containerRef.current) {
          resizeObserver.disconnect();
          const currentVisualState = {
            tree: processedTree.root,
            animationSpeed, // Pass as number
            theme: (prefersDarkMode ? 'dark' : 'light') as 'dark' | 'light',
            animationHints: processedTree.animationHints
          };
          renderBinaryTree(svgRef.current, currentVisualState, false);
          setTimeout(() => {
            if (containerRef.current) {
              resizeObserver.observe(containerRef.current);
            }
          }, 100);
        }
        resizeTimeout = null;
      }, 50);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      loggers.resize.debug('Disconnecting ResizeObserver');
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeObserver.disconnect();
    };
  }, [processedTree]);

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
