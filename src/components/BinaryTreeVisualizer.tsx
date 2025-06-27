import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "./ThemeProvider";
import { 
  renderBinaryTree, 
  TraversalOverlay,
  HistoryControllerStateComputer,
  type BinaryTreeVisualState,
} from "./BinaryTree";
import DebugPanel from "./DebugPanel";
import type { 
  BinaryTreeNode, 
  BinaryTreeVisualizerProps, 
  TraversalStep, 
  TreeOperation,
} from "./BinaryTree/types";
import { BST_CONFIG } from "./BinaryTree/types";

const BinaryTreeVisualizer: React.FC<BinaryTreeVisualizerProps> = ({ 
  data, 
  treeType = BST_CONFIG, // Default to BST
  onNodeClick, 
  onNodeHover, 
  highlightPath = [],
  animationSpeed = 'normal',
  traversalSteps = [],
  currentStepIndex = -1,
  isTraversing = false,
  onStepComplete,
  onTogglePlayback,
  onStepForward,
  onStepBackward,
  onRestartTraversal,
  isPlaying,
  selectedOperation,
  // Optional controller for more intelligent highlighting
  historyController,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef(false);
  const { prefersDarkMode } = useTheme();

  // Create visual state computer for debugging
  const visualStateComputer = useMemo(() => {
    if (historyController) {
      return new HistoryControllerStateComputer(historyController, data);
    }
    return null;
  }, [historyController, data]);

  // Create visual state - use HistoryController if available, otherwise create directly
  const visualState = useMemo((): BinaryTreeVisualState => {
    if (visualStateComputer) {
      return visualStateComputer.computeVisualState();
    } else {
      // Direct visual state creation for simple cases without HistoryController
      const visitedNodes = new Set<number>();
      if (isTraversing && currentStepIndex >= 0) {
        for (let i = 0; i <= currentStepIndex; i++) {
          const step = traversalSteps[i];
          if (step && (step as any).currentNode) {
            visitedNodes.add((step as any).currentNode.value);
          }
        }
      }
      
      let currentNode: number | null = null;
      if (currentStepIndex >= 0 && traversalSteps[currentStepIndex]) {
        const step = traversalSteps[currentStepIndex] as any;
        if (step.currentNode) {
          currentNode = step.currentNode.value;
        }
      }
      
      return {
        data,
        visitedNodes,
        highlightPath,
        currentNode,
        isTraversing,
        animationInstructions: undefined,
      };
    }
  }, [historyController, data, traversalSteps, currentStepIndex, isTraversing, highlightPath]);

  // Keep currentStep for backward compatibility with overlays and debug panels
  const currentStep = useMemo(() => {
    if (historyController && typeof historyController.getCurrentStep === 'function') {
      return historyController.getCurrentStep();
    }
    // Fallback: get from traversal steps (backward compatibility)
    return currentStepIndex >= 0 ? traversalSteps[currentStepIndex] : null;
  }, [historyController, currentStepIndex, traversalSteps]);

  // Memoize the render function to prevent unnecessary re-renders
  const memoizedRenderTree = useCallback(() => {
    renderBinaryTree({ 
      svgRef, 
      containerRef, 
      isInitialized, 
      visualState,
      treeType,
      isDarkMode: prefersDarkMode,
      onNodeClick,
      onNodeHover,
      animationSpeed,
    });
  }, [visualState, treeType, prefersDarkMode, onNodeClick, onNodeHover, animationSpeed]);

  // Handle step completion callback
  useEffect(() => {
    if (onStepComplete && currentStepIndex >= 0 && traversalSteps[currentStepIndex]) {
      onStepComplete(traversalSteps[currentStepIndex], currentStepIndex);
    }
  }, [onStepComplete, currentStepIndex, traversalSteps]);

  useEffect(() => {
    memoizedRenderTree();
  }, [memoizedRenderTree]);

  // Optimized resize handling with debouncing
  useEffect(() => {
    if (!containerRef.current) return;

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        memoizedRenderTree();
      }, 100); // Debounce resize events
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [memoizedRenderTree]);

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

      {/* Traversal step description overlay */}
      <TraversalOverlay
        isTraversing={isTraversing}
        currentStepIndex={currentStepIndex}
        traversalSteps={traversalSteps}
        onTogglePlayback={onTogglePlayback}
        onStepForward={onStepForward}
        onStepBackward={onStepBackward}
        onRestartTraversal={onRestartTraversal}
        isPlaying={isPlaying}
        selectedOperation={selectedOperation}
        treeType={treeType}
      />

      {/* Debug Panel (Development Mode Only) */}
      <DebugPanel
        treeData={data}
        currentStep={currentStep}
        currentStepIndex={currentStepIndex}
        traversalSteps={traversalSteps}
        selectedOperation={selectedOperation}
        treeType={treeType}
        historyController={historyController}
        visualStateComputer={visualStateComputer || undefined}
        position="bottom-left"
      />
    </div>
  );
};

export type { BinaryTreeNode, BinaryTreeVisualizerProps, TraversalStep, TreeOperation };
export { BST_CONFIG, AVL_CONFIG, HEAP_CONFIG } from "./BinaryTree/types";
export default BinaryTreeVisualizer;
