/**
 * Example usage of the refactored binary tree rendering system
 * 
 * This file demonstrates how the new visual state approach separates
 * rendering concerns from step navigation logic, making the system
 * more maintainable and extensible.
 */

import React from 'react';
import { 
  renderBinaryTree,
  HistoryControllerStateComputer,
  type BinaryTreeVisualState,
  type BinaryTreeNode
} from '../src/components/BinaryTree';
import { HistoryController } from '../src/lib/HistoryController';

// Example tree data using correct type (undefined for null children)
const sampleTree: BinaryTreeNode = {
  value: 10,
  left: {
    value: 5,
    left: { value: 2 },
    right: { value: 7 }
  },
  right: {
    value: 15,
    left: { value: 12 },
    right: { value: 20 }
  }
};

// =============================================================================
// APPROACH 1: Using HistoryController (Primary Approach)
// =============================================================================

/**
 * Example using HistoryController for step-by-step visualization
 * This is the primary approach for algorithm visualization
 */
export async function renderWithHistoryController(
  svgRef: React.RefObject<SVGSVGElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  isInitialized: React.RefObject<boolean>
) {
  // Create a history controller
  const historyController = new HistoryController(sampleTree);
  
  // Generate steps for a search operation
  const generateSearchSteps = (currentState: BinaryTreeNode, value: number) => [
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
        description: `Go left since ${value} < 10`,
        currentNode: 5,
        visitedNode: 5
      }
    },
    {
      operation: 'traverse-right',
      metadata: {
        description: `Go right since ${value} > 5`,
        currentNode: value,
        visitedNode: value
      }
    },
    {
      operation: 'found',
      metadata: {
        description: 'Found target value!',
        currentNode: value,
        visitedNode: value
      }
    }
  ];
  
  // Execute a search operation using the proper API
  await historyController.executeOperation(
    'search',
    7,
    generateSearchSteps,
    undefined, // No mutation for search operations
    'Searching for value 7'
  );
  
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
// APPROACH 3: React Component Example
// =============================================================================

/**
 * Example React component that uses the binary tree renderer
 */
export const BinaryTreeExample: React.FC = () => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isInitialized = React.useRef(false);

  React.useEffect(() => {
    // Simple static tree visualization
    const visualState: BinaryTreeVisualState = {
      data: sampleTree,
      visitedNodes: new Set([10, 5]),
      highlightPath: [10, 5],
      currentNode: 5,
      isTraversing: false,
    };

    renderBinaryTree({
      svgRef,
      containerRef,
      isInitialized,
      visualState,
      isDarkMode: false,
    });
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '800px', height: '600px', border: '1px solid #ccc' }}
    >
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

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
 * 2. **Simplicity**
 *    - Clean, focused architecture
 *    - Single primary pattern (HistoryController)
 *    - No complex backward compatibility layers
 * 
 * 3. **Maintainability**  
 *    - Clear interfaces between components
 *    - Consistent patterns across the codebase
 *    - Easy to understand and modify
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
 * 
 * 6. **Testability**
 *    - Mock visual states for unit testing
 *    - Test renderer independently of step logic
 *    - Test step logic independently of rendering
 */

// =============================================================================
// USAGE PATTERNS
// =============================================================================

/**
 * Recommended usage patterns:
 * 
 * 1. **For Algorithm Visualization**: Use HistoryController + HistoryControllerStateComputer
 * 2. **For Static Trees**: Create BinaryTreeVisualState directly
 * 3. **For Interactive Demos**: Update visual state based on user actions
 * 4. **For Testing**: Mock BinaryTreeVisualState objects
 */
