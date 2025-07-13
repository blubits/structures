/**
 * Binary Tree Renderer
 * 
 * A generic renderer for binary tree data structures that works with the
 * time-machine architecture. Provides visualization, animation, and interaction
 * capabilities that can be extended by specific tree types (BST, AVL, etc.).
 */

// Core types
export * from '@structures/BinaryTree/types';

// Configuration
export * from '@structures/BinaryTree/config';

// Generic Binary Tree Components
export { BinaryTreeVisualizer } from '@structures/BinaryTree/components/BinaryTreeVisualizer';

// Animation registration and helpers
export { registerBinaryTreeAnimations, processBinaryTreeAnimations } from '@structures/BinaryTree/animations';

// Renderer
export { renderBinaryTree } from '@structures/BinaryTree/renderer';

// BST-specific exports (re-exported from BST subdirectory)
