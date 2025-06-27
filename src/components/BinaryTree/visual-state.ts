/**
 * Pure visual state for binary tree rendering
 * 
 * This interface represents the complete visual state of a binary tree
 * without any knowledge of step sequences or history navigation.
 * It's designed to be a pure rendering state that can be computed
 * from any source (HistoryController, manual state, etc.).
 */

import type { BinaryTreeNode } from "./types";
import type { AnimationInstructions } from "../../lib/HistoryController";

export interface BinaryTreeVisualState {
  /** The tree data structure to render */
  data: BinaryTreeNode;
  
  /** Set of node values that should be highlighted as visited */
  visitedNodes: Set<number>;
  
  /** Array of node values that form the current highlight path */
  highlightPath: number[];
  
  /** The node value that should be highlighted as the current active node */
  currentNode: number | null;
  
  /** Whether the tree is currently in a traversal state */
  isTraversing: boolean;
  
  /** Animation instructions to execute on this render */
  animationInstructions?: AnimationInstructions;
}

/**
 * State computer interface
 * 
 * This interface defines how to compute visual state from various sources.
 * Different implementations can compute state from HistoryController,
 * manual traversal steps, or other sources.
 */
export interface VisualStateComputer {
  /**
   * Compute the current visual state based on the implementation's data source
   */
  computeVisualState(): BinaryTreeVisualState;
  
  /**
   * Check if the state has changed since the last computation
   */
  hasStateChanged(): boolean;
}

/**
 * History controller-based state computer
 * 
 * Computes visual state from a HistoryController instance.
 * This is the preferred approach for step-by-step visualization.
 */
export class HistoryControllerStateComputer implements VisualStateComputer {
  private lastStateHash: string | null = null;
  
  constructor(
    private historyController: any, // We'll type this properly later
    private baseTreeData: BinaryTreeNode
  ) {}
  
  computeVisualState(): BinaryTreeVisualState {
    const state = this.historyController.getState();
    const currentOperation = state.selectedOperationIndex >= 0 
      ? state.operations[state.selectedOperationIndex] 
      : null;
    
    // Debug logging
    console.log('HistoryController state:', {
      operationsCount: state.operations.length,
      selectedOperationIndex: state.selectedOperationIndex,
      currentStepIndex: state.currentStepIndex,
      currentOperation: currentOperation ? {
        type: currentOperation.type,
        stepsCount: currentOperation.steps.length,
        description: currentOperation.description
      } : null
    });
    
    // Get current tree data (either from current state or base)
    const data = state.currentState || this.baseTreeData;
    
    // Compute visited nodes from ALL completed operations and current operation progress
    const visitedNodes = new Set<number>();
    const highlightPath: number[] = [];
    
    // First, add all nodes from completed operations (operations before the current one)
    if (state.selectedOperationIndex >= 0) {
      for (let opIndex = 0; opIndex < state.selectedOperationIndex; opIndex++) {
        const operation = state.operations[opIndex];
        if (operation && operation.steps) {
          // Add all visited nodes from this completed operation
          operation.steps.forEach((step: any) => {
            // Handle both metadata-based and TraversalStep-based structures
            let nodeValue: number | undefined;
            
            // Try metadata first (for custom steps)
            if (step.metadata && step.metadata.visitedNode !== undefined) {
              nodeValue = step.metadata.visitedNode;
            }
            // Then try currentNode.value (for TraversalStep structure)
            else if (step.currentNode && step.currentNode.value !== undefined) {
              nodeValue = step.currentNode.value;
            }
            
            if (nodeValue !== undefined) {
              visitedNodes.add(nodeValue);
              // Also add to highlight path if it's not already there
              if (!highlightPath.includes(nodeValue)) {
                highlightPath.push(nodeValue);
              }
              console.log(`Added visited node from completed operation ${opIndex}:`, nodeValue);
            }
          });
        }
      }
    }
    
    // Then, add nodes from the current operation up to the current step
    if (currentOperation && state.currentStepIndex >= 0) {
      for (let i = 0; i <= state.currentStepIndex; i++) {
        const step = currentOperation.steps[i];
        if (step) {
          // Handle both metadata-based and TraversalStep-based structures
          let nodeValue: number | undefined;
          
          // Try metadata first (for custom steps)
          if (step.metadata && step.metadata.visitedNode !== undefined) {
            nodeValue = step.metadata.visitedNode;
          }
          // Then try currentNode.value (for TraversalStep structure)
          else if (step.currentNode && step.currentNode.value !== undefined) {
            nodeValue = step.currentNode.value;
          }
          
          if (nodeValue !== undefined) {
            visitedNodes.add(nodeValue);
            // Build highlight path from traversal steps
            if (!highlightPath.includes(nodeValue)) {
              highlightPath.push(nodeValue);
            }
            console.log(`Added visited node from current operation step ${i}:`, nodeValue);
          }
        }
      }
    }
    
    // Get current active node (the node being processed right now)
    let currentNode: number | null = null;
    if (currentOperation && state.currentStepIndex >= 0) {
      const currentStep = currentOperation.steps[state.currentStepIndex];
      if (currentStep) {
        // Try metadata first (for custom steps)
        if (currentStep.metadata && currentStep.metadata.currentNode !== undefined) {
          currentNode = currentStep.metadata.currentNode;
        }
        // Then try currentNode.value (for TraversalStep structure)
        else if (currentStep.currentNode && currentStep.currentNode.value !== undefined) {
          currentNode = currentStep.currentNode.value;
        }
      }
    }
    
    // Get animation instructions
    const animationInstructions = this.historyController.getAnimationInstructions 
      ? this.historyController.getAnimationInstructions()
      : undefined;
    
    const visualState: BinaryTreeVisualState = {
      data,
      visitedNodes,
      highlightPath,
      currentNode,
      // Keep traversing state if we have any visited nodes or are actively in an operation
      isTraversing: visitedNodes.size > 0 || currentOperation !== null,
      animationInstructions,
    };
    
    // Debug logging
    console.log('Computed visual state:', {
      visitedNodesCount: visitedNodes.size,
      visitedNodesArray: Array.from(visitedNodes),
      highlightPathLength: highlightPath.length,
      highlightPath: [...highlightPath],
      currentNode,
      isTraversing: visualState.isTraversing
    });
    
    return visualState;
  }
  
  hasStateChanged(): boolean {
    const currentStateHash = this.computeStateHash();
    const changed = currentStateHash !== this.lastStateHash;
    this.lastStateHash = currentStateHash;
    return changed;
  }
  
  private computeStateHash(): string {
    const state = this.historyController.getState();
    return JSON.stringify({
      operationIndex: state.selectedOperationIndex,
      stepIndex: state.currentStepIndex,
      currentStateHash: state.currentState ? JSON.stringify(state.currentState) : null,
    });
  }
}


