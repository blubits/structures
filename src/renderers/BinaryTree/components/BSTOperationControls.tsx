import { useCallback } from "react";
import type { BSTOperationController } from "../BSTOperationController";
import type { BinaryTree } from "../types";

interface BSTOperationControlsProps {
  controller: BSTOperationController;
  currentState: BinaryTree;
  isPlaying: boolean;
  onPlayPause: () => void;
  animationSpeed: 'slow' | 'normal' | 'fast';
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
}

/**
 * Simplified BST-specific operation controls
 * TODO: Integrate with full OperationControls in Phase 5
 */
export function BSTOperationControls({
  controller,
  isPlaying,
  onPlayPause,
  animationSpeed,
  onSpeedChange
}: BSTOperationControlsProps) {

  // Step navigation handlers
  const handleStepForward = useCallback(() => {
    controller.stepForward();
  }, [controller]);

  const handleStepBackward = useCallback(() => {
    controller.stepBackward();
  }, [controller]);

  // Availability checks
  const canStepForward = controller.canStepForward();
  const canStepBackward = controller.canStepBackward();
  const isAnimating = controller.isAnimating();

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-4">
          {/* Step controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStepBackward}
              disabled={!canStepBackward}
              className="px-3 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Step Back
            </button>
            
            <button
              onClick={onPlayPause}
              disabled={!isAnimating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            
            <button
              onClick={handleStepForward}
              disabled={!canStepForward}
              className="px-3 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Step Forward →
            </button>
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground">Speed:</span>
            <select
              value={animationSpeed}
              onChange={(e) => onSpeedChange(e.target.value as 'slow' | 'normal' | 'fast')}
              className="px-2 py-1 bg-background border border-border rounded text-sm"
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
