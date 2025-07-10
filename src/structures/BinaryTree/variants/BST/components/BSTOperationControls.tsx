import { useCallback } from "react";
import { useBST } from "@structures/BinaryTree/variants/BST";
import { OperationControls, type OperationStep } from "@components/OperationControls";

interface BSTOperationControlsProps {
  animationSpeed: 'slow' | 'normal' | 'fast';
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
}

/**
 * Operation controls for BST visualizations, providing step navigation and playback controls.
 */
export function BSTOperationControls({
  animationSpeed,
  onSpeedChange
}: BSTOperationControlsProps) {
  const { historyController, isPlaying, setIsPlaying } = useBST();

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

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

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
      onTogglePlayback={handlePlayPause}
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
