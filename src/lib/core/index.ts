/**
 * Core Framework for Data Structure Visualization
 * 
 * This module provides the generic, time-machine-based architecture that can
 * support any data structure. It includes the operation history controller,
 * animation system, and React hooks for building reactive visualizations.
 */

// Core types and interfaces
export * from './types';

// Controllers
export { OperationHistoryController } from './OperationHistoryController';
export { DataStructureOperationController } from './DataStructureOperationController';

// Animation system
export { AnimationController } from './AnimationController';

// React hooks
export * from './hooks/useDataStructureController';
