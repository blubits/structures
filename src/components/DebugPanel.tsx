/**
 * Debug Panel Component
 * 
 * A comprehensive debug panel that displays raw data structures and internal state
 * for debugging purposes. Only rendered in development mode.
 * 
 * This component can be used independently or integrated into other components
 * to provide detailed debugging information about tree state, operations, and steps.
 * 
 * @example
 * ```tsx
 * <DebugPanel
 *   treeData={currentTree}
 *   currentStep={activeStep}
 *   historyController={controller}
 *   position="bottom-left"
 * />
 * ```
 */

import React, { useState } from "react";
import type { BinaryTreeNode, TraversalStep, TreeOperation, TreeTypeConfig } from "./BinaryTree/types";
import type { BinaryTreeVisualState, VisualStateComputer } from "./BinaryTree/visual-state";

/**
 * Props for the DebugPanel component
 */
interface DebugPanelProps {
  /** Current tree data structure */
  treeData?: BinaryTreeNode;
  /** Current traversal step (if any) */
  currentStep?: TraversalStep | null;
  /** Current step index in traversal sequence */
  currentStepIndex?: number;
  /** All traversal steps */
  traversalSteps?: TraversalStep[];
  /** Currently selected operation */
  selectedOperation?: TreeOperation;
  /** Tree type configuration */
  treeType?: TreeTypeConfig;
  /** History controller instance (if available) */
  historyController?: any;
  /** Visual state computer for displaying current visual state */
  visualStateComputer?: VisualStateComputer;
  /** Additional debug data to display */
  additionalData?: Record<string, any>;
  /** Position of the debug panel */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  /** Custom CSS classes */
  className?: string;
}

/**
 * Debug Panel Component
 * 
 * Provides an expandable debug interface showing:
 * - Current tree structure
 * - Active traversal step details
 * - Operation history
 * - Environment information
 * - Custom debug data
 */
