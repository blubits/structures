import { useCallback } from "react";
import { useBST } from "@/structures/BinaryTree/variants/BST/BSTProvider";
import { OperationControls, type OperationStep } from "@/components/OperationControls";

interface BSTOperationControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  animationSpeed: 'slow' | 'normal' | 'fast';
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
}

/**
 * Operation controls for BST visualizations, providing step navigation and playback controls.
 */
export function BSTOperationControls({
  isPlaying,
  onPlayPause,
  animationSpeed,
  onSpeedChange
}: BSTOperationControlsProps) {
  const { historyController } = useBST();

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
      operationTitle={currentOperation.description || `${currentOperation.type} Operation`}
      showSpeedControl={true}
      animationSpeed={animationSpeed}
      onSpeedChange={onSpeedChange}
    />
  );
}
