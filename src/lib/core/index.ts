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
export { HistoryController } from './History';

// Animation system
export { AnimationController } from './AnimationController';
export type { 
  GenericAnimationContext,
  GenericAnimationFunction,
  VisualizationAnimationConfig,
  AnimationRegistration as GenericAnimationRegistration
} from './AnimationController';

// React hooks
export * from './hooks/useHistory';
