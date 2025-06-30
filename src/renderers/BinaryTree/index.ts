/**
 * Binary Tree Renderer
 * 
 * A generic renderer for binary tree data structures that works with the
 * time-machine architecture. Provides visualization, animation, and interaction
 * capabilities that can be extended by specific tree types (BST, AVL, etc.).
 */

// Core types
export * from './types';

// BST Operation Controller
export { BSTOperationController } from './BSTOperationController';

// Algorithms
export * from './algorithms';

// Examples and validation
export * from './examples';

// Configuration
export * from './config';

// Components
export { BinaryTreeVisualizer } from './components/BinaryTreeVisualizer';
export { BSTOperationsMenu } from './components/BSTOperationsMenu';
export { BSTOperationControls } from './components/BSTOperationControls';

// Provider
export { BSTProvider, useBST } from './BSTProvider';
// export { createBSTProvider } from './provider';
// export * from './components';
