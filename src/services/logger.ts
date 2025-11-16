import {
  logger as rnLogger,
  consoleTransport,
  fileAsyncTransport,
} from "react-native-logs";
import { isDevelopment, isProduction } from "../config/env";
import * as FileSystem from "expo-file-system";

/**
 * Logging Service
 * Structured logging with different levels and transports
 */

// Log levels
type LogLevel = "debug" | "info" | "warn" | "error";

// Configure logger
const config = {
  severity: isDevelopment ? "debug" : "info",
  transport: consoleTransport,
  transportOptions: {
    colors: {
      debug: "blueBright" as const,
      info: "greenBright" as const,
      warn: "yellowBright" as const,
      error: "redBright" as const,
    },
  },
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  async: true,
  dateFormat: "time",
  printLevel: true,
  printDate: true,
  enabled: true,
} as const;

// Create logger instance
const log = rnLogger.createLogger(config);

/**
 * Sanitize data to remove sensitive information
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== "object") {
    return data;
  }

  const sanitized = { ...data };
  const sensitiveKeys = [
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "apiKey",
    "secret",
    "authorization",
    "cookie",
  ];

  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = "***REDACTED***";
    } else if (typeof sanitized[key] === "object") {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });

  return sanitized;
}

/**
 * Format log message
 */
function formatMessage(level: LogLevel, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  const sanitizedData = data ? sanitizeData(data) : undefined;

  let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  if (sanitizedData) {
    formatted += ` ${JSON.stringify(sanitizedData, null, 2)}`;
  }

  return formatted;
}

/**
 * Logger interface
 */
export const logger = {
  /**
   * Debug level - detailed information for debugging
   */
  debug(message: string, data?: any): void {
    if (isDevelopment) {
      const formatted = formatMessage("debug", message, data);
      log.debug(formatted);
    }
  },

  /**
   * Info level - general informational messages
   */
  info(message: string, data?: any): void {
    const formatted = formatMessage("info", message, data);
    log.info(formatted);
  },

  /**
   * Warning level - potentially harmful situations
   */
  warn(message: string, data?: any): void {
    const formatted = formatMessage("warn", message, data);
    log.warn(formatted);
  },

  /**
   * Error level - error events
   */
  error(message: string, data?: any): void {
    const formatted = formatMessage("error", message, data);
    log.error(formatted);
  },

  /**
   * Log API request
   */
  logApiRequest(method: string, url: string, data?: any): void {
    this.info(`API Request: ${method} ${url}`, sanitizeData(data));
  },

  /**
   * Log API response
   */
  logApiResponse(
    method: string,
    url: string,
    status: number,
    data?: any
  ): void {
    const level = status >= 400 ? "error" : "info";
    this[level](
      `API Response: ${method} ${url} [${status}]`,
      sanitizeData(data)
    );
  },

  /**
   * Log navigation event
   */
  logNavigation(from: string, to: string, params?: any): void {
    this.debug(`Navigation: ${from} → ${to}`, sanitizeData(params));
  },

  /**
   * Log user action
   */
  logUserAction(action: string, details?: any): void {
    this.info(`User Action: ${action}`, sanitizeData(details));
  },

  /**
   * Log performance metric
   */
  logPerformance(operation: string, durationMs: number, details?: any): void {
    this.info(`Performance: ${operation} took ${durationMs}ms`, details);
  },

  /**
   * Log app lifecycle event
   */
  logLifecycle(event: string, details?: any): void {
    this.info(`Lifecycle: ${event}`, details);
  },
};

/**
 * Create timed operation logger
 */
export function createTimer(operationName: string) {
  const startTime = Date.now();

  return {
    end(details?: any) {
      const duration = Date.now() - startTime;
      logger.logPerformance(operationName, duration, details);
    },
  };
}

/**
 * Log exception with stack trace
 */
export function logException(error: Error, context?: string): void {
  logger.error(`Exception${context ? ` in ${context}` : ""}`, {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });
}

/**
 * Get log file path (for debugging)
 */
export async function getLogFilePath(): Promise<string | null> {
  try {
    // Construct a default app cache path for logging
    // This is a fallback path if FileSystem doesn't provide directory constants
    return "/logs/app.log";
  } catch {
    return null;
  }
}

/**
 * Clear logs (for privacy)
 */
export async function clearLogs(): Promise<void> {
  try {
    const logPath = await getLogFilePath();
    if (logPath) {
      const fileInfo = await FileSystem.getInfoAsync(logPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(logPath);
        logger.info("Logs cleared");
      }
    }
  } catch (error) {
    logger.error("Failed to clear logs", { error });
  }
}

/**
 * Export logs (for debugging/support)
 */
export async function exportLogs(): Promise<string | null> {
  try {
    const logPath = await getLogFilePath();
    if (!logPath) return null;

    const fileInfo = await FileSystem.getInfoAsync(logPath);
    if (!fileInfo.exists) return null;

    const content = await FileSystem.readAsStringAsync(logPath);
    return content;
  } catch (error) {
    logger.error("Failed to export logs", { error });
    return null;
  }
}

// Export default logger
export default logger;
