/**
 * Generic Operation Controls Overlay
 * 
 * A reusable overlay component for controlling step-by-step operations
 * in any visualization system. Provides step-by-step operation controls
 * and detailed descriptions for any type of operation.
 * 
 * This component is visualization-agnostic and can be used with BST, 
 * sorting algorithms, graph algorithms, or any other step-by-step process.
 */


/**
 * Generic interface for any operation that can be visualized step-by-step
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
 * Generic interface for a step in any operation sequence
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
 * Function type for generating step descriptions
 * Allows customization of step descriptions based on operation type and context
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
}

/**
 * Default step description generator
 * Provides basic descriptions when no custom generator is provided
 */
const defaultStepDescriptionGenerator: StepDescriptionGenerator = (
  operation,
  currentStep,
  stepIndex,
  totalSteps
) => {
  if (currentStep?.description) {
    return currentStep.description;
  }

  const stepNumber = stepIndex + 1;
  
  if (stepNumber === 1) {
    return `Starting ${operation.type} operation${operation.value !== undefined ? ` with value ${operation.value}` : ''}.`;
  } else if (stepNumber === totalSteps) {
    return `Completed ${operation.type} operation.`;
  } else {
    return `Executing step ${stepNumber} of ${operation.type} operation.`;
  }
};

/**
 * OperationControls Component
 * 
 * Displays a semi-transparent overlay during operation visualization that shows:
 * - Current operation name and description
 * - Step progress (current step / total steps)
 * - Current step's detailed description and context
 * - Manual navigation controls for stepping through the operation
 * - Play/pause automatic playback functionality
 * 
 * The overlay automatically appears when an operation is selected and hides when not needed.
 * It's positioned in the bottom-center and can be customized through props.
 */
export const OperationControls = <TOperation extends Operation = Operation, TStep extends OperationStep = OperationStep>({
  isActive,
  currentStepIndex,
  operationSteps = [],
  currentOperation,
  stepDescriptionGenerator = defaultStepDescriptionGenerator,
  onTogglePlayback,
  onStepForward,
  onStepBackward,
  onRestartOperation,
  isPlaying = false,
  operationTitle,
  additionalInfo,
  className = "",
}: OperationControlsProps<TOperation, TStep>) => {
  // Don't render if not active or no steps available
  if (!isActive || !currentOperation || operationSteps.length === 0) {
    return null;
  }

  const currentStep = operationSteps[Math.max(0, Math.min(currentStepIndex, operationSteps.length - 1))];
  const isFirstStep = currentStepIndex <= 0;
  const isLastStep = currentStepIndex >= operationSteps.length - 1;

  // Generate step description using the provided generator
  const stepDescription = stepDescriptionGenerator(
    currentOperation,
    currentStep,
    currentStepIndex,
    operationSteps.length
  );

  // Use custom title or generate from operation type
  const displayTitle = operationTitle || 
    (currentOperation.type.charAt(0).toUpperCase() + currentOperation.type.slice(1) + ' Operation');

  return (
    <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 ${className}`}>
      <div className="bg-black/80 backdrop-blur-sm text-white rounded-lg text-sm pointer-events-auto min-w-[400px] max-w-[600px]">
        {/* Step Information Panel */}
        <div className="px-4 py-3 border-b border-white/20">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-base">
              {displayTitle}
            </span>
            <span className="text-xs opacity-75">
              Step {currentStepIndex + 1} of {operationSteps.length}
            </span>
          </div>
          
          <div className="text-sm mb-2">
            {stepDescription}
          </div>
          
          {/* Display operation value if available */}
          {currentOperation.value !== undefined && (
            <div className="text-xs opacity-75">
              Target: {currentOperation.value}
            </div>
          )}
          
          {/* Display current step operation if available */}
          {currentStep?.operation && (
            <div className="text-xs opacity-75 mt-1 italic">
              Operation: {currentStep.operation}
            </div>
          )}

          {/* Display additional info if provided */}
          {additionalInfo && Object.keys(additionalInfo).length > 0 && (
            <div className="text-xs opacity-75 mt-1">
              {Object.entries(additionalInfo).map(([key, value]) => (
                <div key={key}>
                  {key}: {String(value)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="px-4 py-3 flex items-center justify-center gap-3">
          <button
            onClick={onStepBackward}
            disabled={isFirstStep}
            className="p-2 rounded-md bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous Step"
          >
            ⏮️
          </button>
          
          <button
            onClick={onTogglePlayback}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md transition-colors font-medium"
            title={isPlaying ? "Pause Playback" : "Start Playback"}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          
          <button
            onClick={onStepForward}
            disabled={isLastStep}
            className="p-2 rounded-md bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next Step"
          >
            ⏭️
          </button>
          
          <button
            onClick={onRestartOperation}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-md transition-colors text-sm"
            title="Restart Operation"
          >
            🔄 Restart
          </button>
        </div>
      </div>
    </div>
  );
};

// Default export for convenience
export default OperationControls;
