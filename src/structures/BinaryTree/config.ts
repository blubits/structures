import type { BinaryTreeConfig } from '@structures/BinaryTree/types';
import { DEFAULT_BINARY_TREE_CONFIG } from '@structures/BinaryTree/types';

/**
 * Default durations (in ms) for 1x speed.
 */
export const DEFAULT_ANIMATION_DURATION = 600; // ms, adjust as needed
export const DEFAULT_AUTOPLAY_INTERVAL = 1200; // ms, adjust as needed

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
    
    /** Animation speed multiplier (0.25x to 2x, step 0.25, 1x = normal) */
    animationSpeed: number;
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
    animationSpeed: 1, // 1x normal speed
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
