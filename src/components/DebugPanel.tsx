import { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Bug, Code, GitBranch } from 'lucide-react';
import type { BinaryTree, BinaryTreeNode } from '@/structures/BinaryTree/types';
import { countNodes } from '@/structures/BinaryTree/types';
import type { OperationGroup } from '@/types/operations';

interface DebugPanelProps {
  currentState: BinaryTree | null;
  operationHistory: readonly OperationGroup<BinaryTree>[];
  currentOperationIndex: number;
  currentAnimationIndex: number;
  isAnimating: boolean;
  // New props for step debug
  stepDebug?: {
    currentOperationStates: any[];
    currentAnimationIndex: number;
    currentOperationIndex: number;
    isAnimating: boolean;
    canStepForward: boolean;
    canStepBackward: boolean;
  };
  className?: string;
}

interface TreeNodeDebugInfo {
  value: number;
  depth: number;
  leftChild?: number;
  rightChild?: number;
  parent?: number;
  isLeaf: boolean;
  subtreeSize: number;
}

type TabType = 'tree' | 'operations' | 'step';

/**
 * Debug Panel for BST Visualizer
 * 
 * A bottom-right expandable panel with two tabs:
 * - Tree: Parsed tree state and raw JSON
 * - Operations: Complete operation history grouped by operation
 */
