import type { BinaryTreeNode } from './types/binary-tree-node.js';

/**
 * Example Binary Tree states from the specification document
 * These demonstrate the declarative state system in action
 */
export const binaryTreeExamples = {
  /**
   * Search operation example: Finding value 5 in tree [4, 2, 6, 5]
   */
  searchExample: [
    // Step 1: Initial state
    {
      value: 4,
      state: "default" as const,
      traversalDirection: null,
      left: {
        value: 2,
        state: "default" as const,
        traversalDirection: null,
        left: null,
        right: null
      },
      right: {
        value: 6,
        state: "default" as const,
        traversalDirection: null,
        left: {
          value: 5,
          state: "default" as const,
          traversalDirection: null,
          left: null,
          right: null
        },
        right: null
      }
    },
    
    // Step 2: Compare with root (4 < 5, go right)
    {
      value: 4,
      state: "active" as const,
      traversalDirection: "right" as const,
      left: {
        value: 2,
        state: "default" as const,
        traversalDirection: null,
        left: null,
        right: null
      },
      right: {
        value: 6,
        state: "default" as const,
        traversalDirection: null,
        left: {
          value: 5,
          state: "default" as const,
          traversalDirection: null,
          left: null,
          right: null
        },
        right: null
      }
    },
    
    // Step 3: Move to node 6 (6 > 5, go left)
    {
      value: 4,
      state: "default" as const,
      traversalDirection: null,
      left: {
        value: 2,
        state: "default" as const,
        traversalDirection: null,
        left: null,
        right: null
      },
      right: {
        value: 6,
        state: "active" as const,
        traversalDirection: "left" as const,
        left: {
          value: 5,
          state: "default" as const,
          traversalDirection: null,
          left: null,
          right: null
        },
        right: null
      }
    },
    
    // Step 4: Found target!
    {
      value: 4,
      state: "default" as const,
      traversalDirection: null,
      left: {
        value: 2,
        state: "default" as const,
        traversalDirection: null,
        left: null,
        right: null
      },
      right: {
        value: 6,
        state: "default" as const,
        traversalDirection: null,
        left: {
          value: 5,
          state: "selected" as const,
          traversalDirection: null,
          left: null,
          right: null
        },
        right: null
      }
    }
  ] as BinaryTreeNode[],

  /**
   * Insert operation example: Inserting value 3 into tree [4, 2, 6]
   */
  insertExample: [
    // Step 1: Initial state
    {
      value: 4,
      state: "default" as const,
      traversalDirection: null,
      left: {
        value: 2,
        state: "default" as const,
        traversalDirection: null,
        left: null,
        right: null
      },
      right: {
        value: 6,
        state: "default" as const,
        traversalDirection: null,
        left: null,
        right: null
      }
    },
    
    // Step 2: Navigate to insert location
    {
      value: 4,
      state: "active" as const,
      traversalDirection: "left" as const,
      left: {
        value: 2,
        state: "default" as const,
        traversalDirection: null,
        left: null,
        right: null
      },
      right: {
        value: 6,
        state: "default" as const,
        traversalDirection: null,
        left: null,
        right: null
      }
    },
    
    // Step 3: Navigate to node 2
    {
      value: 4,
      state: "default" as const,
      traversalDirection: null,
      left: {
        value: 2,
        state: "active" as const,
        traversalDirection: "right" as const,
        left: null,
        right: null
      },
      right: {
        value: 6,
        state: "default" as const,
        traversalDirection: null,
        left: null,
        right: null
      }
    },
    
    // Step 4: Insert new node
    {
      value: 4,
      state: "default" as const,
      traversalDirection: null,
      left: {
        value: 2,
        state: "default" as const,
        traversalDirection: null,
        left: null,
        right: {
          value: 3,
          state: "new" as const,
          traversalDirection: null,
          left: null,
          right: null
        }
      },
      right: {
        value: 6,
        state: "default" as const,
        traversalDirection: null,
        left: null,
        right: null
      }
    }
  ] as BinaryTreeNode[],

  /**
   * Delete operation example: Deleting node 2 from tree
   */
  deleteExample: [
    // Step 1: Mark for deletion
    {
      value: 4,
      state: "default" as const,
      traversalDirection: null,
      left: {
        value: 2,
        state: "deleted" as const,
        traversalDirection: null,
        left: null,
        right: null
      },
      right: {
        value: 6,
        state: "default" as const,
        traversalDirection: null,
        left: null,
        right: null
      }
    },
    
    // Step 2: Remove node
    {
      value: 4,
      state: "default" as const,
      traversalDirection: null,
      left: null,
      right: {
        value: 6,
        state: "default" as const,
        traversalDirection: null,
        left: null,
        right: null
      }
    }
  ] as BinaryTreeNode[],

  /**
   * Simple trees for testing
   */
  simpleTree: {
    value: 4,
    state: "default" as const,
    traversalDirection: null,
    left: {
      value: 2,
      state: "default" as const,
      traversalDirection: null,
      left: null,
      right: null
    },
    right: {
      value: 6,
      state: "default" as const,
      traversalDirection: null,
      left: null,
      right: null
    }
  } as BinaryTreeNode,

  /**
   * Empty tree
   */
  emptyTree: null as BinaryTreeNode | null,

  /**
   * Single node tree
   */
  singleNode: {
    value: 10,
    state: "default" as const,
    traversalDirection: null,
    left: null,
    right: null
  } as BinaryTreeNode
};

/**
 * Helper function to get a deep copy of an example
 */
export function getExampleCopy(exampleName: keyof typeof binaryTreeExamples): any {
  const example = binaryTreeExamples[exampleName];
  return JSON.parse(JSON.stringify(example));
}

/**
 * Validate that examples conform to the BinaryTreeNode interface
 */
export function validateExamples(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Validate each example can be stringified and parsed
    Object.entries(binaryTreeExamples).forEach(([name, example]) => {
      try {
        JSON.stringify(example);
      } catch (e) {
        errors.push(`Example ${name} is not JSON serializable: ${e}`);
      }
    });
  } catch (e) {
    errors.push(`Validation failed: ${e}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
