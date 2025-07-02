import { useCallback, useState } from "react";
import { ChevronDown, ChevronRight, Bug } from "lucide-react";
import type { BSTOperationController } from "../BSTOperationController";
import type { BinaryTree } from "../../types";

interface BSTOperationControlsProps {
  controller: BSTOperationController;
  currentState: BinaryTree;
  isPlaying: boolean;
  onPlayPause: () => void;
  animationSpeed: 'slow' | 'normal' | 'fast';
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
}

/**
 * Enhanced BST-specific operation controls following operation-controls.tsx design
 * 
 * Phase 1.2 fixes implemented:
 * - Hide when no active operations occurring
 * - Display step counter "Step X of Y"
 * - Follow operation-controls.tsx design patterns
 * - Improved visibility and behavior
 * 
 * Phase 2.2 enhancements:
 * - Optional debug layer toggle
 * - Display triggered animations for current step
 * - Show animation hints and sequence information
 * - Debug information about current state transitions
 */
export function BSTOperationControls({
  controller,
  isPlaying,
  onPlayPause,
  animationSpeed,
  onSpeedChange
}: BSTOperationControlsProps) {

  // Debug layer state
  const [showDebugLayer, setShowDebugLayer] = useState(false);

  // Step navigation handlers
  const handleStepForward = useCallback(() => {
    controller.stepForward();
  }, [controller]);

  const handleStepBackward = useCallback(() => {
    controller.stepBackward();
  }, [controller]);

  const handleRestart = useCallback(() => {
    // Start stepping through the current operation from the beginning
    const currentOperation = controller.getCurrentOperation();
    if (currentOperation) {
      // Execute the same operation again with stepping
      if (currentOperation.type === 'insert' && currentOperation.params?.value !== undefined) {
        controller.insertWithStepping(currentOperation.params.value as number);
      } else if (currentOperation.type === 'search' && currentOperation.params?.value !== undefined) {
        controller.searchWithStepping(currentOperation.params.value as number);
      } else if (currentOperation.type === 'findMin') {
        controller.findMinWithStepping();
      } else if (currentOperation.type === 'findMax') {
        controller.findMaxWithStepping();
      }
    }
  }, [controller]);

  // Get current operation info
  const currentAnimationIndex = controller.getCurrentAnimationIndex();
  const isAnimating = controller.isAnimating();
  
  // Availability checks
  const canStepForward = controller.canStepForward();
  const canStepBackward = controller.canStepBackward();

  // Get current operation details
  const currentOperation = controller.getCurrentOperation();
  const currentOperationStates = controller.getCurrentOperationStates();
  
  // Don't render if no active operation or we haven't started stepping through states
  const hasStartedStepping = currentAnimationIndex >= 0;
  if (!hasStartedStepping || !currentOperation || currentOperationStates.length === 0) {
    return null;
  }

  // Calculate step information
  const currentStepNumber = Math.max(0, currentAnimationIndex + 1);
  const totalSteps = currentOperationStates.length;
  const operationTitle = currentOperation.description || `${currentOperation.type} Operation`;
  const currentStepTitle = currentOperationStates[currentAnimationIndex]?.name || `Step ${currentStepNumber}`;

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-black/80 backdrop-blur-sm text-white rounded-lg text-sm pointer-events-auto min-w-[400px] max-w-[600px]">
        {/* Step Information Panel */}
        <div className="px-4 py-3 border-b border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-base">
              {operationTitle}
            </span>
            <span className="text-xs opacity-75">
              Step {currentStepNumber} of {totalSteps}
            </span>
          </div>
          
          {/* Display current step title */}
          <div className="text-sm mb-2">
            {currentStepTitle}
          </div>
          
          {/* Display operation value if available */}
          {currentOperation.params?.value !== undefined && (
            <div className="text-xs opacity-75">
              Value: {currentOperation.params.value}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="px-4 py-3 flex items-center justify-center gap-3">
          <button
            onClick={handleStepBackward}
            disabled={!canStepBackward}
            className="p-2 rounded-md bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous Step"
          >
            ⏮️
          </button>
          
          <button
            onClick={onPlayPause}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md transition-colors font-medium"
            title={isPlaying ? "Pause Playback" : "Start Playback"}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          
          <button
            onClick={handleStepForward}
            disabled={!canStepForward}
            className="p-2 rounded-md bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next Step"
          >
            ⏭️
          </button>
          
          <button
            onClick={handleRestart}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-md transition-colors text-sm"
            title="Restart Operation"
          >
            🔄 Restart
          </button>

          {/* Speed control */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
            <span className="text-xs opacity-75">Speed:</span>
            <select
              value={animationSpeed}
              onChange={(e) => onSpeedChange(e.target.value as 'slow' | 'normal' | 'fast')}
              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white"
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>

          {/* Debug layer toggle */}
          {import.meta.env.DEV && (
            <button
              onClick={() => setShowDebugLayer(!showDebugLayer)}
              className={`p-2 rounded-md transition-colors ml-2 ${
                showDebugLayer 
                  ? 'bg-blue-600 hover:bg-blue-500' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              title="Toggle Debug Layer"
            >
              <Bug size={16} />
            </button>
          )}
        </div>

        {/* Debug Layer */}
        {showDebugLayer && import.meta.env.DEV && (
          <div className="border-t border-white/20 bg-black/60">
            {/* Debug Header */}
            <div className="px-4 py-2 flex items-center gap-2">
              {showDebugLayer ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="text-xs font-medium opacity-75">Debug Information</span>
            </div>

            {/* Debug Content */}
            <div className="px-4 pb-3 space-y-3 text-xs">
              {/* Current Step Details */}
              <div>
                <div className="font-medium mb-1 text-yellow-400">Current Step Details:</div>
                <div className="bg-black/40 rounded p-2 font-mono">
                  <div>Operation Index: {controller.getCurrentOperationIndex()}</div>
                  <div>Animation Index: {currentAnimationIndex}</div>
                  <div>Is Animating: {isAnimating ? 'Yes' : 'No'}</div>
                  <div>Can Step Forward: {canStepForward ? 'Yes' : 'No'}</div>
                  <div>Can Step Backward: {canStepBackward ? 'Yes' : 'No'}</div>
                </div>
              </div>

              {/* Current State Animation Hints */}
              {currentOperationStates.length > 0 && currentAnimationIndex >= 0 && (
                <div>
                  <div className="font-medium mb-1 text-blue-400">Animation Hints for Current Step:</div>
                  <div className="bg-black/40 rounded p-2 font-mono">
                    {(() => {
                      const currentStepState = currentOperationStates[currentAnimationIndex];
                      if (currentStepState?.animationHints && currentStepState.animationHints.length > 0) {
                        return currentStepState.animationHints.map((hint: any, index: number) => (
                          <div key={index} className="mb-1">
                            <span className="text-green-400">{hint.type}</span>
                            {hint.metadata && (
                              <div className="ml-2 text-gray-400 text-xs">
                                {JSON.stringify(hint.metadata, null, 2)}
                              </div>
                            )}
                            {hint.duration && <span className="text-purple-400"> (duration: {hint.duration}ms)</span>}
                            {hint.delay && <span className="text-orange-400"> (delay: {hint.delay}ms)</span>}
                            {hint.sequence !== undefined && <span className="text-cyan-400"> (seq: {hint.sequence})</span>}
                          </div>
                        ));
                      } else {
                        return <div className="text-gray-500 italic">No animation hints for this step</div>;
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* State Transition Information */}
              <div>
                <div className="font-medium mb-1 text-green-400">State Transition:</div>
                <div className="bg-black/40 rounded p-2 font-mono">
                  {currentOperationStates.length > 0 && currentAnimationIndex >= 0 ? (
                    <>
                      <div>Current State: {currentOperationStates[currentAnimationIndex]?.name || 'Unnamed'}</div>
                      <div>Node Count: {currentOperationStates[currentAnimationIndex]?.nodeCount || 0}</div>
                      {currentAnimationIndex > 0 && (
                        <div className="mt-1 pt-1 border-t border-white/10">
                          <div className="text-gray-400">Previous: {currentOperationStates[currentAnimationIndex - 1]?.name || 'Unnamed'}</div>
                        </div>
                      )}
                      {currentAnimationIndex < currentOperationStates.length - 1 && (
                        <div className="mt-1 pt-1 border-t border-white/10">
                          <div className="text-gray-400">Next: {currentOperationStates[currentAnimationIndex + 1]?.name || 'Unnamed'}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-500 italic">No state transition information</div>
                  )}
                </div>
              </div>

              {/* Operation Sequence */}
              <div>
                <div className="font-medium mb-1 text-purple-400">Operation Sequence:</div>
                <div className="bg-black/40 rounded p-2 font-mono max-h-32 overflow-y-auto">
                  {currentOperationStates.map((state, index) => (
                    <div 
                      key={index} 
                      className={`text-xs mb-1 ${
                        index === currentAnimationIndex 
                          ? 'text-yellow-300 font-bold' 
                          : index < currentAnimationIndex 
                            ? 'text-green-300' 
                            : 'text-gray-400'
                      }`}
                    >
                      {index + 1}. {state.name || `Step ${index + 1}`}
                      {index === currentAnimationIndex && ' ← CURRENT'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
