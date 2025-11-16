/**
 * Error handling utilities
 * Standardized error types, parsing, and user-friendly messages
 */

// Error codes enum
export enum ErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",

  // Card generation errors
  CARD_GENERATION_FAILED = "CARD_GENERATION_FAILED",
  INVALID_OCR_TEXT = "INVALID_OCR_TEXT",
  GEMINI_API_ERROR = "GEMINI_API_ERROR",
  INSUFFICIENT_TEXT = "INSUFFICIENT_TEXT",

  // Network errors
  NETWORK_ERROR = "NETWORK_ERROR",
  API_TIMEOUT = "API_TIMEOUT",
  CONNECTION_FAILED = "CONNECTION_FAILED",

  // Database errors
  DATABASE_ERROR = "DATABASE_ERROR",
  RECORD_NOT_FOUND = "RECORD_NOT_FOUND",
  DUPLICATE_RECORD = "DUPLICATE_RECORD",

  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",

  // Camera/OCR errors
  CAMERA_PERMISSION_DENIED = "CAMERA_PERMISSION_DENIED",
  OCR_FAILED = "OCR_FAILED",
  IMAGE_PROCESSING_ERROR = "IMAGE_PROCESSING_ERROR",

  // Storage errors
  STORAGE_ERROR = "STORAGE_ERROR",
  CACHE_ERROR = "CACHE_ERROR",

  // Unknown/Generic
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// App error class
export class AppError extends Error {
  code: ErrorCode;
  details?: Record<string, any>;
  retryable: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, any>,
    retryable: boolean = false
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
    this.retryable = retryable;
  }
}

/**
 * Parses unknown error into AppError
 */
export function parseError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Standard Error
  if (error instanceof Error) {
    // Check for specific error patterns
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes("network") || message.includes("fetch")) {
      return new AppError(
        ErrorCode.NETWORK_ERROR,
        "Network connection failed. Please check your internet connection.",
        { originalError: error.message },
        true
      );
    }

    // Timeout errors
    if (message.includes("timeout")) {
      return new AppError(
        ErrorCode.API_TIMEOUT,
        "Request timed out. Please try again.",
        { originalError: error.message },
        true
      );
    }

    // Auth errors
    if (message.includes("unauthorized") || message.includes("401")) {
      return new AppError(
        ErrorCode.PERMISSION_DENIED,
        "You are not authorized. Please log in again.",
        { originalError: error.message },
        false
      );
    }

    // Default to unknown error
    return new AppError(
      ErrorCode.UNKNOWN_ERROR,
      error.message || "An unexpected error occurred",
      { originalError: error.message },
      false
    );
  }

  // String error
  if (typeof error === "string") {
    return new AppError(ErrorCode.UNKNOWN_ERROR, error, undefined, false);
  }

  // Object with message
  if (error && typeof error === "object" && "message" in error) {
    return new AppError(
      ErrorCode.UNKNOWN_ERROR,
      String((error as any).message),
      error as Record<string, any>,
      false
    );
  }

  // Completely unknown
  return new AppError(
    ErrorCode.UNKNOWN_ERROR,
    "An unexpected error occurred",
    { error },
    false
  );
}

/**
 * Converts error code to user-friendly message
 */
export function getErrorMessage(
  code: ErrorCode,
  defaultMessage?: string
): string {
  const messages: Record<ErrorCode, string> = {
    // Auth
    [ErrorCode.INVALID_CREDENTIALS]:
      "Invalid email or password. Please try again.",
    [ErrorCode.TOKEN_EXPIRED]: "Your session has expired. Please log in again.",
    [ErrorCode.PERMISSION_DENIED]:
      "You do not have permission to perform this action.",
    [ErrorCode.USER_NOT_FOUND]: "User account not found.",
    [ErrorCode.EMAIL_ALREADY_EXISTS]:
      "An account with this email already exists.",

    // Card generation
    [ErrorCode.CARD_GENERATION_FAILED]:
      "Failed to generate flashcards. Please try again.",
    [ErrorCode.INVALID_OCR_TEXT]:
      "Could not extract valid text from the image.",
    [ErrorCode.GEMINI_API_ERROR]:
      "AI service is temporarily unavailable. Please try again.",
    [ErrorCode.INSUFFICIENT_TEXT]:
      "Not enough text detected. Please capture a clearer image.",

    // Network
    [ErrorCode.NETWORK_ERROR]:
      "Network connection failed. Please check your internet.",
    [ErrorCode.API_TIMEOUT]: "Request timed out. Please try again.",
    [ErrorCode.CONNECTION_FAILED]:
      "Could not connect to server. Please try again later.",

    // Database
    [ErrorCode.DATABASE_ERROR]: "Database error occurred. Please try again.",
    [ErrorCode.RECORD_NOT_FOUND]: "The requested item was not found.",
    [ErrorCode.DUPLICATE_RECORD]: "This item already exists.",

    // Validation
    [ErrorCode.VALIDATION_ERROR]: "Invalid input. Please check your data.",
    [ErrorCode.INVALID_INPUT]: "Some fields contain invalid information.",

    // Camera/OCR
    [ErrorCode.CAMERA_PERMISSION_DENIED]:
      "Camera permission denied. Please enable it in settings.",
    [ErrorCode.OCR_FAILED]:
      "Could not read text from image. Please try a clearer photo.",
    [ErrorCode.IMAGE_PROCESSING_ERROR]:
      "Failed to process image. Please try again.",

    // Storage
    [ErrorCode.STORAGE_ERROR]: "Storage error occurred. Please try again.",
    [ErrorCode.CACHE_ERROR]:
      "Cache error occurred. The app may be slower than usual.",

    // Unknown
    [ErrorCode.UNKNOWN_ERROR]:
      "An unexpected error occurred. Please try again.",
  };

  return (
    messages[code] || defaultMessage || "An error occurred. Please try again."
  );
}

/**
 * Logs error with context (for debugging)
 */
export function logError(error: AppError, context?: string): void {
  const timestamp = new Date().toISOString();

  console.error(`[${timestamp}] Error${context ? ` in ${context}` : ""}:`, {
    code: error.code,
    message: error.message,
    details: error.details,
    retryable: error.retryable,
    stack: error.stack,
  });
}

/**
 * Determines if error is retryable (network, timeout, etc.)
 */
export function isRetryableError(error: AppError): boolean {
  return error.retryable;
}

/**
 * Creates standardized API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

export function createErrorResponse(error: AppError): ApiErrorResponse {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handles async function with error catching
 */
export async function handleAsync<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await fn();
    return { data };
  } catch (err) {
    const error = parseError(err);
    if (context) {
      logError(error, context);
    }
    return { error };
  }
}

/**
 * Retry logic for retryable errors
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: AppError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = parseError(err);

      // Don't retry if error is not retryable
      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      // Don't wait after last attempt
      if (attempt < maxRetries - 1) {
        // Exponential backoff
        const delay = delayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  throw (
    lastError ||
    new AppError(ErrorCode.UNKNOWN_ERROR, "All retry attempts failed")
  );
}
