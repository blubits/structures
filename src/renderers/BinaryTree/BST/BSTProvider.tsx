import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { BSTOperationController } from './BSTOperationController';
import { createBinaryTree } from '../types';
import type { BinaryTree } from '../types';
import { registerBinaryTreeAnimations } from '../components/animations';

// Register animations on module load
registerBinaryTreeAnimations();

/**
 * Context for BST operations and state management
 */
interface BSTContextValue {
  controller: BSTOperationController;
  currentState: BinaryTree;
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
 * Manages the BST controller, state updates, and animation settings.
 * Provides a clean interface for BST components to interact with the data structure.
 */
export function BSTProvider({ children, initialTree }: BSTProviderProps) {
  // Initialize the BST controller
  const controller = useMemo(() => {
    const newController = new BSTOperationController(initialTree || createBinaryTree(null, "Empty BST"));
    
    if (import.meta.env.DEV) {
      console.log('🏗️ BSTProvider: Controller initialized', {
        hasInitialTree: !!initialTree,
        initialState: newController.getCurrentVisualizationState()
      });
    }
    return newController;
  }, [initialTree]);

  // Track current state manually for now (TODO: integrate with useHistory in future)
  const [currentState, setCurrentState] = useState<BinaryTree>(() => 
    controller.getCurrentVisualizationState() || createBinaryTree(null, "Empty BST")
  );

  // Animation state
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  
  // Execution state - currently always false since loadExample was removed
  const isExecuting = false;

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controller.getHistoryController().subscribe(() => {
      const newState = controller.getCurrentVisualizationState();
      if (import.meta.env.DEV) {
        console.log('🏗️ BSTProvider: State change detected', {
          hasNewState: !!newState,
          stateName: newState?.name,
          hasRoot: !!newState?.root,
          rootValue: newState?.root?.value,
          nodeCount: newState?.nodeCount
        });
      }
      if (newState) {
        setCurrentState(newState as BinaryTree);
      }
    });

    return unsubscribe;
  }, [controller]);

  const contextValue: BSTContextValue = {
    controller,
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
