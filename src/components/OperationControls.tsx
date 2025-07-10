import { useState } from 'react';
import { FaStepBackward, FaStepForward, FaPlay, FaPause, FaRedo, FaTachometerAlt } from 'react-icons/fa';

/**
 * A reusable overlay component for controlling step-by-step operations in any visualization system,
 * providing controls and descriptions for any type of operation. This component is visualization-agnostic
 * and can be used with BST, sorting algorithms, graph algorithms, or any other step-by-step process.
 */

/**
 * Generic interface for any operation that can be visualized step-by-step.
 */
export interface Operation {
  /** Unique identifier for the operation */
  id?: string;
  /** Type/name of the operation (e.g., 'insert', 'search', 'sort') */
  type: string;
  /** Human-readable description of the operation */
  description: string;
  /** Optional value being operated on */
  value?: number | string;
  /** Additional metadata for the operation */
  [key: string]: any;
}

/**
 * Generic interface for a step in any operation sequence.
 */
export interface OperationStep {
  /** Unique identifier for this step */
  id?: string;
  /** Human-readable description of what's happening in this step */
  description?: string;
  /** The operation being performed */
  operation?: string;
  /** Whether this is the final step */
  isComplete?: boolean;
  /** Additional metadata for the step */
  [key: string]: any;
}

/**
 * Function type for generating step descriptions based on operation type and context.
 */
export type StepDescriptionGenerator<TOperation extends Operation = Operation, TStep extends OperationStep = OperationStep> = (
  operation: TOperation,
  currentStep: TStep | undefined,
  stepIndex: number,
  totalSteps: number
) => string;

interface OperationControlsProps<TOperation extends Operation = Operation, TStep extends OperationStep = OperationStep> {
  /** Whether an operation is currently being visualized */
  isActive: boolean;
  /** Current step index in the operation sequence */
  currentStepIndex: number;
  /** All steps for the current operation */
  operationSteps?: TStep[];
  /** The current operation being visualized */
  currentOperation?: TOperation;
  /** Function to generate step descriptions */
  stepDescriptionGenerator?: StepDescriptionGenerator<TOperation, TStep>;
  /** Callback to toggle automatic playback of steps */
  onTogglePlayback?: () => void;
  /** Callback to manually advance to next step */
  onStepForward?: () => void;
  /** Callback to manually go back to previous step */
  onStepBackward?: () => void;
  /** Callback to restart operation from the first step */
  onRestartOperation?: () => void;
  /** Whether automatic playback is currently active */
  isPlaying?: boolean;
  /** Optional custom title for the operation */
  operationTitle?: string;
  /** Optional additional metadata to display */
  additionalInfo?: Record<string, any>;
  /** Optional custom class names for styling */
  className?: string;
  // === BST-specific and optional props ===
  /** Show speed control dropdown/buttons */
  showSpeedControl?: boolean;
  /** Current animation speed (0.25–2, 1 = normal) */
  animationSpeed?: number;
  /** Callback for speed change */
  onSpeedChange?: (speed: number) => void;
}

/**
 * OperationControls Component: Displays an overlay during operation visualization with operation name,
 * step progress, detailed step description, manual navigation controls, and play/pause functionality.
 * The overlay appears when an operation is selected and is customizable through props.
 */
