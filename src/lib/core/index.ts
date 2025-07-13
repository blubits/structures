/**
 * Core Framework for Data Structure Visualization
 * 
 * This module provides the generic, time-machine-based architecture that can
 * support any data structure. It includes the operation history controller,
 * animation system, and React hooks for building reactive visualizations.
 */

// Utilities
export { Logger, LogLevel, createLogger, loggers } from './Logger';
export type { LogContext, LoggerConfig } from './Logger';

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
