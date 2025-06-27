import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo } from "react";
import { 
  Plus, 
  Search, 
  ArrowDown, 
  ArrowUp,
  RotateCcw,
} from "lucide-react";
import BinaryTreeVisualizer, { 
  BST_CONFIG,
  type BinaryTreeNode, 
  type TraversalStep, 
  type TreeOperation 
} from "../components/BinaryTreeVisualizer";
import { BSTHistoryController } from "../lib/BSTHistoryController";
import { useHistoryController } from "../lib/useHistoryController";
import { BSTOperationsMenu } from "../components/BSTOperationsMenu";
import { HistoryMenu, type HistoryOperation } from "../components/HistoryMenu";

export const Route = createFileRoute('/bst')({
  component: BSTPage,
});

const initialBstData: BinaryTreeNode = {
  value: 8,
  left: {
    value: 3,
    left: { value: 1 },
    right: {
      value: 6,
      left: { value: 4 },
      right: { value: 7 },
    },
  },
  right: {
    value: 10,
    right: {
      value: 14,
      right: { value: 17 },
    },
  },
};

function BSTPage() {
  // Create the BST history controller
  const bstController = useMemo(() => new BSTHistoryController(initialBstData), []);
  
  // Use the history controller hook
  const historyState = useHistoryController(bstController);

  // Derived state
  const currentOperationSteps = historyState.getCurrentOperationSteps();
  const selectedOperation = historyState.selectedOperationIndex >= 0 
    ? historyState.operations[historyState.selectedOperationIndex]?.type || 'search'
    : 'search';

  // Operation execution methods
  const executeInsert = useCallback(async (value: number) => {
    try {
      await bstController.insert(value);
    } catch (error) {
      console.error('Error during insert operation:', error);
    }
  }, [bstController]);

  const executeSearch = useCallback(async (value: number) => {
    try {
      await bstController.search(value);
    } catch (error) {
      console.error('Error during search operation:', error);
    }
  }, [bstController]);

  const executeFindMin = useCallback(async () => {
    try {
      await bstController.findMin();
    } catch (error) {
      console.error('Error during findMin operation:', error);
    }
  }, [bstController]);

  const executeFindMax = useCallback(async () => {
    try {
      await bstController.findMax();
    } catch (error) {
      console.error('Error during findMax operation:', error);
    }
  }, [bstController]);

  const clearHistory = useCallback(() => {
    historyState.clearHistory(initialBstData);
  }, [historyState]);

  // Helper function to get operation icons for history menu
  const getOperationIcon = useCallback((operation: HistoryOperation) => {
    switch (operation.type) {
      case 'insert':
        return <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      case 'search':
        return <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      case 'findMin':
        return <ArrowDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      case 'findMax':
        return <ArrowUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      case 'leftRotation':
        return <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      case 'rightRotation':
        return <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400 scale-x-[-1]" />;
      default:
        return <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  }, []);

  // Handle step completion (for compatibility with existing visualizer)
  const handleStepComplete = useCallback((step: TraversalStep, stepIndex: number) => {
    console.log(`Completed step ${stepIndex + 1}:`, step.metadata.description);
    // The history controller handles state management automatically
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      bstController.destroy();
    };
  }, [bstController]);

  return (
    <div className="relative w-full h-screen bg-white dark:bg-zinc-900 transition-colors overflow-hidden">      
      {/* White fade overlay for sidebar edge (Tailwind) */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-20 z-20 bg-gradient-to-r from-white to-white/0 dark:from-zinc-900 dark:to-zinc-900/0"
      />

      {/* Operations Panel */}
      <BSTOperationsMenu
        isExecuting={historyState.isExecuting}
        onInsert={executeInsert}
        onSearch={executeSearch}
        onFindMin={executeFindMin}
        onFindMax={executeFindMax}
      />

      {/* History Panel */}
      <HistoryMenu
        operations={historyState.operations as HistoryOperation[]}
        selectedOperationIndex={historyState.selectedOperationIndex}
        onSelectOperation={historyState.selectAndVisualize}
        getOperationIcon={getOperationIcon}
        onClearHistory={clearHistory}
        isExecuting={historyState.isExecuting}
      />

      {/* Full-screen BST visualizer */}
      <BinaryTreeVisualizer 
        data={historyState.currentState}
        treeType={BST_CONFIG}
        traversalSteps={currentOperationSteps as TraversalStep[]}
        currentStepIndex={historyState.currentStepIndex}
        isTraversing={historyState.selectedOperationIndex >= 0}
        onStepComplete={handleStepComplete}
        animationSpeed="normal"
        // Pass control functions to the visualizer
        onTogglePlayback={historyState.togglePlayback}
        onStepForward={historyState.stepForward}
        onStepBackward={historyState.stepBackward}
        onRestartTraversal={historyState.restartVisualization}
        isPlaying={historyState.isPlaying}
        selectedOperation={selectedOperation as TreeOperation}
        // Pass the history controller for intelligent highlighting
        historyController={bstController}
      />
    </div>
  );
}

