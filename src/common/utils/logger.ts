import { ENVIRONMENT, isDevelopment } from '../configs/environment';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log level numbers for filtering
 */
const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

/**
 * Current configured log level
 */
const CURRENT_LOG_LEVEL =
  (ENVIRONMENT.APP.LOG_LEVEL as LogLevel) ||
  (isDevelopment() ? LogLevel.DEBUG : LogLevel.INFO);

/**
 * Color codes for console output in development
 */
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

/**
 * Base logger interface
 */
interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: unknown, meta?: Record<string, unknown>): void;
}

/**
 * Format log output with timestamp and optional metadata
 */
const formatLogEntry = (
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown> | null,
  error?: Error | null,
): string => {
  const timestamp = new Date().toISOString();

  // Create base log entry
  const logEntry: Record<string, unknown> = {
    level,
    message,
    timestamp,
    ...meta,
  };

  // Add error information if present
  if (error) {
    logEntry.errorName = error.name;
    logEntry.stack = error.stack;
  }

  return isDevelopment()
    ? formatDevLog(level, timestamp, message, meta, error)
    : JSON.stringify(logEntry);
};

/**
 * Format developer-friendly colored logs for local development
 */
const formatDevLog = (
  level: LogLevel,
  timestamp: string,
  message: string,
  meta?: Record<string, unknown> | null,
  error?: Error | null,
): string => {
  let color = COLORS.reset;

  switch (level) {
    case LogLevel.DEBUG:
      color = COLORS.dim;
      break;
    case LogLevel.INFO:
      color = COLORS.blue;
      break;
    case LogLevel.WARN:
      color = COLORS.yellow;
      break;
    case LogLevel.ERROR:
      color = COLORS.red;
      break;
  }

  let output = `${COLORS.dim}${timestamp}${
    COLORS.reset
  } ${color}[${level.toUpperCase()}]${COLORS.reset} ${message}`;

  // Add metadata if available
  if (meta && Object.keys(meta).length > 0) {
    output += `\n${COLORS.dim}Metadata: ${JSON.stringify(meta, null, 2)}${
      COLORS.reset
    }`;
  }

  // Add error stack if available
  if (error && error.stack) {
    output += `\n${COLORS.red}${error.stack}${COLORS.reset}`;
  }

  return output;
};

/**
 * Determine if a log level should be displayed based on current log level
 */
const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[CURRENT_LOG_LEVEL];
};

/**
 * Create a logger instance
 */
export const createLogger = (context = 'app'): Logger => {
  return {
    debug(message: string, meta?: Record<string, unknown>): void {
      if (shouldLog(LogLevel.DEBUG)) {
        console.debug(
          formatLogEntry(LogLevel.DEBUG, `[${context}] ${message}`, meta),
        );
      }
    },

    info(message: string, meta?: Record<string, unknown>): void {
      if (shouldLog(LogLevel.INFO)) {
        console.info(
          formatLogEntry(LogLevel.INFO, `[${context}] ${message}`, meta),
        );
      }
    },

    warn(message: string, meta?: Record<string, unknown>): void {
      if (shouldLog(LogLevel.WARN)) {
        console.warn(
          formatLogEntry(LogLevel.WARN, `[${context}] ${message}`, meta),
        );
      }
    },

    error(
      message: string,
      error?: unknown,
      meta?: Record<string, unknown>,
    ): void {
      if (shouldLog(LogLevel.ERROR)) {
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));
        console.error(
          formatLogEntry(
            LogLevel.ERROR,
            `[${context}] ${message}`,
            meta,
            normalizedError,
          ),
        );
      }
    },
  };
};

/**
 * Default application logger
 */
export const logger = createLogger();
