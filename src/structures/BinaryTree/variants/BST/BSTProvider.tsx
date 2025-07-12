import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { HistoryController } from '@/lib/core/History';
import { registerBinaryTreeAnimations } from '@structures/BinaryTree/animations';
import type { BinaryTree } from '@structures/BinaryTree/types';
import { loggers } from '@/lib/core';
import { DEFAULT_AUTOPLAY_INTERVAL } from '@structures/BinaryTree/config';

// Register animations on module load
registerBinaryTreeAnimations();

/**
 * Context for BST operations and state management
 */
interface BSTContextValue {
  historyController: HistoryController<BinaryTree>;
  currentState: BinaryTree;
  isExecuting: boolean;
  animationSpeed: number; // 0.25–2, 1 = normal
  setAnimationSpeed: (speed: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const BSTContext = createContext<BSTContextValue | null>(null);

/**
 * Props for the BST Provider
 */
interface BSTProviderProps {
  children: ReactNode;
  initialTree?: BinaryTree | null;
}

/**
 * Provider component for BST visualization
 * 
 * Manages the history controller, state updates, and animation settings.
 * Provides a clean interface for BST components to interact with the data structure.
 */
export function BSTProvider({ children, initialTree }: BSTProviderProps) {
  // Initialize the history controller
  const historyController = useMemo(() => {
    const initialState = initialTree ? initialTree : { root: null, name: "Empty BST" };
    const controller = new HistoryController<BinaryTree>(initialState);
    
    loggers.build.info('History controller initialized', {
      data: {
        hasInitialTree: !!initialTree,
        initialState: initialState
      }
    });
    return controller;
  }, [initialTree]);

  // Track current state manually for now (TODO: integrate with useHistory in future)
  const [currentState, setCurrentState] = useState<BinaryTree>(() => 
    historyController.getCurrentVisualizationState() || { root: null, name: "Empty BST" }
  );

  // Animation state
  const [animationSpeed, setAnimationSpeed] = useState<number>(1); // 1x normal
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Execution state - currently always false since loadExample was removed
  const isExecuting = false;

  // Subscribe to history controller state changes
  useEffect(() => {
    const unsubscribe = historyController.subscribe(() => {
      const newState = historyController.getCurrentVisualizationState();
      loggers.build.debug('State change detected', {
        data: {
          hasNewState: !!newState,
          stateName: newState?.name,
          hasRoot: !!newState?.root,
          rootValue: newState?.root?.value
        }
      });
      if (newState) {
        setCurrentState(newState);
      }
    });

    return unsubscribe;
  }, [historyController]);

  // Autoplay logic
  useEffect(() => {
    if (!isPlaying) return;
    if (!historyController.canStepForward()) {
      setIsPlaying(false);
      return;
    }
    
    // Use global default interval and numeric speed multiplier
    const interval = setInterval(() => {
      if (historyController.canStepForward()) {
        historyController.stepForward();
      } else {
        setIsPlaying(false);
      }
    }, DEFAULT_AUTOPLAY_INTERVAL / animationSpeed);
    
    return () => clearInterval(interval);
  }, [isPlaying, animationSpeed, historyController]);

  const contextValue: BSTContextValue = {
    historyController,
    currentState,
    isExecuting,
    animationSpeed,
    setAnimationSpeed,
    isPlaying,
    setIsPlaying,
  };

  return (
    <BSTContext.Provider value={contextValue}>
      {children}
    </BSTContext.Provider>
  );
}

/**
 * Hook to use the BST context
 * 
 * @returns BST context value with controller, state, and utility functions
 * @throws Error if used outside of BSTProvider
 */
export function useBST(): BSTContextValue {
  const context = useContext(BSTContext);
  if (!context) {
    throw new Error('useBST must be used within a BSTProvider');
  }
  return context;
}
