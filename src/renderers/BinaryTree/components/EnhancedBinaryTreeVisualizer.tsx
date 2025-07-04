// Enhanced BinaryTreeVisualizer that uses the new reconciliation system

import React, { useRef, useEffect, useMemo } from "react";
import { useTheme } from "../../../components/ThemeProvider";
import type { BinaryTree, BinaryTreeSpec } from "../types";
import { renderBinaryTree } from "./renderer.js";
import { registerBinaryTreeAnimations } from "./animations.js";
import { reconcileBinaryTree } from "../types";

// Initialize animations once when the module loads
let animationsInitialized = false;

interface EnhancedBinaryTreeVisualizerProps {
  // Accept either a full BinaryTree or a plain object specification
  state: BinaryTree | BinaryTreeSpec;
  animationSpeed?: 'slow' | 'normal' | 'fast';
  disableResize?: boolean;
}

export const EnhancedBinaryTreeVisualizer: React.FC<EnhancedBinaryTreeVisualizerProps> = ({
  state,
  animationSpeed = 'normal',
  disableResize = true
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitialized = useRef(false);
  const renderCount = useRef(0);
  const prevTreeRef = useRef<BinaryTree | null>(null);
  const { prefersDarkMode } = useTheme();

  // Initialize animations on first mount
  useEffect(() => {
    if (!animationsInitialized) {
      if (import.meta.env.DEV) {
        console.log('🎬 EnhancedBinaryTreeVisualizer: Initializing animations...');
      }
      registerBinaryTreeAnimations();
      animationsInitialized = true;
    }
  }, []);

  // Track render count for debugging
  renderCount.current++;

  // Reconcile the tree state with the previous state for efficient updates
  const reconciledTree = useMemo(() => {
    if (import.meta.env.DEV) {
      console.log('🔄 EnhancedBinaryTreeVisualizer: Reconciling tree state', {
        renderCount: renderCount.current,
        hasState: !!state,
        isSpec: !('nodeCount' in state), // Check if it's a spec vs full tree
        prevTree: prevTreeRef.current?.name,
        newName: state?.name,
      });
    }

    let reconciledTree: BinaryTree;

    // Check if the input is a plain object specification
    if (!('nodeCount' in state)) {
      // It's a BinaryTreeSpec, reconcile it with the previous tree
      reconciledTree = reconcileBinaryTree(prevTreeRef.current, state as BinaryTreeSpec);
    } else {
      // It's already a BinaryTree, use it as is
      reconciledTree = state as BinaryTree;
    }

    // Store the reconciled tree for next time
    prevTreeRef.current = reconciledTree;

    if (import.meta.env.DEV) {
      console.log('🔄 EnhancedBinaryTreeVisualizer: Reconciliation complete', {
        hasRoot: !!reconciledTree.root,
        rootValue: reconciledTree.root?.value,
        rootId: reconciledTree.root?.id,
        nodeCount: reconciledTree.nodeCount,
        height: reconciledTree.height,
        animationHintsCount: reconciledTree.animationHints?.length || 0,
      });
    }

    return reconciledTree;
  }, [state]);

  // Create visual state for the renderer
  const visualState = useMemo(() => {
    const newVisualState = {
      tree: reconciledTree.root,
      animationSpeed,
      theme: (prefersDarkMode ? 'dark' : 'light') as 'dark' | 'light',
      animationHints: reconciledTree.animationHints
    };

    if (import.meta.env.DEV) {
      console.log('🎨 EnhancedBinaryTreeVisualizer: Visual state created', {
        hasTree: !!newVisualState.tree,
        treeId: newVisualState.tree?.id,
        theme: newVisualState.theme,
        animationHintsCount: newVisualState.animationHints?.length || 0,
      });
    }

    return newVisualState;
  }, [reconciledTree, animationSpeed, prefersDarkMode]);

  // Initialize and update the renderer
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🖼️ EnhancedBinaryTreeVisualizer: Rendering with reconciled tree', {
        renderCount: renderCount.current,
        hasSvgRef: !!svgRef.current,
        hasContainerRef: !!containerRef.current,
        isInitialized: isInitialized.current,
        treeId: visualState.tree?.id,
      });
    }

    if (!svgRef.current || !containerRef.current) return;
    
    try {
      const isFirstRender = !isInitialized.current;
      
      renderBinaryTree(svgRef.current, containerRef.current, visualState, isFirstRender);
      
      if (isFirstRender) {
        isInitialized.current = true;
        if (import.meta.env.DEV) {
          console.log('🖼️ EnhancedBinaryTreeVisualizer: First render complete');
        }
      }
    } catch (error) {
      console.error('❌ EnhancedBinaryTreeVisualizer: Render error:', error);
    }
  }, [visualState]);

  return (
    <div 
      ref={containerRef}
      className="binary-tree-visualizer"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: prefersDarkMode ? '#1a1a1a' : '#ffffff',
        borderRadius: '8px',
      }}
    >
      <svg
        ref={svgRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};

// Example usage:
/*
const treeSpec: BinaryTreeSpec = {
  root: {
    value: 8,
    state: "default",
    left: {
      value: 3,
      state: "active",
      left: null,
      right: null,
    },
    right: null,
  },
  name: "Simple tree",
  animationHints: [],
};

<EnhancedBinaryTreeVisualizer state={treeSpec} />
*/
