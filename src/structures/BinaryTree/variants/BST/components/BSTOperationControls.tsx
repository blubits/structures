import { useCallback, useState } from "react";
import { ChevronDown, ChevronRight, Bug } from "lucide-react";
import { 
  MdSkipPrevious, 
  MdSkipNext, 
  MdPlayArrow, 
  MdPause, 
  MdReplay,
  MdSpeed
} from "react-icons/md";
import { useBST } from "@/structures/BinaryTree/variants/BST/BSTProvider";
import type { BinaryTree } from "@/structures/BinaryTree/types";
import { countNodes, normalizeBinaryTree } from "@/structures/BinaryTree/types";

interface BSTOperationControlsProps {
  currentState: BinaryTree;
  isPlaying: boolean;
  onPlayPause: () => void;
  animationSpeed: 'slow' | 'normal' | 'fast';
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
}

/**
 * Enhanced BST-specific operation controls with media player-like interface
 * 
 * Features:
 * - Media player-style controls with react-icons
 * - Emphasized current step information
 * - Deemphasized operation details
 * - Clean, intuitive interface
 * - Optional debug layer for development
 */
export function BSTOperationControls({
  isPlaying,
  onPlayPause,
  animationSpeed,
  onSpeedChange
}: BSTOperationControlsProps) {
  const { historyController } = useBST();

  // Debug layer state
  const [showDebugLayer, setShowDebugLayer] = useState(false);

  // Step navigation handlers
  const handleStepForward = useCallback(() => {
    historyController.stepForward();
  }, [historyController]);

  const handleStepBackward = useCallback(() => {
    historyController.stepBackward();
  }, [historyController]);

  const handleRestart = useCallback(() => {
    // Start stepping through the current operation from the beginning
    historyController.startSteppingThroughCurrentOperation();
  }, [historyController]);

  // Get current operation info
  const currentAnimationIndex = historyController.getCurrentAnimationIndex();
  const isAnimating = historyController.isAnimating();
  
  // Availability checks
  const canStepForward = historyController.canStepForward();
  const canStepBackward = historyController.canStepBackward();

  // Get current operation details
  const currentOperationIndex = historyController.getCurrentOperationIndex();
  const history = historyController.getHistory();
  const currentOperation = currentOperationIndex >= 0 && currentOperationIndex < history.length 
    ? history[currentOperationIndex].operation 
    : null;
  const currentOperationStates = currentOperationIndex >= 0 && currentOperationIndex < history.length 
    ? history[currentOperationIndex].states 
    : [];
  
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
      <div className="bg-black/90 backdrop-blur-sm text-white rounded-xl shadow-xl pointer-events-auto min-w-[500px] max-w-[700px]">
        {/* Current Step Information - Emphasized */}
        <div className="px-6 py-4">
          <div className="flex items-start justify-between mb-3">
            <div className="text-lg font-bold text-white text-left">
              {currentStepTitle}
            </div>
            <div className="text-right">
              <div className="text-sm opacity-75 mb-1">
                {operationTitle}
              </div>
              <div className="text-xs opacity-60">
                Step {currentStepNumber} of {totalSteps}
              </div>
            </div>
          </div>
        </div>

        {/* Media Player Controls */}
        <div className="px-6 py-4 flex items-center justify-center gap-4 border-t border-white/20">
          {/* Previous Step */}
          <button
            onClick={handleStepBackward}
            disabled={!canStepBackward}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            title="Previous Step"
          >
            <MdSkipPrevious size={24} />
          </button>
          
          {/* Play/Pause */}
          <button
            onClick={onPlayPause}
            className="p-4 rounded-full bg-white hover:bg-white/90 text-black transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            title={isPlaying ? "Pause Playback" : "Start Playback"}
          >
            {isPlaying ? <MdPause size={32} /> : <MdPlayArrow size={32} />}
          </button>
          
          {/* Next Step */}
          <button
            onClick={handleStepForward}
            disabled={!canStepForward}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            title="Next Step"
          >
            <MdSkipNext size={24} />
          </button>
          
          {/* Restart */}
          <button
            onClick={handleRestart}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 hover:scale-105 active:scale-95 ml-4"
            title="Restart Operation"
          >
            <MdReplay size={20} />
          </button>

          {/* Speed Control */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/20">
            <MdSpeed size={16} className="opacity-75" />
            <select
              value={animationSpeed}
              onChange={(e) => onSpeedChange(e.target.value as 'slow' | 'normal' | 'fast')}
              className="px-3 py-1 bg-white/20 border border-white/20 rounded-full text-sm text-white backdrop-blur-sm"
            >
              <option value="slow" className="text-black">Slow</option>
              <option value="normal" className="text-black">Normal</option>
              <option value="fast" className="text-black">Fast</option>
            </select>
          </div>

          {/* Debug Toggle */}
          {import.meta.env.DEV && (
            <button
              onClick={() => setShowDebugLayer(!showDebugLayer)}
              className={`p-2 rounded-full transition-all duration-200 ml-2 ${
                showDebugLayer 
                  ? 'bg-blue-500 hover:bg-blue-400' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Toggle Debug Layer"
            >
              <Bug size={16} />
            </button>
          )}
        </div>

        {/* Debug Layer */}
        {showDebugLayer && import.meta.env.DEV && (
          <div className="border-t border-white/20 bg-black/60 rounded-b-xl">
            {/* Debug Header */}
            <div className="px-6 py-3 flex items-center gap-2">
              {showDebugLayer ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="text-sm font-medium opacity-75">Debug Information</span>
            </div>

            {/* Debug Content */}
            <div className="px-6 pb-4 space-y-4 text-xs">
              {/* Current Step Details */}
              <div>
                <div className="font-medium mb-2 text-yellow-400">Current Step Details:</div>
                <div className="bg-black/40 rounded-lg p-3 font-mono space-y-1">
                  <div>Operation Index: {historyController.getCurrentOperationIndex()}</div>
                  <div>Animation Index: {currentAnimationIndex}</div>
                  <div>Is Animating: {isAnimating ? 'Yes' : 'No'}</div>
                  <div>Can Step Forward: {canStepForward ? 'Yes' : 'No'}</div>
                  <div>Can Step Backward: {canStepBackward ? 'Yes' : 'No'}</div>
                </div>
              </div>

              {/* Current State Animation Hints */}
              {currentOperationStates.length > 0 && currentAnimationIndex >= 0 && (
                <div>
                  <div className="font-medium mb-2 text-blue-400">Animation Hints for Current Step:</div>
                  <div className="bg-black/40 rounded-lg p-3 font-mono">
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
                <div className="font-medium mb-2 text-green-400">State Transition:</div>
                <div className="bg-black/40 rounded-lg p-3 font-mono">
                  {currentOperationStates.length > 0 && currentAnimationIndex >= 0 ? (
                    <>
                      <div>Current State: {currentOperationStates[currentAnimationIndex]?.name || 'Unnamed'}</div>
                      <div>Node Count: {countNodes(normalizeBinaryTree(currentOperationStates[currentAnimationIndex]).root) || 0}</div>
                      {currentAnimationIndex > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <div className="text-gray-400">Previous: {currentOperationStates[currentAnimationIndex - 1]?.name || 'Unnamed'}</div>
                        </div>
                      )}
                      {currentAnimationIndex < currentOperationStates.length - 1 && (
                        <div className="mt-2 pt-2 border-t border-white/10">
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
                <div className="font-medium mb-2 text-purple-400">Operation Sequence:</div>
                <div className="bg-black/40 rounded-lg p-3 font-mono max-h-32 overflow-y-auto">
                  {currentOperationStates.map((state: any, index: number) => (
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