export function DebugPanel({
  currentState,
  operationHistory,
  currentOperationIndex,
  currentAnimationIndex,
  isAnimating,
  stepDebug,
  className = ''
}: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('tree');
  const [expandedOperations, setExpandedOperations] = useState<Set<number>>(new Set());

  const toggleOperation = (operationIndex: number) => {
    const newExpanded = new Set(expandedOperations);
    if (newExpanded.has(operationIndex)) {
      newExpanded.delete(operationIndex);
    } else {
      newExpanded.add(operationIndex);
    }
    setExpandedOperations(newExpanded);
  };

  // Analyze tree structure
  const analyzeTree = (root: BinaryTreeNode | null): {
    nodes: TreeNodeDebugInfo[];
    maxDepth: number;
    totalNodes: number;
    isValidBST: boolean;
  } => {
    if (!root) {
      return { nodes: [], maxDepth: 0, totalNodes: 0, isValidBST: true };
    }

    const nodes: TreeNodeDebugInfo[] = [];
    let maxDepth = 0;

    const traverse = (node: BinaryTreeNode, depth: number, parent?: number): number => {
      maxDepth = Math.max(maxDepth, depth);
      
      const leftSize = node.left ? traverse(node.left, depth + 1, node.value) : 0;
      const rightSize = node.right ? traverse(node.right, depth + 1, node.value) : 0;
      const subtreeSize = 1 + leftSize + rightSize;

      nodes.push({
        value: node.value,
        depth,
        leftChild: node.left?.value,
        rightChild: node.right?.value,
        parent,
        isLeaf: !node.left && !node.right,
        subtreeSize
      });

      return subtreeSize;
    };

    traverse(root, 0);

    // Check BST property
    const isValidBST = nodes.every(node => {
      const leftChild = nodes.find(n => n.value === node.leftChild);
      const rightChild = nodes.find(n => n.value === node.rightChild);
      
      return (!leftChild || leftChild.value < node.value) && 
             (!rightChild || rightChild.value > node.value);
    });

    return { nodes, maxDepth, totalNodes: nodes.length, isValidBST };
  };

  const treeAnalysis = currentState?.root ? analyzeTree(currentState.root!) : null;

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Create a clean version of the current state for JSON display
  const cleanStateForJson = (state: BinaryTree | null) => {
    if (!state) return null;
    
    // Remove React-specific properties and circular references
    const cleanNode = (node: BinaryTreeNode | null): any => {
      if (!node) return null;
      return {
        value: node.value,
        left: cleanNode(node.left),
        right: cleanNode(node.right),
        state: node.state,
        id: node.id,
        metadata: node.metadata
      };
    };

    return {
      root: cleanNode(state.root),
      name: state.name,
      animationHints: state.animationHints,
      _metadata: state._metadata
    };
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-40 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Header/Collapsed Bar */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bug size={16} className="text-blue-600" />
          <span className="font-medium text-sm text-gray-800 dark:text-gray-200">Debug Panel</span>
          {isAnimating && (
            <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
              Animating
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <span className="text-xs text-gray-500">{operationHistory.length} ops</span>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-zinc-700">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 dark:border-zinc-700">
            <button
              onClick={() => setActiveTab('tree')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
                activeTab === 'tree'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <GitBranch size={14} />
              Tree
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
                activeTab === 'operations'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Code size={14} />
              Operations
            </button>
            {stepDebug && (
              <button
                onClick={() => setActiveTab('step')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium transition-colors ${
                  activeTab === 'step'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Bug size={14} />
                Step Debug
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="w-96 max-h-96 overflow-y-auto">
            {/* Tree Tab */}
            {activeTab === 'tree' && (
              <div className="p-4 space-y-4">
                {/* Parsed Tree State */}
                <div>
                  <h4 className="font-medium text-sm mb-2 text-gray-800 dark:text-gray-200">Tree Analysis</h4>
                  {currentState ? (
                    <div className="space-y-3 text-sm">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-zinc-700 rounded">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Name:</span>
                          <div className="font-mono text-xs">{currentState.name || 'Unnamed'}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Nodes:</span>
                          <div className="font-mono text-xs">{countNodes(currentState.root)}</div>
                        </div>
                        {treeAnalysis && (
                          <>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400 text-xs">Max Depth:</span>
                              <div className="font-mono text-xs">{treeAnalysis.maxDepth}</div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400 text-xs">Valid BST:</span>
                              <div className={`font-mono text-xs ${treeAnalysis.isValidBST ? 'text-green-600' : 'text-red-600'}`}>
                                {treeAnalysis.isValidBST ? '✓ Yes' : '✗ No'}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Tree Structure */}
                      {treeAnalysis && treeAnalysis.nodes.length > 0 && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Structure:</span>
                          <div className="mt-1 max-h-32 overflow-y-auto bg-gray-50 dark:bg-zinc-700 rounded p-2 font-mono text-xs">
                            {treeAnalysis.nodes
                              .sort((a, b) => a.depth - b.depth || a.value - b.value)
                              .map(node => (
                                <div key={node.value} className="flex justify-between py-1">
                                  <span>
                                    {'  '.repeat(node.depth)}
                                    {node.value}
                                    {node.isLeaf ? ' (leaf)' : ''}
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    d:{node.depth} s:{node.subtreeSize}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Animation Hints */}
                      {currentState.animationHints && currentState.animationHints.length > 0 && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Animation Hints:</span>
                          <div className="mt-1 max-h-24 overflow-y-auto bg-gray-50 dark:bg-zinc-700 rounded p-2 font-mono text-xs">
                            {currentState.animationHints.map((hint: any, index: number) => (
                              <div key={index} className="mb-1">
                                <span className="text-blue-600">{hint.type}</span>
                                {hint.metadata && (
                                  <div className="ml-2 text-gray-500 text-xs">
                                    {JSON.stringify(hint.metadata)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic text-sm">No current state</div>
                  )}
                </div>

                {/* Raw JSON */}
                <div>
                  <h4 className="font-medium text-sm mb-2 text-gray-800 dark:text-gray-200">Raw JSON</h4>
                  <div className="bg-gray-50 dark:bg-zinc-700 rounded p-3 max-h-48 overflow-y-auto">
                    <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {JSON.stringify(cleanStateForJson(currentState), null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* Operations Tab */}
            {activeTab === 'operations' && (
              <div className="p-4">
                <h4 className="font-medium text-sm mb-3 text-gray-800 dark:text-gray-200">
                  Operation History ({operationHistory.length} operations)
                </h4>
                {operationHistory.length > 0 ? (
                  <div className="space-y-2">
                    {operationHistory.map((group, index) => (
                      <div key={group.operation.id} className="border border-gray-200 dark:border-zinc-600 rounded">
                        <button
                          onClick={() => toggleOperation(index)}
                          className={`w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors ${
                            index === currentOperationIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          {expandedOperations.has(index) ? 
                            <ChevronDown size={14} /> : 
                            <ChevronRight size={14} />
                          }
                          <div className="flex-1">
                            <div className="font-mono text-xs">
                              {group.operation.type}
                              {group.operation.params?.value !== undefined && ` (${group.operation.params.value})`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTimestamp(group.operation.timestamp)} • {group.states.length} steps
                            </div>
                          </div>
                          {index === currentOperationIndex && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                              current
                            </span>
                          )}
                        </button>
                        
                        {expandedOperations.has(index) && (
                          <div className="border-t border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700 p-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                              <div>ID: {group.operation.id}</div>
                              <div>Description: {group.operation.description}</div>
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-xs font-medium">Steps:</span>
                              {group.states.map((state, stepIndex) => (
                                <div 
                                  key={stepIndex}
                                  className={`text-xs p-2 rounded font-mono ${
                                    index === currentOperationIndex && stepIndex === currentAnimationIndex
                                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                      : 'bg-white dark:bg-zinc-600'
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <span>Step {stepIndex + 1}: {state.name || 'Unnamed'}</span>
                                    <span className="text-gray-500">({countNodes(state.root)} nodes)</span>
                                  </div>
                                  {state.animationHints && state.animationHints.length > 0 && (
                                    <div className="mt-1 text-gray-500 text-xs">
                                      Hints: {state.animationHints.map((h: any) => h.type).join(', ')}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-sm">No operations performed</div>
                )}
              </div>
            )}

            {/* Step Debug Tab */}
            {activeTab === 'step' && stepDebug && (
              <div className="p-4 space-y-4 text-xs">
                <div>
                  <div className="font-medium mb-2 text-yellow-400">Current Step Details:</div>
                  <div className="bg-black/40 rounded-lg p-3 font-mono space-y-1">
                    <div>Operation Index: {stepDebug.currentOperationIndex}</div>
                    <div>Animation Index: {stepDebug.currentAnimationIndex}</div>
                    <div>Is Animating: {stepDebug.isAnimating ? 'Yes' : 'No'}</div>
                    <div>Can Step Forward: {stepDebug.canStepForward ? 'Yes' : 'No'}</div>
                    <div>Can Step Backward: {stepDebug.canStepBackward ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                {stepDebug.currentOperationStates.length > 0 && stepDebug.currentAnimationIndex >= 0 && (
                  <div>
                    <div className="font-medium mb-2 text-blue-400">Animation Hints for Current Step:</div>
                    <div className="bg-black/40 rounded-lg p-3 font-mono">
                      {(() => {
                        const currentStepState = stepDebug.currentOperationStates[stepDebug.currentAnimationIndex];
                        if (currentStepState?.animationHints && currentStepState.animationHints.length > 0) {
                          return currentStepState.animationHints.map((hint: any, index: number) => (
                            <div key={index} className="mb-1">
                              <span className="text-green-400">{hint.type}</span>
                              {hint.metadata && (
                                <div className="ml-2 text-gray-400 text-xs">
                                  {JSON.stringify(hint.metadata, null, 2)}
                                </div>
                              )}
                              {hint.duration && <span className="text-purple-400"> (duration: {hint.duration}ms)</span>}
                              {hint.delay && <span className="text-orange-400"> (delay: {hint.delay}ms)</span>}
                              {hint.sequence !== undefined && <span className="text-cyan-400"> (seq: {hint.sequence})</span>}
                            </div>
                          ));
                        } else {
                          return <div className="text-gray-500 italic">No animation hints for this step</div>;
                        }
                      })()}
                    </div>
                  </div>
                )}
                <div>
                  <div className="font-medium mb-2 text-green-400">State Transition:</div>
                  <div className="bg-black/40 rounded-lg p-3 font-mono">
                    {stepDebug.currentOperationStates.length > 0 && stepDebug.currentAnimationIndex >= 0 ? (
                      <>
                        <div>Current State: {stepDebug.currentOperationStates[stepDebug.currentAnimationIndex]?.name || 'Unnamed'}</div>
                        <div>Node Count: {countNodes(stepDebug.currentOperationStates[stepDebug.currentAnimationIndex].root) || 0}</div>
                        {stepDebug.currentAnimationIndex > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <div className="text-gray-400">Previous: {stepDebug.currentOperationStates[stepDebug.currentAnimationIndex - 1]?.name || 'Unnamed'}</div>
                          </div>
                        )}
                        {stepDebug.currentAnimationIndex < stepDebug.currentOperationStates.length - 1 && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <div className="text-gray-400">Next: {stepDebug.currentOperationStates[stepDebug.currentAnimationIndex + 1]?.name || 'Unnamed'}</div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500 italic">No state transition information</div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2 text-purple-400">Operation Sequence:</div>
                  <div className="bg-black/40 rounded-lg p-3 font-mono max-h-32 overflow-y-auto">
                    {stepDebug.currentOperationStates.map((state: any, index: number) => (
                      <div 
                        key={index} 
                        className={`text-xs mb-1 ${
                          index === stepDebug.currentAnimationIndex 
                            ? 'text-yellow-300 font-bold' 
                            : index < stepDebug.currentAnimationIndex 
                              ? 'text-green-300' 
                              : 'text-gray-400'
                        }`}
                      >
                        {index + 1}. {state.name || `Step ${index + 1}`}
                        {index === stepDebug.currentAnimationIndex && ' ← CURRENT'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}