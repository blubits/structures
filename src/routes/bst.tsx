import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  BSTProvider,
  useBST,
  BinaryTreeVisualizer,
  BSTOperationsMenu,
  BSTOperationControls,
  createBinaryTree,
  createBinaryTreeNode,
  type BinaryTree
} from "../renderers/BinaryTree";
import { HistoryMenu, type HistoryOperation } from "../components/HistoryMenu";
import { DebugPanel } from "../components/DebugPanel";
import { 
  Plus, 
  Search, 
  ArrowDown, 
  ArrowUp,
} from "lucide-react";

// Create initial BST tree declaratively
const createInitialBST = (): BinaryTree => {
  // Build tree structure: 
  //       10
  //     /    \
  //    5      15
  //   / \    /  \
  //  3   7  12  18
  const root = createBinaryTreeNode(
    10,
    createBinaryTreeNode(
      5,
      createBinaryTreeNode(3),
      createBinaryTreeNode(7)
    ),
    createBinaryTreeNode(
      15,
      createBinaryTreeNode(12),
      createBinaryTreeNode(18)
    )
  );
  
  return createBinaryTree(root, "Sample BST");
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
  const { controller, currentState, isExecuting, animationSpeed, setAnimationSpeed } = useBST();
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
        nodeCount: currentState?.nodeCount,
        isExecuting
      });
    }
  }, [currentState, isExecuting]);

  // Convert controller history to HistoryMenu format
  const historyOperations: HistoryOperation[] = controller.getHistory().map((group, index) => ({
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
    controller.jumpTo(operationIndex);
    setSelectedOperationIndex(operationIndex);
  };

  const handleClearHistory = () => {
    controller.clear();
    setSelectedOperationIndex(-1);
  };

  // Basic undo/redo functionality using the operation history
  const handleUndo = () => {
    const history = controller.getHistory();
    if (selectedOperationIndex > 0) {
      const newIndex = selectedOperationIndex - 1;
      controller.jumpTo(newIndex);
      setSelectedOperationIndex(newIndex);
    } else if (history.length > 0 && selectedOperationIndex === -1) {
      // If nothing is selected, go to the last operation
      const newIndex = history.length - 1;
      controller.jumpTo(newIndex);
      setSelectedOperationIndex(newIndex);
    }
  };

  const handleRedo = () => {
    const history = controller.getHistory();
    if (selectedOperationIndex < history.length - 1) {
      const newIndex = selectedOperationIndex + 1;
      controller.jumpTo(newIndex);
      setSelectedOperationIndex(newIndex);
    }
  };

  const canUndo = (() => {
    const history = controller.getHistory();
    return history.length > 0 && (selectedOperationIndex > 0 || selectedOperationIndex === -1);
  })();

  const canRedo = (() => {
    const history = controller.getHistory();
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
        controller={controller}
        isExecuting={isExecuting}
      />

      {/* Operation controls */}
      <BSTOperationControls
        controller={controller}
        currentState={currentState}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        animationSpeed={animationSpeed}
        onSpeedChange={setAnimationSpeed}
      />

      {/* Debug panel */}
      {import.meta.env.DEV && (
        <DebugPanel
          currentState={currentState}
          operationHistory={controller.getHistory()}
          currentOperationIndex={controller.getCurrentOperationIndex()}
          currentAnimationIndex={controller.getCurrentAnimationIndex()}
          isAnimating={controller.isAnimating()}
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