export const OperationControls = <TOperation extends Operation = Operation, TStep extends OperationStep = OperationStep>({
  isActive,
  currentStepIndex,
  operationSteps = [],
  currentOperation,
  stepDescriptionGenerator,
  onTogglePlayback,
  onStepForward,
  onStepBackward,
  onRestartOperation,
  isPlaying = false,
  operationTitle,
  additionalInfo,
  className = "",
  // BST-specific and optional props
  showSpeedControl = false,
  animationSpeed = 1,
  onSpeedChange,
}: OperationControlsProps<TOperation, TStep>) => {
  // Don't render if not active or no steps available
  if (!isActive || !currentOperation || operationSteps.length === 0) {
    return null;
  }

  const [speedOpen, setSpeedOpen] = useState(false);

  const currentStep = operationSteps[Math.max(0, Math.min(currentStepIndex, operationSteps.length - 1))];
  const isFirstStep = currentStepIndex <= 0;
  const isLastStep = currentStepIndex >= operationSteps.length - 1;

  // Emphasize the step title (current state's name)
  const stepTitle = currentStep?.name || '';

  // Use custom title or generate from operation type
  const displayTitle = operationTitle || 
    (currentOperation.type.charAt(0).toUpperCase() + currentOperation.type.slice(1) + ' Operation');

  // Speed slider pop-out
  const speedOptions = [
    { label: '0.25x', value: 0.25 },
    { label: '0.5x', value: 0.5 },
    { label: '0.75x', value: 0.75 },
    { label: '1x', value: 1 },
    { label: '1.25x', value: 1.25 },
    { label: '1.5x', value: 1.5 },
    { label: '1.75x', value: 1.75 },
    { label: '2x', value: 2 },
  ];

  // Generate step description using the provided generator
  const stepDescription = stepDescriptionGenerator
    ? stepDescriptionGenerator(currentOperation, currentStep, currentStepIndex, operationSteps.length)
    : '';

  return (
    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 ${className}`} style={{ minWidth: 420, maxWidth: 640 }}>
      <div className="bg-black/80 backdrop-blur-md text-white rounded-xl shadow-lg px-6 py-5 flex flex-col gap-2 pointer-events-auto">
        {/* Step Title, Operation Title, and Step Position */}
        <div className="flex items-start justify-between mb-1 w-full">
          <div className="flex flex-col">
            <div className="text-xl font-bold tracking-tight mb-0 text-left">{stepTitle}</div>
            <div className="text-xs opacity-70 font-medium text-left mt-1">{displayTitle}</div>
          </div>
          <div className="text-xs opacity-70 font-medium self-start text-right whitespace-nowrap mt-1">
            Step {currentStepIndex + 1} of {operationSteps.length}
          </div>
        </div>
        {/* Step Description */}
        <div className="text-center text-sm mb-2 opacity-90">{stepDescription}</div>
        {/* Media Player Controls */}
        <div className="flex items-center justify-center gap-4 mt-1">
          <button
            onClick={onStepBackward}
            disabled={isFirstStep}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            title="Previous Step"
          >
            <span className="p-1"><FaStepBackward size={22} /></span>
          </button>
          <button
            onClick={onTogglePlayback}
            className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors shadow-md flex items-center justify-center"
            title={isPlaying ? "Pause Playback" : "Start Playback"}
          >
            <span className="p-1">{isPlaying ? <FaPause size={28} /> : <FaPlay size={28} />}</span>
          </button>
          <button
            onClick={onStepForward}
            disabled={isLastStep}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            title="Next Step"
          >
            <span className="p-1"><FaStepForward size={22} /></span>
          </button>
          <button
            onClick={onRestartOperation}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors flex items-center justify-center"
            title="Restart Operation"
          >
            <span className="p-1"><FaRedo size={20} /></span>
          </button>
          {/* Speed Control Pop-out */}
          {showSpeedControl && (
            <div className="relative">
              <button
                onClick={() => setSpeedOpen((v) => !v)}
                className={`p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors ml-2 flex items-center justify-center ${speedOpen ? 'ring-2 ring-blue-400' : ''}`}
                title="Change Speed"
              >
                <span className="p-1"><FaTachometerAlt size={20} /></span>
              </button>
              {speedOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-12 bg-gray-900 border border-gray-700 rounded-lg shadow-lg px-4 py-3 flex flex-col gap-2 z-40 min-w-[140px]">
                  <div className="text-xs text-gray-300 mb-1">Animation Speed</div>
                  {speedOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { onSpeedChange?.(opt.value); setSpeedOpen(false); }}
                      className={`w-full px-2 py-1 rounded-md text-left transition-all ${animationSpeed === opt.value ? 'bg-blue-600 text-white font-bold' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Additional Info */}
        {additionalInfo && Object.keys(additionalInfo).length > 0 && (
          <div className="text-xs opacity-75 mt-1 text-center">
            {Object.entries(additionalInfo).map(([key, value]) => (
              <span key={key} className="inline-block mx-2">
                {key}: {String(value)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Default export for convenience
export default OperationControls;
