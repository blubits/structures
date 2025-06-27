import React from "react";
import { TraversalOverlay as GenericTraversalOverlay } from "./overlays";
import type { BSTVisualizerProps } from "./types";
import { BST_CONFIG } from "./types";

export const BSTTraversalOverlay: React.FC<BSTVisualizerProps> = ({
  onActualInsert,
  insertValue,
  isTraversing,
  currentStepIndex = -1,
  traversalSteps = [],
  onTogglePlayback,
  onStepForward,
  onStepBackward,
  onResetTraversal,
  isPlaying,
  selectedOperation,
}) => {
  if (!isTraversing) return null;

  return (
    <div className="relative">
      <GenericTraversalOverlay 
        isTraversing={isTraversing}
        currentStepIndex={currentStepIndex}
        traversalSteps={traversalSteps}
        onTogglePlayback={onTogglePlayback}
        onStepForward={onStepForward}
        onStepBackward={onStepBackward}
        onRestartTraversal={onResetTraversal}
        isPlaying={isPlaying}
        selectedOperation={selectedOperation}
        treeType={BST_CONFIG}
      />
      {/* BST-specific UI elements */}
      {onActualInsert && insertValue && (
        <button 
          onClick={onActualInsert}
          className="absolute top-0 right-0 px-2 py-1 bg-green-500 text-white rounded text-xs"
        >
          Insert {insertValue}
        </button>
      )}
    </div>
  );
};
