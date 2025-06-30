/**
 * Debug Panel Component (Declarative Version)
 * 
 * A comprehensive debug panel that displays raw data structures and internal state
 * for debugging purposes. Only rendered in development mode.
 * 
 * This component matches the look and functionality of the deprecated version
 * but works with the declarative BST system.
 */

import React, { useState, useMemo } from 'react';
import type { BinaryTreeNode, BinaryTreeState } from '../lib/types/binary-tree-node';
import { TransitionDetector } from '../lib/animation/transition-detector';
import { AnimationMapper } from '../lib/animation/animation-mapper';
import { BinaryTreeValidator } from '../lib/binary-tree-validator';

interface DebugPanelProps {
  currentTree: BinaryTreeNode | null;
  previousTree: BinaryTreeNode | null;
  selectedOperationIndex: number;
  currentStepIndex: number;
  operations: any[];
  operationStates?: BinaryTreeState[];
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  currentTree,
  previousTree,
  selectedOperationIndex,
  currentStepIndex,
  operations,
  operationStates,
  position = 'bottom-left',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'tree' | 'visual-state' | 'operations'>(() => {
    return (operations && operations.length > 0) ? 'operations' : 'tree';
  });
  const [expandedOperations, setExpandedOperations] = useState<Set<string>>(new Set());

  // Only render in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  // Detect transitions between previous and current tree
  const transitions = useMemo(() => {
    if (!previousTree && !currentTree) return [];
    return TransitionDetector.detectTransitions(previousTree, currentTree);
  }, [previousTree, currentTree]);

  // Map transitions to animations
  const animations = useMemo(() => {
    return transitions.map(transition => ({
      transition,
      animation: AnimationMapper.getAnimation(transition)
    }));
  }, [transitions]);

  // Validate current tree
  const validation = useMemo(() => {
    if (!currentTree) return { isValid: true, errors: [] };
    return BinaryTreeValidator.validateTree(currentTree);
  }, [currentTree]);

  const positionClasses = {
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
  };

  const getBSTTreeStructure = (node: BinaryTreeNode | null, depth = 0): any => {
    if (!node) return null;
    return {
      value: node.value,
      state: node.state,
      traversalDirection: node.traversalDirection,
      depth,
      left: getBSTTreeStructure(node.left, depth + 1),
      right: getBSTTreeStructure(node.right, depth + 1),
    };
  };

  const getOperationsData = () => {
    if (!operations || operations.length === 0) return {};
    
    // Group operations and create detailed step information
    const operationGroups: Record<string, any[]> = {};
    
    operations.forEach((operation, index) => {
      const operationKey = `${operation.type || operation.operation || 'operation'}_${operation.value || operation.searchValue || operation.insertValue || operation.deleteValue || index}`;
      
      if (!operationGroups[operationKey]) {
        operationGroups[operationKey] = [];
      }
      
      // Create detailed step information similar to deprecated version
      const stepData = {
        operationIndex: index,
        isCurrent: index === selectedOperationIndex,
        stepIndex: currentStepIndex,
        id: operation.id || `op-${index}`,
        operation: operation.type || operation.operation,
        description: operation.description || `${operation.type || 'Operation'} ${operation.value || ''}`,
        value: operation.value,
        currentState: operationStates ? operationStates[Math.min(currentStepIndex, operationStates.length - 1)] : null,
        
        // Extract step-level details if available from states
        metadata: {
          description: operation.description || `Performing ${operation.type || 'operation'}${operation.value ? ` with value ${operation.value}` : ''}`,
          searchValue: operation.value,
          insertValue: operation.type === 'insert' ? operation.value : undefined,
          deleteValue: operation.type === 'delete' ? operation.value : undefined,
          operationType: operation.type,
          timestamp: operation.timestamp,
          isComplete: currentStepIndex >= (operationStates?.length || 1) - 1,
        },
        
        // Include transitions and validation for this step
        transitions: transitions,
        validation: validation,
        
        // Tree state information
        currentTree: currentTree ? {
          value: currentTree.value,
          state: currentTree.state,
          traversalDirection: currentTree.traversalDirection,
          left: currentTree.left?.value || null,
          right: currentTree.right?.value || null,
        } : null,
      };
      
      operationGroups[operationKey].push(stepData);
    });
    
    return operationGroups;
  };

  const debugData = {
    tree: {
      structure: getBSTTreeStructure(currentTree),
      nodeCount: currentTree ? countNodes(currentTree) : 0,
      maxDepth: currentTree ? getMaxDepth(currentTree) : 0,
      isBalanced: currentTree ? isTreeBalanced(currentTree) : null,
    },
    operations: getOperationsData(),
    custom: {
      transitions,
      animations,
      validation,
      selectedOperationIndex,
      currentStepIndex,
      operationStatesLength: operationStates?.length || 0,
    },
  };

