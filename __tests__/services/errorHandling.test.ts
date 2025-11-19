import {
  parseError,
  getErrorMessage,
  isRetryableError,
  createErrorResponse,
  logError,
  ErrorCode,
  AppError,
  retryWithBackoff,
} from "../../src/utils/errorHandling";
import logger from "../../src/services/logger";

jest.mock("../../src/services/logger");

describe("errorHandling utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ErrorCode enum", () => {
    it("should have all expected error codes", () => {
      expect(ErrorCode.INVALID_CREDENTIALS).toBeTruthy();
      expect(ErrorCode.TOKEN_EXPIRED).toBeTruthy();
      expect(ErrorCode.NETWORK_ERROR).toBeTruthy();
      expect(ErrorCode.CARD_GENERATION_FAILED).toBeTruthy();
      expect(ErrorCode.UNKNOWN_ERROR).toBeTruthy();
    });
  });

  describe("AppError class", () => {
    it("should create error with all properties", () => {
      const error = new AppError(
        ErrorCode.INVALID_CREDENTIALS,
        "Invalid email or password",
        { email: "test@example.com" },
        true
      );

      expect(error.code).toBe(ErrorCode.INVALID_CREDENTIALS);
      expect(error.message).toBe("Invalid email or password");
      expect(error.details).toEqual({ email: "test@example.com" });
      expect(error.retryable).toBe(true);
    });

    it("should have default retryable as false", () => {
      const error = new AppError(ErrorCode.INVALID_CREDENTIALS, "Test error");

      expect(error.retryable).toBe(false);
    });
  });

  describe("parseError", () => {
    it("should parse auth error from message", () => {
      const error = new Error("Invalid credentials");

      const parsed = parseError(error);

      expect(parsed.code).toBe(ErrorCode.INVALID_CREDENTIALS);
      expect(parsed.retryable).toBe(false);
    });

    it("should parse token expired error", () => {
      const error = new Error("Token has expired");

      const parsed = parseError(error);

      expect(parsed.code).toBe(ErrorCode.TOKEN_EXPIRED);
      expect(parsed.retryable).toBe(true);
    });

    it("should parse network error", () => {
      const error = new Error("Network request failed");

      const parsed = parseError(error);

      expect(parsed.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(parsed.retryable).toBe(true);
    });

    it("should parse timeout error", () => {
      const error = new Error("Request timeout");

      const parsed = parseError(error);

      expect(parsed.code).toBe(ErrorCode.API_TIMEOUT);
      expect(parsed.retryable).toBe(true);
    });

    it("should parse Gemini API error", () => {
      const error = new Error("Gemini API rate limit exceeded");

      const parsed = parseError(error);

      expect(parsed.code).toBe(ErrorCode.GEMINI_API_ERROR);
      expect(parsed.retryable).toBe(true);
    });

    it("should parse OCR error", () => {
      const error = new Error("Failed to extract text from image");

      const parsed = parseError(error);

      expect(parsed.code).toBe(ErrorCode.OCR_FAILED);
    });

    it("should parse database error", () => {
      const error = new Error("Database connection failed");

      const parsed = parseError(error);

      expect(parsed.code).toBe(ErrorCode.DATABASE_ERROR);
      expect(parsed.retryable).toBe(true);
    });

    it("should return UNKNOWN_ERROR for unrecognized error", () => {
      const error = new Error(
        "Some weird error that does not match any pattern"
      );

      const parsed = parseError(error);

      expect(parsed.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });

    it("should handle string errors", () => {
      const error = "Network error";

      const parsed = parseError(error);

      expect(parsed.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(parsed.message).toContain("Network error");
    });

    it("should preserve existing AppError", () => {
      const appError = new AppError(
        ErrorCode.INVALID_INPUT,
        "Invalid input",
        {},
        false
      );

      const parsed = parseError(appError);

      expect(parsed).toEqual(appError);
    });

    it("should extract details from error object", () => {
      const error = {
        message: "Invalid credentials",
        field: "email",
      };

      const parsed = parseError(error);

      expect(parsed.message).toContain("Invalid credentials");
    });
  });

  describe("getErrorMessage", () => {
    it("should return user-friendly message for INVALID_CREDENTIALS", () => {
      const message = getErrorMessage(ErrorCode.INVALID_CREDENTIALS);

      expect(message).toContain("email");
      expect(message).toContain("password");
      expect(message).not.toContain("code");
    });

    it("should return message for TOKEN_EXPIRED", () => {
      const message = getErrorMessage(ErrorCode.TOKEN_EXPIRED);

      expect(message).toContain("login");
      expect(message.length).toBeGreaterThan(0);
    });

    it("should return message for NETWORK_ERROR", () => {
      const message = getErrorMessage(ErrorCode.NETWORK_ERROR);

      expect(message).toContain("connection");
      expect(message.length).toBeGreaterThan(0);
    });

    it("should return message for CARD_GENERATION_FAILED", () => {
      const message = getErrorMessage(ErrorCode.CARD_GENERATION_FAILED);

      expect(message.length).toBeGreaterThan(0);
    });

    it("should return generic message for UNKNOWN_ERROR", () => {
      const message = getErrorMessage(ErrorCode.UNKNOWN_ERROR);

      expect(message.length).toBeGreaterThan(0);
    });

    it("should return user-friendly message for API_TIMEOUT", () => {
      const message = getErrorMessage(ErrorCode.API_TIMEOUT);

      expect(message.length).toBeGreaterThan(0);
      expect(message.toLowerCase()).toContain("time");
    });

    it("should all error codes have messages", () => {
      const codes = Object.values(ErrorCode);

      codes.forEach((code) => {
        const message = getErrorMessage(code);
        expect(message).toBeTruthy();
        expect(message.length).toBeGreaterThan(0);
      });
    });
  });

  describe("isRetryableError", () => {
    it("should return true for retryable errors", () => {
      const error = new AppError(
        ErrorCode.NETWORK_ERROR,
        "Network error",
        {},
        true
      );

      const result = isRetryableError(error);

      expect(result).toBe(true);
    });

    it("should return false for non-retryable errors", () => {
      const error = new AppError(
        ErrorCode.INVALID_CREDENTIALS,
        "Invalid credentials",
        {},
        false
      );

      const result = isRetryableError(error);

      expect(result).toBe(false);
    });

    it("should return true for NETWORK_ERROR by default", () => {
      const error = new AppError(ErrorCode.NETWORK_ERROR, "Network error");

      const result = isRetryableError(error);

      expect(result).toBe(true);
    });

    it("should return true for API_TIMEOUT by default", () => {
      const error = new AppError(ErrorCode.API_TIMEOUT, "Timeout");

      const result = isRetryableError(error);

      expect(result).toBe(true);
    });

    it("should return false for INVALID_INPUT", () => {
      const error = new AppError(ErrorCode.INVALID_INPUT, "Invalid input");

      const result = isRetryableError(error);

      expect(result).toBe(false);
    });
  });

  describe("createErrorResponse", () => {
    it("should create standard error response object", () => {
      const error = new AppError(
        ErrorCode.NETWORK_ERROR,
        "Network failed",
        {},
        true
      );

      const response = createErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error).toBeTruthy();
      expect(response.error.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(response.error.message).toBe("Network failed");
      expect(response.timestamp).toBeTruthy();
    });

    it("should include error details in response", () => {
      const details = { endpoint: "/api/decks" };
      const error = new AppError(ErrorCode.API_TIMEOUT, "Timeout", details);

      const response = createErrorResponse(error);

      expect(response.error.details).toEqual(details);
    });

    it("should include timestamp in ISO format", () => {
      const error = new AppError(ErrorCode.UNKNOWN_ERROR, "Error");

      const response = createErrorResponse(error);

      expect(response.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should handle AppError with all properties", () => {
      const error = new AppError(
        ErrorCode.CARD_GENERATION_FAILED,
        "Failed to generate",
        { ocrText: "truncated..." },
        true
      );

      const response = createErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.CARD_GENERATION_FAILED);
      expect(response.error.message).toBe("Failed to generate");
      expect(response.error.details).toEqual({ ocrText: "truncated..." });
    });
  });

  describe("logError", () => {
    it("should call logger with error details", () => {
      const error = new AppError(ErrorCode.NETWORK_ERROR, "Network failed", {
        url: "/api/test",
      });

      logError(error, "TEST_CONTEXT");

      expect(logger.error).toHaveBeenCalled();
    });

    it("should include context in log", () => {
      const error = new AppError(ErrorCode.INVALID_INPUT, "Invalid input");

      logError(error, "SIGNUP_VALIDATION");

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain("SIGNUP_VALIDATION");
    });

    it("should not log sensitive data (tokens, passwords)", () => {
      const error = new AppError(ErrorCode.NETWORK_ERROR, "Error", {
        password: "secret123",
        token: "token_xyz",
      });

      logError(error, "AUTH_CONTEXT");

      expect(logger.error).toHaveBeenCalled();
      const callArgs = (logger.error as jest.Mock).mock.calls[0];
      expect(callArgs[0]).not.toContain("secret123");
      expect(callArgs[0]).not.toContain("token_xyz");
    });

    it("should handle errors without details", () => {
      const error = new AppError(ErrorCode.UNKNOWN_ERROR, "Unknown error");

      expect(() => {
        logError(error, "CONTEXT");
      }).not.toThrow();
    });
  });

  describe("retryWithBackoff", () => {
    it("should retry function with exponential backoff", async () => {
      let attemptCount = 0;
      const mockFn = jest.fn(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error("Network error");
        }
        return "success";
      });

      const result = await retryWithBackoff(mockFn, 3, 10);

      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it("should increase delay exponentially between retries", async () => {
      jest.useFakeTimers();
      let attemptCount = 0;

      const mockFn = jest.fn(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error("Network error");
        }
        return "success";
      });

      const promise = retryWithBackoff(mockFn, 3, 100);

      // First call happens immediately
      expect(mockFn).toHaveBeenCalledTimes(1);

      // Wait for first retry (100ms)
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(mockFn).toHaveBeenCalledTimes(2);

      // Wait for second retry (200ms = 100 * 2)
      jest.advanceTimersByTime(200);
      await Promise.resolve();
      expect(mockFn).toHaveBeenCalledTimes(3);

      await promise;

      jest.useRealTimers();
    });

    it("should throw error after max retries", async () => {
      const mockFn = jest.fn(async () => {
        throw new Error("Persistent error");
      });

      expect(async () => {
        await retryWithBackoff(mockFn, 2, 10);
      }).rejects.toThrow();

      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("should return value on first success", async () => {
      const mockFn = jest.fn(async () => "immediate success");

      const result = await retryWithBackoff(mockFn, 3, 10);

      expect(result).toBe("immediate success");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should handle non-retryable errors immediately", async () => {
      const appError = new AppError(
        ErrorCode.INVALID_INPUT,
        "Invalid",
        {},
        false
      );
      const mockFn = jest.fn(async () => {
        throw appError;
      });

      expect(async () => {
        await retryWithBackoff(mockFn, 3, 10);
      }).rejects.toThrow();

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should respect max retries with retryable errors", async () => {
      const appError = new AppError(
        ErrorCode.NETWORK_ERROR,
        "Network error",
        {},
        true
      );
      const mockFn = jest.fn(async () => {
        throw appError;
      });

      expect(async () => {
        await retryWithBackoff(mockFn, 2, 10);
      }).rejects.toThrow();

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete error flow: parse → log → create response", () => {
      const originalError = new Error("Network request failed");

      const parsed = parseError(originalError);
      logError(parsed, "API_CALL");
      const response = createErrorResponse(parsed);

      expect(parsed.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(logger.error).toHaveBeenCalled();
      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.NETWORK_ERROR);
    });

    it("should handle retry decision: check isRetryableError before retrying", async () => {
      const nonRetryableError = new AppError(
        ErrorCode.INVALID_CREDENTIALS,
        "Invalid credentials",
        {},
        false
      );

      const canRetry = isRetryableError(nonRetryableError);

      expect(canRetry).toBe(false);
    });

    it("should handle timeout with retry", async () => {
      jest.useFakeTimers();
      let attemptCount = 0;

      const mockFn = jest.fn(async () => {
        attemptCount++;
        if (attemptCount < 2) {
          throw parseError(new Error("Request timeout"));
        }
        return { success: true };
      });

      const promise = retryWithBackoff(mockFn, 2, 50);

      jest.advanceTimersByTime(50);
      await Promise.resolve();

      const result = await promise;

      expect(result.success).toBe(true);
      expect(mockFn).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });
});
