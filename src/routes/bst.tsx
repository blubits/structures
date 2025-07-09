import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  BSTProvider,
  useBST,
  BinaryTreeVisualizer,
  BSTOperationsMenu,
  BSTOperationControls,
  normalizeBinaryTree,
  type BinaryTree
} from "@/structures/BinaryTree";
import { HistoryMenu, type HistoryOperation } from "@/components/HistoryMenu";
import { DebugPanel } from "@/components/DebugPanel";
import { 
  Plus, 
  Search, 
  ArrowDown, 
  ArrowUp,
} from "lucide-react";

// Create initial BST tree declaratively using plain object syntax
const createInitialBST = (): BinaryTree => {
  // Build tree structure: 
  //       10
  //     /    \
  //    5      15
  //   / \    /  \
  //  3   7  12  18
  const bstSpec: BinaryTree = {
    root: {
      value: 10,
      left: {
        value: 5,
        left: { value: 3, left: null, right: null },
        right: { value: 7, left: null, right: null }
      },
      right: {
        value: 15,
        left: { value: 12, left: null, right: null },
        right: { value: 18, left: null, right: null }
      }
    },
    name: "Sample BST"
  };
  
  return normalizeBinaryTree(bstSpec);
};

export const Route = createFileRoute('/bst')({
  component: BSTPage,
});

/**
 * Main BST page component using the new renderer architecture
 */
function BSTPage() {
  // Create the initial tree declaratively
  const initialTree = createInitialBST();
  
  return (
    <BSTProvider initialTree={initialTree}>
      <BSTPageContent />
    </BSTProvider>
  );
}

/**
 * BST page content that has access to the BST context
 */
function BSTPageContent() {
  const { historyController, currentState, isExecuting, animationSpeed, setAnimationSpeed } = useBST();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedOperationIndex, setSelectedOperationIndex] = useState(-1);

  // Debug logging for current state
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('📄 BSTPageContent: Current state updated', {
        hasCurrentState: !!currentState,
        stateName: currentState?.name,
        hasRoot: !!currentState?.root,
        rootValue: currentState?.root?.value,
        isExecuting
      });
    }
  }, [currentState, isExecuting]);

  // Convert history controller history to HistoryMenu format
  const historyOperations: HistoryOperation[] = historyController.getHistory().map((group, index) => ({
    id: group.operation.id,
    type: group.operation.type,
    description: group.operation.description,
    value: group.operation.params.value,
    timestamp: group.operation.timestamp,
    index
  }));

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement automatic stepping when playing
  };

  const handleSelectOperation = (operationIndex: number) => {
    historyController.jumpTo(operationIndex);
    setSelectedOperationIndex(operationIndex);
  };

  const handleClearHistory = () => {
    historyController.clear();
    setSelectedOperationIndex(-1);
  };

  // Basic undo/redo functionality using the operation history
  const handleUndo = () => {
    const history = historyController.getHistory();
    if (selectedOperationIndex > 0) {
      const newIndex = selectedOperationIndex - 1;
      historyController.jumpTo(newIndex);
      setSelectedOperationIndex(newIndex);
    } else if (history.length > 0 && selectedOperationIndex === -1) {
      // If nothing is selected, go to the last operation
      const newIndex = history.length - 1;
      historyController.jumpTo(newIndex);
      setSelectedOperationIndex(newIndex);
    }
  };

  const handleRedo = () => {
    const history = historyController.getHistory();
    if (selectedOperationIndex < history.length - 1) {
      const newIndex = selectedOperationIndex + 1;
      historyController.jumpTo(newIndex);
      setSelectedOperationIndex(newIndex);
    }
  };

  const canUndo = (() => {
    const history = historyController.getHistory();
    return history.length > 0 && (selectedOperationIndex > 0 || selectedOperationIndex === -1);
  })();

  const canRedo = (() => {
    const history = historyController.getHistory();
    return selectedOperationIndex >= 0 && selectedOperationIndex < history.length - 1;
  })();

  const getOperationIcon = (operation: HistoryOperation) => {
    switch (operation.type) {
      case 'insert': return <Plus className="h-4 w-4" />;
      case 'search': return <Search className="h-4 w-4" />;
      case 'findMin': return <ArrowDown className="h-4 w-4" />;
      case 'findMax': return <ArrowUp className="h-4 w-4" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative h-screen w-full bg-white dark:bg-zinc-900 text-black dark:text-white overflow-hidden">
      {/* Main visualization area */}
      <div className="h-full w-full">
        <BinaryTreeVisualizer 
          state={currentState}
          animationSpeed={animationSpeed}
        />
      </div>

      {/* Operations menu */}
      <BSTOperationsMenu
        isExecuting={isExecuting}
      />

      {/* Operation controls */}
      <BSTOperationControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        animationSpeed={animationSpeed}
        onSpeedChange={setAnimationSpeed}
      />

      {/* Debug panel */}
      {import.meta.env.DEV && (
        <DebugPanel
          currentState={currentState}
          operationHistory={historyController.getHistory()}
          currentOperationIndex={historyController.getCurrentOperationIndex()}
          currentAnimationIndex={historyController.getCurrentAnimationIndex()}
          isAnimating={historyController.isAnimating()}
          stepDebug={{
            currentOperationStates: (() => {
              const idx = historyController.getCurrentOperationIndex();
              const hist = historyController.getHistory();
              return idx >= 0 && idx < hist.length ? [...hist[idx].states] : [];
            })(),
            currentAnimationIndex: historyController.getCurrentAnimationIndex(),
            currentOperationIndex: historyController.getCurrentOperationIndex(),
            isAnimating: historyController.isAnimating(),
            canStepForward: historyController.canStepForward(),
            canStepBackward: historyController.canStepBackward(),
          }}
        />
      )}

      {/* History menu */}
      <HistoryMenu
        operations={historyOperations}
        selectedOperationIndex={selectedOperationIndex}
        onSelectOperation={handleSelectOperation}
        onClearHistory={handleClearHistory}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        getOperationIcon={getOperationIcon}
        isExecuting={isExecuting}
      />
    </div>
  );
}
