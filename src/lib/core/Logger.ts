/**
 * Structured logging utility for the data structures visualization project.
 * Provides consistent logging with module-specific prefixes, log levels, and
 * automatic dev/prod filtering.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export interface LogContext {
  /** Additional context data to include in the log */
  data?: Record<string, any>;
  /** Error object if applicable */
  error?: Error;
  /** Module-specific metadata */
  module?: string;
  /** Function name where log originated */
  function?: string;
  /** Stack trace depth to include (default: 0) */
  stackDepth?: number;
}

export interface LoggerConfig {
  /** Minimum log level to output */
  level: LogLevel;
  /** Whether to include timestamps */
  includeTimestamp: boolean;
  /** Whether to include stack traces for errors */
  includeStackTrace: boolean;
  /** Maximum depth for object logging */
  maxObjectDepth: number;
  /** Custom formatter for log messages */
  formatter?: (level: LogLevel, message: string, context?: LogContext) => string;
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN,
  includeTimestamp: false,
  includeStackTrace: true,
  maxObjectDepth: 3,
};

/**
 * Logger class for structured logging with module-specific prefixes
 */
export class Logger {
  private readonly moduleName: string;
  private readonly moduleEmoji: string;
  private readonly config: LoggerConfig;
  private static globalConfig: LoggerConfig = DEFAULT_CONFIG;

  constructor(moduleName: string, moduleEmoji: string, config?: Partial<LoggerConfig>) {
    this.moduleName = moduleName;
    this.moduleEmoji = moduleEmoji;
    this.config = { ...Logger.globalConfig, ...config };
  }

  /**
   * Update global logger configuration
   */
  static configure(config: Partial<LoggerConfig>): void {
    Logger.globalConfig = { ...Logger.globalConfig, ...config };
  }

  /**
   * Log debug information (only in development)
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warnings
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log errors
   */
  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Log function entry with parameters
   */
  enter(functionName: string, parameters?: Record<string, any>): void {
    this.debug(`→ ${functionName}`, { 
      function: functionName,
      data: parameters ? { parameters } : undefined
    });
  }

  /**
   * Log function exit with return value
   */
  exit(functionName: string, returnValue?: any): void {
    this.debug(`← ${functionName}`, { 
      function: functionName,
      data: returnValue !== undefined ? { returnValue } : undefined
    });
  }

  /**
   * Log operation progress/steps
   */
  step(step: string, stepNumber?: number, context?: LogContext): void {
    const stepPrefix = stepNumber ? `STEP ${stepNumber}` : 'STEP';
    this.info(`${stepPrefix} - ${step}`, context);
  }

  /**
   * Time a function execution
   */
  time<T>(label: string, fn: () => T): T {
    const start = performance.now();
    this.debug(`⏱️ ${label}: Starting`);
    
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.debug(`⏱️ ${label}: Completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`⏱️ ${label}: Failed after ${duration.toFixed(2)}ms`, { error: error as Error });
      throw error;
    }
  }

  /**
   * Group related log messages
   */
  group(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.group(this.formatMessage(LogLevel.DEBUG, label));
    }
  }

  /**
   * End log group
   */
  groupEnd(): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.groupEnd();
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.config.formatter 
      ? this.config.formatter(level, message, context)
      : this.formatMessage(level, message, context);

    const consoleMethod = this.getConsoleMethod(level);
    
    if (context?.data || context?.error) {
      const additionalData = this.prepareAdditionalData(context);
      consoleMethod(formattedMessage, additionalData);
    } else {
      consoleMethod(formattedMessage);
    }
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  /**
   * Get appropriate console method for log level
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        return console.log;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Format log message with prefix and context
   */
  private formatMessage(_level: LogLevel, message: string, context?: LogContext): string {
    const parts: string[] = [];

    // Add timestamp if enabled
    if (this.config.includeTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    // Add module prefix
    parts.push(`${this.moduleEmoji} ${this.moduleName}:`);

    // Add function name if provided
    if (context?.function) {
      parts.push(`${context.function} -`);
    }

    // Add main message
    parts.push(message);

    return parts.join(' ');
  }

  /**
   * Prepare additional data for logging
   */
  private prepareAdditionalData(context: LogContext): any {
    const data: any = {};

    if (context.data) {
      data.data = this.truncateObject(context.data);
    }

    if (context.error) {
      data.error = {
        message: context.error.message,
        name: context.error.name,
        ...(this.config.includeStackTrace && { stack: context.error.stack })
      };
    }

    if (context.stackDepth && context.stackDepth > 0) {
      const stack = new Error().stack?.split('\n').slice(2, 2 + context.stackDepth);
      data.stackTrace = stack;
    }

    return Object.keys(data).length === 1 ? Object.values(data)[0] : data;
  }

  /**
   * Truncate object to prevent excessive logging
   */
  private truncateObject(obj: any, depth = 0): any {
    if (depth >= this.config.maxObjectDepth) {
      return '[Object: max depth reached]';
    }

    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.length > 10 
        ? [...obj.slice(0, 10), `[...${obj.length - 10} more items]`]
        : obj.map(item => this.truncateObject(item, depth + 1));
    }

    const result: any = {};
    const keys = Object.keys(obj);
    
    for (let i = 0; i < Math.min(keys.length, 20); i++) {
      const key = keys[i];
      result[key] = this.truncateObject(obj[key], depth + 1);
    }

    if (keys.length > 20) {
      result['[truncated]'] = `${keys.length - 20} more properties`;
    }

    return result;
  }
}

/**
 * Factory function to create module-specific loggers
 */
export function createLogger(moduleName: string, moduleEmoji: string, config?: Partial<LoggerConfig>): Logger {
  return new Logger(moduleName, moduleEmoji, config);
}

/**
 * Pre-configured loggers for common modules
 */
export const loggers = {
  renderer: createLogger('BinaryTreeRenderer', '🌳'),
  animation: createLogger('AnimationController', '🎬'),
  visualizer: createLogger('BinaryTreeVisualizer', '🔄'),
  bst: createLogger('BST', '🌲'),
  history: createLogger('HistoryController', '📚'),
  page: createLogger('PageContent', '📄'),
  resize: createLogger('ResizeObserver', '🔍'),
  core: createLogger('Core', '⚙️'),
  build: createLogger('StateBuilder', '🏗️'),
};
