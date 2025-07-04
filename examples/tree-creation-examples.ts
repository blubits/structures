// Example usage of the new plain object tree creation system

import type { BinaryTreeSpec } from '../src/renderers/BinaryTree/types';
import { reconcileBinaryTree } from '../src/renderers/BinaryTree/types';

// Example 1: Simple tree creation with plain objects
const step1: BinaryTreeSpec = {
  root: {
    value: 8,
    state: "default",
    left: {
      value: 3,
      state: "default",
      left: null,
      right: null,
    },
    right: null,
  },
  name: "Step 1: Initial tree",
  animationHints: [],
};

// Example 2: Adding a node with animation hints
const step2: BinaryTreeSpec = {
  root: {
    value: 8,
    state: "default",
    left: {
      value: 3,
      state: "default",
      left: null,
      right: null,
    },
    right: {
      value: 10,
      state: "active", // Highlight the new node
      left: null,
      right: null,
    },
  },
  name: "Step 2: Added node 10",
  animationHints: [
    {
      type: "nodeHighlight",
      metadata: { nodeId: "node-root.R-10" },
      duration: 600,
    }
  ],
};

// Example 3: Complex tree with explicit IDs
const step3: BinaryTreeSpec = {
  root: {
    value: 8,
    state: "default",
    left: {
      value: 3,
      state: "default",
      left: {
        value: 1,
        state: "default",
        id: "custom-node-1", // Explicit ID
        left: null,
        right: null,
      },
      right: {
        value: 6,
        state: "visited",
        left: null,
        right: null,
      },
    },
    right: {
      value: 10,
      state: "default",
      left: null,
      right: {
        value: 14,
        state: "default",
        left: null,
        right: null,
      },
    },
  },
  name: "Step 3: Complex tree structure",
  animationHints: [],
};

// Example 4: How to use reconciliation
let currentTree = null;

// First update
currentTree = reconcileBinaryTree(currentTree, step1);
console.log("Step 1 applied:", currentTree);

// Second update (reconciled with previous)
currentTree = reconcileBinaryTree(currentTree, step2);
console.log("Step 2 applied:", currentTree);

// Third update (reconciled with previous)
currentTree = reconcileBinaryTree(currentTree, step3);
console.log("Step 3 applied:", currentTree);

// Example 5: Modifying just the state of nodes
const step4: BinaryTreeSpec = {
  root: {
    value: 8,
    state: "active", // Changed from "default" to "active"
    left: {
      value: 3,
      state: "visited", // Changed from "default" to "visited"
      left: {
        value: 1,
        state: "default",
        id: "custom-node-1", // Same explicit ID
        left: null,
        right: null,
      },
      right: {
        value: 6,
        state: "default", // Changed from "visited" to "default"
        left: null,
        right: null,
      },
    },
    right: {
      value: 10,
      state: "default",
      left: null,
      right: {
        value: 14,
        state: "default",
        left: null,
        right: null,
      },
    },
  },
  name: "Step 4: State changes only",
  animationHints: [
    {
      type: "nodeStateChange",
      metadata: { nodeId: "node-root-8", from: "default", to: "active" },
      duration: 300,
    },
    {
      type: "nodeStateChange",
      metadata: { nodeId: "node-root.L-3", from: "default", to: "visited" },
      duration: 300,
      delay: 100,
    },
  ],
};

// This reconciliation will preserve all node IDs since the tree structure is the same
currentTree = reconcileBinaryTree(currentTree, step4);
console.log("Step 4 applied (only state changes):", currentTree);

// Example 6: How the system handles different scenarios

// Scenario A: Same tree structure, different states
// Result: All nodes keep their existing IDs → DOM elements are reused

// Scenario B: Adding a new node
// Result: Existing nodes keep their IDs, new node gets a new ID

// Scenario C: Removing a node
// Result: Remaining nodes keep their IDs, removed node's DOM element is removed

// Scenario D: Changing a node's value
// Result: Node gets a new ID because it's considered a different node

// Scenario E: Restructuring the tree
// Result: Nodes in the same positions keep their IDs, moved nodes get new IDs

export {
  step1,
  step2,
  step3,
  step4,
};
