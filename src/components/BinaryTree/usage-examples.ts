/**
 * Example usage of the refactored binary tree rendering system
 * 
 * This file demonstrates how the new visual state approach separates
 * rendering concerns from step navigation logic, making the system
 * more maintainable and extensible.
 */

import { 
  renderBinaryTree,
  HistoryControllerStateComputer,
  type BinaryTreeVisualState,
  type BinaryTreeNode
} from './index';
import { HistoryController } from '../../lib/HistoryController';

// Example tree data
const sampleTree: BinaryTreeNode = {
  value: 10,
  left: {
    value: 5,
    left: { value: 2, left: null, right: null },
    right: { value: 7, left: null, right: null }
  },
  right: {
    value: 15,
    left: { value: 12, left: null, right: null },
    right: { value: 20, left: null, right: null }
  }
};

// =============================================================================
// APPROACH 1: Using HistoryController (Recommended)
// =============================================================================

/**
 * Example using HistoryController for step-by-step visualization
 * This is the recommended approach for algorithm visualization
 */
export function renderWithHistoryController(
  svgRef: React.RefObject<SVGSVGElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  isInitialized: React.RefObject<boolean>
) {
  // Create a history controller
  const historyController = new HistoryController(sampleTree);
  
  // Add some operations (this would normally be done by the algorithm)
  historyController.addOperation({
    id: 'search-7',
    type: 'search',
    value: 7,
    timestamp: Date.now(),
    description: 'Searching for value 7',
    steps: [
      {
        operation: 'visit',
        metadata: {
          description: 'Start at root',
          currentNode: 10,
          visitedNode: 10
        }
      },
      {
        operation: 'traverse-left',
        metadata: {
          description: 'Go left since 7 < 10',
          currentNode: 5,
          visitedNode: 5
        }
      },
      {
        operation: 'traverse-right',
        metadata: {
          description: 'Go right since 7 > 5',
          currentNode: 7,
          visitedNode: 7
        }
      },
      {
        operation: 'found',
        metadata: {
          description: 'Found target value!',
          currentNode: 7,
          visitedNode: 7
        }
      }
    ],
    initialState: sampleTree,
    resultingState: sampleTree, // No mutation for search
    isMutation: false
  });
  
  // Create visual state computer
  const stateComputer = new HistoryControllerStateComputer(
    historyController, 
    sampleTree
  );
  
  // The controller handles all the step logic
  historyController.selectOperation(0); // Select the search operation
  historyController.stepForward(); // Step to first step
  historyController.stepForward(); // Step to second step
  
  // Compute current visual state
  const visualState = stateComputer.computeVisualState();
  
  // Render the tree with the current visual state
  renderBinaryTree({
    svgRef,
    containerRef,
    isInitialized,
    visualState,
    isDarkMode: false,
    onNodeClick: (node: BinaryTreeNode) => {
      console.log('Clicked node:', node.value);
    }
  });
  
  // The tree renderer has no knowledge of steps, operations, or history!
  // It only knows about the current visual state.
}

// =============================================================================
// APPROACH 2: Direct Visual State (Simple Cases)
// =============================================================================

/**
 * Example using direct visual state for simple highlighting
 * This is useful for static demonstrations or simple interactions
 */
export function renderWithDirectState(
  svgRef: React.RefObject<SVGSVGElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  isInitialized: React.RefObject<boolean>
) {
  // Directly create the visual state without any controllers
  const visualState: BinaryTreeVisualState = {
    data: sampleTree,
    visitedNodes: new Set([10, 5, 7]), // Nodes that have been visited
    highlightPath: [10, 5, 7], // Path to highlight
    currentNode: 7, // Currently active node
    isTraversing: true,
    animationInstructions: {
      instructions: [
        {
          type: 'node',
          nodeValue: 7,
          animation: 'pulse'
        }
      ],
      stepDirection: 'forward'
    }
  };
  
  // Render with the direct state
  renderBinaryTree({
    svgRef,
    containerRef,
    isInitialized,
    visualState,
    isDarkMode: false,
    animationSpeed: 'normal'
  });
}



// =============================================================================
// KEY BENEFITS OF THE REFACTORED APPROACH
// =============================================================================

/**
 * Benefits of the new architecture:
 * 
 * 1. **Separation of Concerns**
 *    - Renderer only cares about visual state
 *    - History/step logic isolated to controllers
 *    - Easy to test each part independently
 * 
 * 2. **Extensibility**
 *    - New state computers can be added easily
 *    - Visual state can be computed from any source
 *    - Animations are pluggable and configurable
 * 
 * 3. **Maintainability**  
 *    - Clear interfaces between components
 *    - Backward compatibility through wrapper functions
 *    - Consistent patterns across the codebase
 * 
 * 4. **Flexibility**
 *    - Can render static trees without any step logic
 *    - Can switch between different visualization approaches
 *    - Easy to add new features without breaking existing code
 * 
 * 5. **Performance**
 *    - State computation can be memoized
 *    - Renderer only updates when visual state changes
 *    - No unnecessary re-renders from step navigation
 */
