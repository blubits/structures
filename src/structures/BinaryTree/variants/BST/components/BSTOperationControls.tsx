import { useCallback, useState } from "react";
import { useBST } from "@/structures/BinaryTree/variants/BST/BSTProvider";
import type { BinaryTree } from "@/structures/BinaryTree/types";
import { countNodes, normalizeBinaryTree } from "@/structures/BinaryTree/types";
import { OperationControls, type OperationStep } from "@/components/OperationControls";

interface BSTOperationControlsProps {
  currentState: BinaryTree;
  isPlaying: boolean;
  onPlayPause: () => void;
  animationSpeed: 'slow' | 'normal' | 'fast';
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
}

export function BSTOperationControls({
  isPlaying,
  onPlayPause,
  animationSpeed,
  onSpeedChange
}: BSTOperationControlsProps) {
  const { historyController } = useBST();
  const [showDebugLayer, setShowDebugLayer] = useState(false);

  // Step navigation handlers
  const handleStepForward = useCallback(() => {
    historyController.stepForward();
  }, [historyController]);

  const handleStepBackward = useCallback(() => {
    historyController.stepBackward();
  }, [historyController]);

  const handleRestart = useCallback(() => {
    historyController.startSteppingThroughCurrentOperation();
  }, [historyController]);

  // Get current operation info
  const currentAnimationIndex = historyController.getCurrentAnimationIndex();
  const isAnimating = historyController.isAnimating();
  const canStepForward = historyController.canStepForward();
  const canStepBackward = historyController.canStepBackward();
  const currentOperationIndex = historyController.getCurrentOperationIndex();
  const history = historyController.getHistory();
  const currentOperation = currentOperationIndex >= 0 && currentOperationIndex < history.length 
    ? history[currentOperationIndex].operation 
    : null;
  const currentOperationStates = currentOperationIndex >= 0 && currentOperationIndex < history.length 
    ? history[currentOperationIndex].states 
    : [];

  // Calculate step information
  let operationTitle = '';
  if (currentOperation) {
    operationTitle = currentOperation.description || `${currentOperation.type} Operation`;
  }

  // Don't render if no active operation or we haven't started stepping through states
  const hasStartedStepping = currentAnimationIndex >= 0;
  if (!hasStartedStepping || !currentOperation || currentOperationStates.length === 0) {
    return null;
  }

  // BST-specific debug content
  const debugContent = (
    <div className="space-y-4 text-xs">
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
  );

  return (
    <OperationControls
      isActive={true}
      currentStepIndex={currentAnimationIndex}
      operationSteps={currentOperationStates as unknown as OperationStep[]}
      currentOperation={currentOperation}
      onTogglePlayback={onPlayPause}
      onStepForward={handleStepForward}
      onStepBackward={handleStepBackward}
      onRestartOperation={handleRestart}
      isPlaying={isPlaying}
      operationTitle={operationTitle}
      showSpeedControl={true}
      animationSpeed={animationSpeed}
      onSpeedChange={onSpeedChange}
      showDebugToggle={import.meta.env.DEV}
      debugVisible={showDebugLayer}
      onToggleDebug={() => setShowDebugLayer(v => !v)}
      debugContent={debugContent}
    />
  );
}
