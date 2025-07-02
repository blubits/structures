/**
 * Binary Tree Renderer
 * 
 * A generic renderer for binary tree data structures that works with the
 * time-machine architecture. Provides visualization, animation, and interaction
 * capabilities that can be extended by specific tree types (BST, AVL, etc.).
 */

// Core types
export * from './types';

// Generic algorithms (shared across all binary tree types)
export * from './algorithms';

// Examples and validation
export * from './examples';

// Configuration
export * from './config';

// Generic Binary Tree Components
export { BinaryTreeVisualizer } from './components/BinaryTreeVisualizer';

// BST-specific exports (re-exported from BST subdirectory)
export * from './BST';