export const DebugPanel: React.FC<DebugPanelProps> = ({
  treeData,
  currentStep,
  currentStepIndex = -1,
  traversalSteps = [],
  selectedOperation,
  treeType,
  historyController,
  visualStateComputer,
  additionalData,
  position = 'bottom-left',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'tree' | 'visual-state' | 'operations'>(() => {
    // Default to operations tab if we have traversal steps, otherwise tree
    return (traversalSteps && traversalSteps.length > 0) ? 'operations' : 'tree';
  });
  const [expandedOperations, setExpandedOperations] = useState<Set<string>>(new Set());

  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  const positionClasses = {
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
  };

  const getTreeStructure = (node: BinaryTreeNode | undefined, depth = 0): any => {
    if (!node) return null;
    return {
      value: node.value,
      id: node.id,
      highlighted: node.highlighted,
      color: node.color,
      depth,
      left: getTreeStructure(node.left, depth + 1),
      right: getTreeStructure(node.right, depth + 1),
    };
  };

  const getOperationsData = () => {
    if (!traversalSteps || traversalSteps.length === 0) return {};
    
    // Group steps by operation
    const operationGroups: Record<string, any[]> = {};
    
    traversalSteps.forEach((step, index) => {
      const operationKey = `${step.operation}_${step.metadata.searchValue || step.metadata.insertValue || step.metadata.deleteValue || 'unknown'}`;
      
      if (!operationGroups[operationKey]) {
        operationGroups[operationKey] = [];
      }
      
      operationGroups[operationKey].push({
        stepIndex: index,
        isCurrent: index === currentStepIndex,
        id: step.id,
        operation: step.operation,
        decision: step.decision,
        currentNode: step.currentNode ? {
          value: step.currentNode.value,
          left: step.currentNode.left?.value || null,
          right: step.currentNode.right?.value || null,
        } : null,
        nextNode: step.nextNode ? {
          value: step.nextNode.value,
          left: step.nextNode.left?.value || null,
          right: step.nextNode.right?.value || null,
        } : null,
        metadata: {
          description: step.metadata.description,
          searchValue: step.metadata.searchValue,
          insertValue: step.metadata.insertValue,
          deleteValue: step.metadata.deleteValue,
          comparison: step.metadata.comparison,
          isComplete: step.metadata.isComplete,
        }
      });
    });
    
    return operationGroups;
  };

  const debugData = {
    tree: {
      structure: getTreeStructure(treeData),
      nodeCount: treeData ? countNodes(treeData) : 0,
      maxDepth: treeData ? getMaxDepth(treeData) : 0,
      isBalanced: treeData ? isTreeBalanced(treeData) : null,
    },
    operations: getOperationsData(),
    custom: additionalData,
  };

  const tabs = [
    { id: 'tree', label: 'Tree', icon: '🌳' },
    { id: 'visual-state', label: 'Visual State', icon: '�', disabled: !visualStateComputer },
    { id: 'operations', label: 'Operations', icon: '⚡', disabled: !traversalSteps || traversalSteps.length === 0 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tree':
        return (
          <pre className="text-xs font-mono text-green-300 bg-black/30 rounded p-2 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(debugData.tree, null, 2)}
          </pre>
        );
      case 'visual-state':
        return renderVisualStateTab();
      case 'operations':
        return renderOperationsTab();
      default:
        return (
          <div className="text-white/60 text-xs italic p-2">
            Select a tab to view debug information
          </div>
        );
    }
  };

  const renderVisualStateTab = () => {
    if (!visualStateComputer) {
      return (
        <div className="text-white/60 text-xs italic p-2">
          No visual state computer available
        </div>
      );
    }

    try {
      const visualState: BinaryTreeVisualState = visualStateComputer.computeVisualState();
      
      return (
        <div className="space-y-3">
          {/* Visual State Summary */}
          <div className="bg-black/40 rounded p-2 border border-white/20">
            <div className="text-xs text-white/80 mb-2 flex items-center gap-2">
              <span className="text-blue-300">🎨 Visual State Summary</span>
            </div>
            <div className="text-xs space-y-1">
              <div>Is Traversing: <span className={visualState.isTraversing ? "text-green-300" : "text-red-300"}>{visualState.isTraversing ? 'Yes' : 'No'}</span></div>
              <div>Current Node: <span className="text-yellow-300">{visualState.currentNode ?? 'None'}</span></div>
              <div>Visited Nodes: <span className="text-orange-300">{visualState.visitedNodes.size}</span></div>
              <div>Highlight Path: <span className="text-green-300">{visualState.highlightPath.length}</span></div>
            </div>
          </div>

          {/* Visited Nodes */}
          {visualState.visitedNodes.size > 0 && (
            <div className="bg-black/40 rounded p-2 border border-white/20">
              <div className="text-xs text-white/80 mb-2 flex items-center gap-2">
                <span className="text-orange-300">🟠 Visited Nodes</span>
              </div>
              <div className="text-xs">
                {Array.from(visualState.visitedNodes).sort((a, b) => a - b).map(nodeValue => (
                  <span key={nodeValue} className="inline-block bg-orange-500/20 text-orange-300 px-1 py-0.5 rounded mr-1 mb-1">
                    {nodeValue}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Highlight Path */}
          {visualState.highlightPath.length > 0 && (
            <div className="bg-black/40 rounded p-2 border border-white/20">
              <div className="text-xs text-white/80 mb-2 flex items-center gap-2">
                <span className="text-green-300">🟢 Highlight Path</span>
              </div>
              <div className="text-xs">
                {visualState.highlightPath.map((nodeValue, index) => (
                  <span key={`${nodeValue}-${index}`} className="inline-flex items-center">
                    <span className="bg-green-500/20 text-green-300 px-1 py-0.5 rounded">
                      {nodeValue}
                    </span>
                    {index < visualState.highlightPath.length - 1 && (
                      <span className="text-white/40 mx-1">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Animation Instructions */}
          {visualState.animationInstructions && (
            <div className="bg-black/40 rounded p-2 border border-white/20">
              <div className="text-xs text-white/80 mb-2 flex items-center gap-2">
                <span className="text-purple-300">🎬 Animation Instructions</span>
              </div>
              <div className="text-xs space-y-1">
                <div>Direction: <span className="text-yellow-300">{visualState.animationInstructions.stepDirection || 'none'}</span></div>
                <div>Instructions: <span className="text-green-300">{visualState.animationInstructions.instructions.length}</span></div>
              </div>
              {visualState.animationInstructions.instructions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {visualState.animationInstructions.instructions.map((instruction, index) => (
                    <div key={index} className="bg-black/20 rounded p-1 text-xs">
                      <div className="flex gap-2">
                        <span className="text-blue-300">{instruction.type}:</span>
                        {instruction.type === 'node' && 'nodeValue' in instruction && (
                          <span className="text-yellow-300">{instruction.nodeValue}</span>
                        )}
                        {instruction.type === 'link' && 'fromValue' in instruction && 'toValue' in instruction && (
                          <span className="text-yellow-300">{instruction.fromValue} → {instruction.toValue}</span>
                        )}
                        <span className="text-green-300">{instruction.animation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Raw Visual State */}
          <div className="bg-black/40 rounded p-2 border border-white/20">
            <div className="text-xs text-white/80 mb-2 flex items-center gap-2">
              <span className="text-gray-300">📋 Raw Visual State</span>
            </div>
            <pre className="text-xs font-mono text-green-300 bg-black/30 rounded p-2 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify({
                ...visualState,
                visitedNodes: Array.from(visualState.visitedNodes),
              }, null, 2)}
            </pre>
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="text-red-300 text-xs p-2">
          Error computing visual state: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      );
    }
  };

  const renderOperationsTab = () => {
    const toggleOperation = (operationKey: string) => {
      const newExpanded = new Set(expandedOperations);
      if (newExpanded.has(operationKey)) {
        newExpanded.delete(operationKey);
      } else {
        newExpanded.add(operationKey);
      }
      setExpandedOperations(newExpanded);
    };

    if (!debugData.operations || Object.keys(debugData.operations).length === 0) {
      return (
        <div className="text-white/60 text-xs italic p-2">
          No operations available
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {Object.entries(debugData.operations).map(([operationType, operationData]) => {
          const operationKey = `${operationType}`;
          const isExpanded = expandedOperations.has(operationKey);
          const stepCount = Array.isArray(operationData) ? operationData.length : 0;
          
          return (
            <div key={operationKey} className="border border-white/20 rounded">
              <button
                onClick={() => toggleOperation(operationKey)}
                className="w-full px-3 py-2 text-left text-xs hover:bg-white/10 transition-colors flex items-center justify-between"
              >
                <span className="text-blue-300 font-mono flex items-center gap-2">
                  <span className="text-white/60">{isExpanded ? '▼' : '▶'}</span>
                  <span className="capitalize">{operationType}</span>
                  <span className="text-white/60 text-xs">({stepCount} steps)</span>
                </span>
              </button>
              
              {isExpanded && (
                <div className="border-t border-white/20 p-2">
                  <pre className="text-xs font-mono text-green-300 bg-black/40 rounded p-2 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {JSON.stringify(operationData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`absolute ${positionClasses[position]} bg-black/80 backdrop-blur-sm text-white rounded-lg text-sm pointer-events-auto z-50 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 text-left text-xs hover:bg-white/10 transition-colors flex items-center justify-between min-w-[120px]"
      >
        <span className="text-orange-300 font-mono flex items-center gap-1">
          🐛 Debug
          {currentStep && <span className="text-red-400 animate-pulse">●</span>}
        </span>
        <span className="text-white/60">{isExpanded ? '▼' : '▶'}</span>
      </button>
      
      {isExpanded && (
        <div className="border-t border-white/20">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                disabled={tab.disabled}
                className={`px-2 py-1 text-xs flex items-center gap-1 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : tab.disabled
                    ? 'text-white/40 cursor-not-allowed'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-3 max-h-64 overflow-y-auto min-w-[300px] max-w-[500px]">
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for tree analysis
function countNodes(node: BinaryTreeNode): number {
  if (!node) return 0;
  return 1 + countNodes(node.left!) + countNodes(node.right!);
}

function getMaxDepth(node: BinaryTreeNode): number {
  if (!node) return 0;
  return 1 + Math.max(
    node.left ? getMaxDepth(node.left) : 0,
    node.right ? getMaxDepth(node.right) : 0
  );
}

function isTreeBalanced(node: BinaryTreeNode): boolean {
  if (!node) return true;
  
  const leftDepth = node.left ? getMaxDepth(node.left) : 0;
  const rightDepth = node.right ? getMaxDepth(node.right) : 0;
  
  return (
    Math.abs(leftDepth - rightDepth) <= 1 &&
    (!node.left || isTreeBalanced(node.left)) &&
    (!node.right || isTreeBalanced(node.right))
  );
}

export default DebugPanel;
