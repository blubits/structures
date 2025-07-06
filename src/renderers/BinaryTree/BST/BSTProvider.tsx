import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { HistoryController } from '@/lib/core/History';
import { normalizeBinaryTree } from '@/renderers/BinaryTree/types';
import type { BinaryTree, NormalizedBinaryTree } from '@/renderers/BinaryTree/types';
import { registerBinaryTreeAnimations } from '@/renderers/BinaryTree/components/animations';

// Register animations on module load
registerBinaryTreeAnimations();

/**
 * Context for BST operations and state management
 */
interface BSTContextValue {
  historyController: HistoryController<NormalizedBinaryTree>;
  currentState: NormalizedBinaryTree;
  isExecuting: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
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
    const initialState = initialTree ? normalizeBinaryTree(initialTree) : normalizeBinaryTree({ root: null, name: "Empty BST" });
    const controller = new HistoryController<NormalizedBinaryTree>(initialState);
    
    if (import.meta.env.DEV) {
      console.log('🏗️ BSTProvider: History controller initialized', {
        hasInitialTree: !!initialTree,
        initialState: initialState
      });
    }
    return controller;
  }, [initialTree]);

  // Track current state manually for now (TODO: integrate with useHistory in future)
  const [currentState, setCurrentState] = useState<NormalizedBinaryTree>(() => 
    historyController.getCurrentVisualizationState() || normalizeBinaryTree({ root: null, name: "Empty BST" })
  );

  // Animation state
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  
  // Execution state - currently always false since loadExample was removed
  const isExecuting = false;

  // Subscribe to history controller state changes
  useEffect(() => {
    const unsubscribe = historyController.subscribe(() => {
      const newState = historyController.getCurrentVisualizationState();
      if (import.meta.env.DEV) {
        console.log('🏗️ BSTProvider: State change detected', {
          hasNewState: !!newState,
          stateName: newState?.name,
          hasRoot: !!newState?.root,
          rootValue: newState?.root?.value
        });
      }
      if (newState) {
        setCurrentState(newState);
      }
    });

    return unsubscribe;
  }, [historyController]);

  const contextValue: BSTContextValue = {
    historyController,
    currentState,
    isExecuting,
    animationSpeed,
    setAnimationSpeed,
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
