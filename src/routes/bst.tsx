import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import BSTVisualizer from "../components/BSTVisualizer";
import type { BSTNode } from "../components/BSTVisualizer";

export const Route = createFileRoute('/bst')({
  component: BSTPage,
});

const initialBstData: BSTNode = {
  value: 8,
  left: {
    value: 3,
    left: { value: 1 },
    right: {
      value: 6,
      left: { value: 4 },
      right: { value: 7 },
    },
  },
  right: {
    value: 10,
    right: {
      value: 14,
      left: { value: 13 },
    },
  },
};

// Helper function to insert a value into BST
function insertIntoBST(root: BSTNode | undefined, value: number): BSTNode {
  if (!root) {
    return { value };
  }
  
  if (value < root.value) {
    root.left = insertIntoBST(root.left, value);
  } else if (value > root.value) {
    root.right = insertIntoBST(root.right, value);
  }
  // If value equals root.value, don't insert (no duplicates)
  
  return root;
}

// Helper function to generate random number not already in tree
function generateRandomValue(existingValues: Set<number>): number {
  let value: number;
  do {
    value = Math.floor(Math.random() * 50) + 1; // Random number 1-50
  } while (existingValues.has(value));
  return value;
}

// Helper function to collect all values in the tree
function collectValues(node: BSTNode | undefined, values: Set<number> = new Set()): Set<number> {
  if (!node) return values;
  values.add(node.value);
  collectValues(node.left, values);
  collectValues(node.right, values);
  return values;
}

function BSTPage() {
  const [bstData, setBstData] = useState<BSTNode>(initialBstData);

  const handleInsertRandom = () => {
    const existingValues = collectValues(bstData);
    const newValue = generateRandomValue(existingValues);
    const newTree = JSON.parse(JSON.stringify(bstData)); // Deep copy
    setBstData(insertIntoBST(newTree, newValue));
  };

  const handleReset = () => {
    setBstData(JSON.parse(JSON.stringify(initialBstData))); // Deep copy
  };

  return (
    <div className="relative w-full h-screen bg-white dark:bg-zinc-900 transition-colors overflow-hidden">
      {/* White fade overlay for sidebar edge (Tailwind) */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-20 z-20 bg-gradient-to-r from-white to-white/0 dark:from-zinc-900 dark:to-zinc-900/0"
      />
      {/* Floating action buttons */}
      <div className="absolute top-6 left-6 z-30 flex space-x-4">
        <button
          onClick={handleInsertRandom}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg backdrop-blur-sm"
        >
          Insert Random Value
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors shadow-lg backdrop-blur-sm"
        >
          Reset Tree
        </button>
      </div>
      {/* Full-screen BST visualizer */}
      <BSTVisualizer data={bstData} />
    </div>
  );
}