  const tabs = [
    { id: 'tree', label: 'Tree', icon: '🌳' },
    { id: 'visual-state', label: 'Visual State', icon: '🎨', disabled: false },
    { id: 'operations', label: 'Operations', icon: '⚡', disabled: !operations || operations.length === 0 },
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
    return (
      <div className="space-y-3">
        {/* Declarative State Summary */}
        <div className="bg-black/40 rounded p-2 border border-white/20">
          <div className="text-xs text-white/80 mb-2 flex items-center gap-2">
            <span className="text-blue-300">🎨 Declarative State Summary</span>
          </div>
          <div className="text-xs space-y-1">
            <div>Current Operation: <span className="text-yellow-300">{selectedOperationIndex >= 0 ? `${selectedOperationIndex + 1} of ${operations.length}` : 'None'}</span></div>
            <div>Current Step: <span className="text-yellow-300">{currentStepIndex >= 0 ? `${currentStepIndex + 1}` : 'None'}</span></div>
            <div>Detected Transitions: <span className="text-orange-300">{transitions.length}</span></div>
            <div>Tree Valid: <span className={validation.isValid ? "text-green-300" : "text-red-300"}>{validation.isValid ? 'Yes' : 'No'}</span></div>
          </div>
        </div>

        {/* Detected Transitions */}
        {transitions.length > 0 && (
          <div className="bg-black/40 rounded p-2 border border-white/20">
            <div className="text-xs text-white/80 mb-2 flex items-center gap-2">
              <span className="text-orange-300">🔄 Detected Transitions</span>
            </div>
            <div className="text-xs space-y-1">
              {transitions.map((transition, index) => (
                <div key={index} className="bg-black/20 rounded p-1">
                  <div className="flex gap-2">
                    <span className="text-blue-300">{transition.type}:</span>
                    <span className="text-yellow-300">{transition.path.join(' → ') || 'root'}</span>
                  </div>
                  {transition.from !== undefined && (
                    <div className="text-gray-300 ml-2">From: {JSON.stringify(transition.from)}</div>
                  )}
                  {transition.to !== undefined && (
                    <div className="text-gray-300 ml-2">To: {JSON.stringify(transition.to)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inferred Animations */}
        {animations.length > 0 && (
          <div className="bg-black/40 rounded p-2 border border-white/20">
            <div className="text-xs text-white/80 mb-2 flex items-center gap-2">
              <span className="text-purple-300">🎬 Inferred Animations</span>
            </div>
            <div className="text-xs space-y-1">
              {animations.map((anim, index) => (
                <div key={index} className="bg-black/20 rounded p-1">
                  <div className="flex gap-2">
                    <span className="text-blue-300">{anim.transition.type}:</span>
                    {anim.animation && (
                      <>
                        <span className="text-green-300">{anim.animation.type}</span>
                        <span className="text-yellow-300">({anim.animation.duration}ms)</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {!validation.isValid && (
          <div className="bg-black/40 rounded p-2 border border-red-500/50">
            <div className="text-xs text-white/80 mb-2 flex items-center gap-2">
              <span className="text-red-300">❌ Validation Errors</span>
            </div>
            <div className="text-xs space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index} className="text-red-300">{error}</div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Declarative State */}
        <div className="bg-black/40 rounded p-2 border border-white/20">
          <div className="text-xs text-white/80 mb-2 flex items-center gap-2">
            <span className="text-gray-300">📋 Raw Declarative State</span>
          </div>
          <pre className="text-xs font-mono text-green-300 bg-black/30 rounded p-2 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify({
              currentTree: getBSTTreeStructure(currentTree),
              transitions,
              validation,
              selectedOperationIndex,
              currentStepIndex,
            }, null, 2)}
          </pre>
        </div>
      </div>
    );
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
                  <span className="text-white/60 text-xs">({stepCount} ops)</span>
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

  const hasActiveOperation = selectedOperationIndex >= 0 && currentStepIndex >= 0;

  return (
    <div className={`absolute ${positionClasses[position]} bg-black/80 backdrop-blur-sm text-white rounded-lg text-sm pointer-events-auto z-50 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 text-left text-xs hover:bg-white/10 transition-colors flex items-center justify-between min-w-[120px]"
      >
        <span className="text-orange-300 font-mono flex items-center gap-1">
          🐛 Debug
          {hasActiveOperation && <span className="text-red-400 animate-pulse">●</span>}
          {transitions.length > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ml-1">
              {transitions.length}
            </span>
          )}
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
