import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OperationHistoryController } from "../lib/core/OperationHistoryController";
import { BinaryTreeVisualizer } from "../components/BinaryTreeVisualizer";
import { BSTOperationsMenu } from "../components/BSTOperationsMenu";
import { HistoryMenu, type HistoryOperation } from "../components/HistoryMenu";
import { BSTOperationControls } from "../components/BinaryTree/bst-operation-controls";
import { DebugPanel } from "../components/DebugPanel";
import { binaryTreeExamples } from "../lib/binary-tree-examples";
import type { BinaryTreeNode } from "../lib/types/binary-tree-node";
import { 
  Plus, 
  Search, 
  ArrowDown, 
  ArrowUp,
} from "lucide-react";

export const Route = createFileRoute('/bst/old')({
  component: BSTDeclarativePage,
});

const initialBstTree: BinaryTreeNode = {
  value: 8,
  state: "default",
  traversalDirection: null,
  left: {
    value: 3,
    state: "default",
    traversalDirection: null,
    left: { 
      value: 1, 
      state: "default", 
      traversalDirection: null, 
      left: null, 
      right: null 
    },
    right: {
      value: 6,
      state: "default",
      traversalDirection: null,
      left: { 
        value: 4, 
        state: "default", 
        traversalDirection: null, 
        left: null, 
        right: null 
      },
      right: { 
        value: 7, 
        state: "default", 
        traversalDirection: null, 
        left: null, 
        right: null 
      },
    },
  },
  right: {
    value: 10,
    state: "default",
    traversalDirection: null,
    left: null,
    right: {
      value: 14,
      state: "default",
      traversalDirection: null,
      left: null,
      right: { 
        value: 17, 
        state: "default", 
        traversalDirection: null, 
        left: null, 
        right: null 
      },
    },
  },
};

