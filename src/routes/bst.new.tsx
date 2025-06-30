import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BSTProvider,
  useBST,
  BinaryTreeVisualizer,
  BSTOperationsMenu,
  BSTOperationControls
} from "../renderers/BinaryTree";
import { HistoryMenu, type HistoryOperation } from "../components/HistoryMenu";
import { 
  Plus, 
  Search, 
  ArrowDown, 
  ArrowUp,
} from "lucide-react";

export const Route = createFileRoute('/bst/new')({
  component: BSTPage,
});

/**
 * Main BST page component using the new renderer architecture
 */
function BSTPage() {
  return (
    <BSTProvider>
      <BSTPageContent />
    </BSTProvider>
  );
}

/**
 * BST page content that has access to the BST context
 */
function BSTPageContent() {
  const { controller, currentState, isExecuting, animationSpeed, setAnimationSpeed, loadExample } = useBST();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedOperationIndex, setSelectedOperationIndex] = useState(-1);

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
    <div className="relative h-screen w-full bg-background text-foreground overflow-hidden">
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
        onLoadExample={loadExample}
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

      {/* History menu */}
      <HistoryMenu
        operations={historyOperations}
        selectedOperationIndex={selectedOperationIndex}
        onSelectOperation={handleSelectOperation}
        onClearHistory={handleClearHistory}
        getOperationIcon={getOperationIcon}
        isExecuting={isExecuting}
      />
    </div>
  );
}
