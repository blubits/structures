/**
 * Binary Tree Visualization Overlays
 * 
 * This module provides overlay components for binary tree visualizations,
 * particularly the TraversalOverlay which displays real-time information
 * during algorithm execution and step-by-step traversals.
 * 
 * The overlays are designed to be non-intrusive while providing essential
 * feedback about the current state of tree operations, including:
 * - Current operation type and description
 * - Step progress indicators
 * - Playback controls for algorithm visualization
 * - Contextual information about the current step
 * - Debug information (development mode only)
 * 
 * @example
 * ```tsx
 * <TraversalOverlay
 *   isTraversing={true}
 *   currentStepIndex={2}
 *   traversalSteps={algorithmSteps}
 *   onTogglePlayback={handlePlayback}
 *   isPlaying={isAutoPlaying}
 * />
 * ```
 */

import React, { useState } from "react";
import type { TraversalStep, TreeOperation, TreeTypeConfig } from "./types";

/**
 * Debug Panel Component (Development Mode Only)
 * 
 * Displays raw data structures and internal state for debugging purposes.
 * Only rendered when running in development mode (import.meta.env.DEV).
 */
interface DebugPanelProps {
  currentStep: TraversalStep;
  currentStepIndex: number;
  traversalSteps: TraversalStep[];
  selectedOperation?: TreeOperation;
  treeType?: TreeTypeConfig;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ 
  currentStep, 
  currentStepIndex, 
  traversalSteps, 
  selectedOperation, 
  treeType 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!import.meta.env.DEV) {
    return null;
  }

  const debugData = {
    currentStepIndex,
    totalSteps: traversalSteps.length,
    currentStep: {
      id: currentStep.id,
      operation: currentStep.operation,
      decision: currentStep.decision,
      currentNode: {
        value: currentStep.currentNode.value,
        left: currentStep.currentNode.left?.value || null,
        right: currentStep.currentNode.right?.value || null,
      },
      nextNode: currentStep.nextNode ? {
        value: currentStep.nextNode.value,
        left: currentStep.nextNode.left?.value || null,
        right: currentStep.nextNode.right?.value || null,
      } : null,
      metadata: currentStep.metadata,
    },
    selectedOperation,
    treeType: treeType?.name,
    environment: {
      isDev: import.meta.env.DEV,
      mode: import.meta.env.MODE,
    }
  };

  return (
    <div className="border-t border-white/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 text-left text-xs hover:bg-white/10 transition-colors flex items-center justify-between"
      >
        <span className="text-orange-300 font-mono">🐛 Current Step Debug</span>
        <span className="text-white/60">{isExpanded ? '▼' : '▶'}</span>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-3 max-h-48 overflow-y-auto">
          <pre className="text-xs font-mono text-green-300 bg-black/30 rounded p-2 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

/**
 * Props for the TraversalOverlay component
 * 
 * Configures the overlay's appearance and behavior during algorithm visualization.
 */
interface TraversalOverlayProps {
  /** Whether algorithm traversal is currently active */
  isTraversing: boolean;
  /** Current step index in the traversal sequence (-1 means before first step) */
  currentStepIndex: number;
  /** Array of all steps in the current traversal */
  traversalSteps: TraversalStep[];
  /** Callback to toggle automatic playback of steps */
  onTogglePlayback?: () => void;
  /** Callback to manually advance to next step */
  onStepForward?: () => void;
  /** Callback to manually go back to previous step */
  onStepBackward?: () => void;
  /** Callback to restart traversal from the first step */
  onRestartTraversal?: () => void;
  /** Whether automatic playback is currently active */
  isPlaying?: boolean;
  /** The current tree operation being visualized */
  selectedOperation?: TreeOperation;
  /** Tree type configuration (for future extensibility) */
  treeType?: TreeTypeConfig;
}

/**
 * TraversalOverlay Component
 * 
 * Displays a semi-transparent overlay during algorithm visualization that shows:
 * - Current operation name and description
 * - Step progress (current step / total steps)
 * - Current step's detailed description
 * - Manual navigation controls (if callbacks provided)
 * 
 * The overlay automatically appears when traversal is active and hides when not needed.
 * It's positioned in the bottom-right corner to avoid interfering with the tree visualization.
 * 
 * @param props Configuration props for the overlay
 * @returns JSX element or null if not currently traversing
 * 
 * @example
 * ```tsx
 * // Basic overlay for read-only visualization
 * <TraversalOverlay
 *   isTraversing={isExecuting}
 *   currentStepIndex={currentStep}
 *   traversalSteps={steps}
 * />
 * 
 * // Interactive overlay with playback controls
 * <TraversalOverlay
 *   isTraversing={isExecuting}
 *   currentStepIndex={currentStep}
 *   traversalSteps={steps}
 *   onTogglePlayback={togglePlay}
 *   onStepForward={stepForward}
 *   onStepBackward={stepBackward}
 *   isPlaying={autoPlaying}
 * />
 * ```
 */
export const TraversalOverlay: React.FC<TraversalOverlayProps> = ({
  isTraversing,
  currentStepIndex,
  traversalSteps,
  onTogglePlayback,
  onStepForward,
  onStepBackward,
  onRestartTraversal,
  isPlaying,
  selectedOperation: _selectedOperation, // Prefixed with _ to indicate intentionally unused
  treeType: _treeType, // Prefixed with _ to indicate intentionally unused for future extensibility
}) => {
  // Early return if not currently traversing or no valid step
  if (!isTraversing || currentStepIndex < 0 || !traversalSteps[currentStepIndex]) {
    return null;
  }

  const currentStep = traversalSteps[currentStepIndex];

  return (
    <div className="absolute bottom-6 right-6 bg-black/30 backdrop-blur-sm text-white rounded-lg text-sm pointer-events-auto">
      {/* Step Information Panel */}
      <div className="px-4 py-3 border-b border-white/20">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">
            {typeof currentStep.operation === 'string' 
              ? currentStep.operation.charAt(0).toUpperCase() + currentStep.operation.slice(1)
              : currentStep.operation} Operation
          </span>
          <span className="text-xs opacity-75">
            Step {currentStepIndex + 1} of {traversalSteps.length}
          </span>
        </div>
        <div className="text-base">
          {currentStep.metadata.description}
        </div>
        {currentStep.metadata.searchValue !== undefined && (
          <div className="text-xs opacity-75 mt-1">
            Target: {currentStep.metadata.searchValue}
          </div>
        )}
        {_treeType && (
          <div className="text-xs opacity-75 mt-1">
            Tree: {_treeType.name}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="px-4 py-3 flex items-center gap-2">
        <button
          onClick={onTogglePlayback}
          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={onStepBackward}
          disabled={currentStepIndex <= 0}
          className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          ←
        </button>
        <button
          onClick={onStepForward}
          disabled={currentStepIndex >= traversalSteps.length - 1}
          className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          →
        </button>
        <button
          onClick={onRestartTraversal}
          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm transition-colors"
        >
          Restart
        </button>
      </div>

      {/* Debug Panel (Development Mode Only) */}
      <DebugPanel 
        currentStep={currentStep} 
        currentStepIndex={currentStepIndex} 
        traversalSteps={traversalSteps} 
        selectedOperation={_selectedOperation} 
        treeType={_treeType} 
      />
    </div>
  );
};
