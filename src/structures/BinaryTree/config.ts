import type { BinaryTreeConfig } from './types';
import { DEFAULT_BINARY_TREE_CONFIG } from './types';

/**
 * BST-specific configuration that extends the base binary tree config.
 */
export interface BSTConfig extends BinaryTreeConfig {
  /** BST-specific settings */
  bst: {
    /** Whether to show comparison values during operations */
    showComparisons: boolean;
    
    /** Whether to highlight the path taken during traversal */
    highlightPath: boolean;
    
    /** Whether to show node values */
    showValues: boolean;
    
    /** Whether to validate BST properties after operations */
    validateAfterOperations: boolean;
  };
}

/**
 * Default configuration for BST visualization.
 */
export const DEFAULT_BST_CONFIG: BSTConfig = {
  ...DEFAULT_BINARY_TREE_CONFIG,
  bst: {
    showComparisons: true,
    highlightPath: true,
    showValues: true,
    validateAfterOperations: true,
  },
};

/**
 * Creates a BST config with custom overrides.
 */
export function createBSTConfig(overrides: Partial<BSTConfig> = {}): BSTConfig {
  return {
    ...DEFAULT_BST_CONFIG,
    ...overrides,
    layout: {
      ...DEFAULT_BST_CONFIG.layout,
      ...overrides.layout,
    },
    animation: {
      ...DEFAULT_BST_CONFIG.animation,
      ...overrides.animation,
    },
    colors: {
      ...DEFAULT_BST_CONFIG.colors,
      ...overrides.colors,
    },
    typography: {
      ...DEFAULT_BST_CONFIG.typography,
      ...overrides.typography,
    },
    bst: {
      ...DEFAULT_BST_CONFIG.bst,
      ...overrides.bst,
    },
  };
}