function BSTDeclarativePage() {
  // Create the declarative BST history controller
  const historyController = useMemo(() => new BinaryTreeHistoryController(initialBstTree), []);
  
  // State for current tree and animation control
  const [currentTree, setCurrentTree] = useState<BinaryTreeNode | null>(initialBstTree);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [operations, setOperations] = useState<HistoryOperation[]>([]);
  const [selectedOperationIndex, setSelectedOperationIndex] = useState(-1);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  // Update current tree when history changes
  useEffect(() => {
    const currentState = historyController.getCurrentState();
    if (currentState) {
      setCurrentTree(currentState.tree);
    }
  }, [historyController]);

  // Operation execution methods using declarative system
  const executeInsert = useCallback(async (value: number) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    try {
      const states = historyController.generateInsertStates(currentTree, value);
      
      // Add operation to history menu
      const newOperation: HistoryOperation = {
        type: 'insert',
        value,
        timestamp: Date.now(),
        description: `Insert ${value}`,
        resultingTree: states[states.length - 1]?.tree || null,
        states
      };
      
      const newOperationIndex = operations.length;
      setOperations(prev => [...prev, newOperation]);
      
      // Push all states to history
      states.forEach((state, index) => {
        historyController.pushState(state.tree, `insert-${value}-step-${index + 1}`);
      });
      
      // Automatically start step-by-step visualization
      setSelectedOperationIndex(newOperationIndex);
      setCurrentStepIndex(0);
      setCurrentTree(states[0]?.tree || currentTree);
      
    } catch (error) {
      console.error('Error during insert operation:', error);
    } finally {
      setIsAnimating(false);
    }
  }, [historyController, currentTree, isAnimating, operations.length]);

  const executeSearch = useCallback(async (value: number) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    try {
      const states = historyController.generateSearchStates(currentTree, value);
      
      // Add operation to history menu
      const newOperation: HistoryOperation = {
        type: 'search',
        value,
        timestamp: Date.now(),
        description: `Search ${value}`,
        resultingTree: states[states.length - 1]?.tree || null,
        states
      };
      
      const newOperationIndex = operations.length;
      setOperations(prev => [...prev, newOperation]);
      
      // Push all states to history
      states.forEach((state, index) => {
        historyController.pushState(state.tree, `search-${value}-step-${index + 1}`);
      });
      
      // Automatically start step-by-step visualization
      setSelectedOperationIndex(newOperationIndex);
      setCurrentStepIndex(0);
      setCurrentTree(states[0]?.tree || currentTree);
      
    } catch (error) {
      console.error('Error during search operation:', error);
    } finally {
      setIsAnimating(false);
    }
  }, [historyController, currentTree, isAnimating, operations.length]);

  const executeDelete = useCallback(async (value: number) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    try {
      const states = historyController.generateDeleteStates(currentTree, value);
      
      // Add operation to history menu
      const newOperation: HistoryOperation = {
        type: 'delete',
        value,
        timestamp: Date.now(),
        description: `Delete ${value}`,
        resultingTree: states[states.length - 1]?.tree || null,
        states
      };
      
      const newOperationIndex = operations.length;
      setOperations(prev => [...prev, newOperation]);
      
      // Push all states to history
      states.forEach((state, index) => {
        historyController.pushState(state.tree, `delete-${value}-step-${index + 1}`);
      });
      
      // Automatically start step-by-step visualization
      setSelectedOperationIndex(newOperationIndex);
      setCurrentStepIndex(0);
      setCurrentTree(states[0]?.tree || currentTree);
      
    } catch (error) {
      console.error('Error during delete operation:', error);
    } finally {
      setIsAnimating(false);
    }
  }, [historyController, currentTree, isAnimating, operations.length]);

  const executeFindMin = useCallback(async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    try {
      const states = historyController.generateFindMinStates(currentTree);
      
      // Add operation to history menu
      const newOperation: HistoryOperation = {
        type: 'findMin',
        timestamp: Date.now(),
        description: 'Find Minimum',
        resultingTree: states[states.length - 1]?.tree || null,
        states
      };
      
      const newOperationIndex = operations.length;
      setOperations(prev => [...prev, newOperation]);
      
      // Push all states to history
      states.forEach((state, index) => {
        historyController.pushState(state.tree, `findMin-step-${index + 1}`);
      });
      
      // Automatically start step-by-step visualization
      setSelectedOperationIndex(newOperationIndex);
      setCurrentStepIndex(0);
      setCurrentTree(states[0]?.tree || currentTree);
      
    } catch (error) {
      console.error('Error during findMin operation:', error);
    } finally {
      setIsAnimating(false);
    }
  }, [historyController, currentTree, isAnimating, operations.length]);

  const executeFindMax = useCallback(async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    try {
      const states = historyController.generateFindMaxStates(currentTree);
      
      // Add operation to history menu
      const newOperation: HistoryOperation = {
        type: 'findMax',
        timestamp: Date.now(),
        description: 'Find Maximum',
        resultingTree: states[states.length - 1]?.tree || null,
        states
      };
      
      const newOperationIndex = operations.length;
      setOperations(prev => [...prev, newOperation]);
      
      // Push all states to history
      states.forEach((state, index) => {
        historyController.pushState(state.tree, `findMax-step-${index + 1}`);
      });
      
      // Automatically start step-by-step visualization
      setSelectedOperationIndex(newOperationIndex);
      setCurrentStepIndex(0);
      setCurrentTree(states[0]?.tree || currentTree);
      
    } catch (error) {
      console.error('Error during findMax operation:', error);
    } finally {
      setIsAnimating(false);
    }
  }, [historyController, currentTree, isAnimating, operations.length]);

  // History navigation methods
  const selectAndVisualizeOperation = useCallback((index: number) => {
    if (index < 0 || index >= operations.length) return;
    
    setSelectedOperationIndex(index);
    setCurrentStepIndex(0);
    
    const operation = operations[index];
    if (operation.states && operation.states.length > 0) {
      setCurrentTree(operation.states[0].tree);
    }
  }, [operations]);

  const stepForward = useCallback(() => {
    if (selectedOperationIndex < 0 || selectedOperationIndex >= operations.length) return;
    
    const operation = operations[selectedOperationIndex];
    const nextIndex = Math.min(currentStepIndex + 1, (operation.states?.length || 1) - 1);
    
    setCurrentStepIndex(nextIndex);
    
    if (operation.states && operation.states[nextIndex]) {
      setCurrentTree(operation.states[nextIndex].tree);
    }
  }, [selectedOperationIndex, operations, currentStepIndex]);

  const stepBackward = useCallback(() => {
    if (selectedOperationIndex < 0 || selectedOperationIndex >= operations.length) return;
    
    const operation = operations[selectedOperationIndex];
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    
    setCurrentStepIndex(prevIndex);
    
    if (operation.states && operation.states[prevIndex]) {
      setCurrentTree(operation.states[prevIndex].tree);
    }
  }, [selectedOperationIndex, operations, currentStepIndex]);

  const restartVisualization = useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    
    if (selectedOperationIndex >= 0 && selectedOperationIndex < operations.length) {
      const operation = operations[selectedOperationIndex];
      if (operation.states && operation.states[0]) {
        setCurrentTree(operation.states[0].tree);
      }
    }
  }, [selectedOperationIndex, operations]);

  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const clearHistory = useCallback(() => {
    historyController.clear();
    setOperations([]);
    setSelectedOperationIndex(-1);
    setCurrentStepIndex(-1);
    setCurrentTree(initialBstTree);
    setIsPlaying(false);
  }, [historyController]);

  // Undo/Redo functionality
  const undo = useCallback(() => {
    const prevState = historyController.undo();
    if (prevState) {
      setCurrentTree(prevState.tree);
    }
  }, [historyController]);

  const redo = useCallback(() => {
    const nextState = historyController.redo();
    if (nextState) {
      setCurrentTree(nextState.tree);
    }
  }, [historyController]);

  // Helper function to get operation icons for history menu
  const getOperationIcon = useCallback((operation: HistoryOperation) => {
    switch (operation.type) {
      case 'insert':
        return <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      case 'search':
        return <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      case 'delete':
        return <ArrowDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      case 'findMin':
        return <ArrowDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      case 'findMax':
        return <ArrowUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      default:
        return <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  }, []);

  // Load example operation for demonstration
  const loadExample = useCallback((exampleType: 'search' | 'insert' | 'delete') => {
    const example = binaryTreeExamples[`${exampleType}Example`];
    if (example && example.length > 0) {
      setCurrentTree(example[0]);
      
      const newOperation: HistoryOperation = {
        type: exampleType,
        timestamp: Date.now(),
        description: `${exampleType} Example`,
        resultingTree: example[example.length - 1],
        states: example.map(tree => ({ tree, operation: `${exampleType}-example`, timestamp: Date.now() }))
      };
      
      setOperations(prev => [...prev, newOperation]);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      historyController.clear();
    };
  }, [historyController]);

  // Helper to get previous tree for debug panel
  const [previousTree, setPreviousTree] = useState<BinaryTreeNode | null>(null);
  
  // Update previous tree when current tree changes
  useEffect(() => {
    setPreviousTree(currentTree);
  }, [currentTree]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || selectedOperationIndex < 0) return;
    
    const operation = operations[selectedOperationIndex];
    if (!operation?.states || currentStepIndex >= operation.states.length - 1) {
      setIsPlaying(false);
      return;
    }
    
    const timer = setTimeout(() => {
      stepForward();
    }, 1000); // 1 second between steps
    
    return () => clearTimeout(timer);
  }, [isPlaying, selectedOperationIndex, operations, currentStepIndex, stepForward]);

  return (
    <div className="relative w-full h-screen bg-white dark:bg-zinc-900 transition-colors overflow-hidden">      
      {/* White fade overlay for sidebar edge */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-20 z-20 bg-gradient-to-r from-white to-white/0 dark:from-zinc-900 dark:to-zinc-900/0"
      />

      {/* Declarative Operations Panel */}
      <BSTOperationsMenu
        isExecuting={isAnimating}
        onInsert={executeInsert}
        onSearch={executeSearch}
        onDelete={executeDelete}
        onFindMin={executeFindMin}
        onFindMax={executeFindMax}
        onUndo={undo}
        onRedo={redo}
        onLoadExample={loadExample}
        canUndo={historyController.canUndo()}
        canRedo={historyController.canRedo()}
      />

      {/* History Panel */}
      <HistoryMenu
        operations={operations}
        selectedOperationIndex={selectedOperationIndex}
        onSelectOperation={selectAndVisualizeOperation}
        getOperationIcon={getOperationIcon}
        onClearHistory={clearHistory}
        isExecuting={isAnimating}
      />

      {/* Declarative BST Visualizer */}
      <BinaryTreeVisualizer 
        tree={currentTree}
      />

      {/* Operation Controls Overlay */}
      <BSTOperationControls
        isActive={selectedOperationIndex >= 0}
        currentStepIndex={currentStepIndex}
        operationStates={selectedOperationIndex >= 0 ? operations[selectedOperationIndex]?.states : undefined}
        currentOperation={selectedOperationIndex >= 0 ? operations[selectedOperationIndex] : undefined}
        onTogglePlayback={togglePlayback}
        onStepForward={stepForward}
        onStepBackward={stepBackward}
        onRestartOperation={restartVisualization}
        isPlaying={isPlaying}
      />

      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel
          currentTree={currentTree}
          previousTree={previousTree}
          selectedOperationIndex={selectedOperationIndex}
          currentStepIndex={currentStepIndex}
          operations={operations}
          operationStates={selectedOperationIndex >= 0 ? operations[selectedOperationIndex]?.states : undefined}
          position="bottom-left"
        />
      )}
    </div>
  );
}
