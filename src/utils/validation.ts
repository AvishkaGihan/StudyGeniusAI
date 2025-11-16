import { appConfig } from "../config/appConfig";

/**
 * Validation utilities for user inputs and data
 */

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation regex (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Validates email format
 */
export function validateEmail(email: string): {
  valid: boolean;
  error?: string;
} {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: "Email is required" };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (!password || password.length === 0) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      error: "Password must contain uppercase, lowercase, and number",
    };
  }

  return { valid: true };
}

/**
 * Validates OCR extracted text
 */
export function validateOCRText(text: string): {
  valid: boolean;
  error?: string;
} {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: "No text detected. Please retake the photo" };
  }

  const trimmedText = text.trim();

  if (trimmedText.length < appConfig.ocr.minTextLength) {
    return {
      valid: false,
      error: `Text too short. Need at least ${appConfig.ocr.minTextLength} characters`,
    };
  }

  if (trimmedText.length > appConfig.ocr.maxTextLength) {
    return {
      valid: false,
      error: `Text too long. Maximum ${appConfig.ocr.maxTextLength} characters`,
    };
  }

  // Check if text is mostly gibberish (too many non-alphanumeric characters)
  const alphanumericCount = (trimmedText.match(/[a-zA-Z0-9]/g) || []).length;
  const alphanumericRatio = alphanumericCount / trimmedText.length;

  if (alphanumericRatio < 0.5) {
    return {
      valid: false,
      error: "Text quality too low. Please retake photo with better lighting",
    };
  }

  return { valid: true };
}

/**
 * Validates flashcard question
 */
export function validateQuestion(question: string): {
  valid: boolean;
  error?: string;
} {
  if (!question || question.trim().length === 0) {
    return { valid: false, error: "Question cannot be empty" };
  }

  const trimmedQuestion = question.trim();

  if (trimmedQuestion.length < appConfig.card.minQuestionLength) {
    return {
      valid: false,
      error: `Question too short. Need at least ${appConfig.card.minQuestionLength} characters`,
    };
  }

  if (trimmedQuestion.length > appConfig.card.maxQuestionLength) {
    return {
      valid: false,
      error: `Question too long. Maximum ${appConfig.card.maxQuestionLength} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validates flashcard answer
 */
export function validateAnswer(answer: string): {
  valid: boolean;
  error?: string;
} {
  if (!answer || answer.trim().length === 0) {
    return { valid: false, error: "Answer cannot be empty" };
  }

  const trimmedAnswer = answer.trim();

  if (trimmedAnswer.length < appConfig.card.minAnswerLength) {
    return {
      valid: false,
      error: `Answer too short. Need at least ${appConfig.card.minAnswerLength} characters`,
    };
  }

  if (trimmedAnswer.length > appConfig.card.maxAnswerLength) {
    return {
      valid: false,
      error: `Answer too long. Maximum ${appConfig.card.maxAnswerLength} characters`,
    };
  }

  return { valid: true };
}

/**
 * Validates deck title
 */
export function validateDeckTitle(title: string): {
  valid: boolean;
  error?: string;
} {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: "Deck title is required" };
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length < 3) {
    return { valid: false, error: "Deck title must be at least 3 characters" };
  }

  if (trimmedTitle.length > 100) {
    return {
      valid: false,
      error: "Deck title must be less than 100 characters",
    };
  }

  return { valid: true };
}

/**
 * Validates card count for generation
 */
export function validateCardCount(count: number): {
  valid: boolean;
  error?: string;
} {
  if (!Number.isInteger(count)) {
    return { valid: false, error: "Card count must be a whole number" };
  }

  if (count < 1) {
    return { valid: false, error: "Must generate at least 1 card" };
  }

  if (count > appConfig.gemini.maxCardCount) {
    return {
      valid: false,
      error: `Cannot generate more than ${appConfig.gemini.maxCardCount} cards at once`,
    };
  }

  return { valid: true };
}

/**
 * Sanitizes user input (removes potentially dangerous characters)
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
}

/**
 * Validates if string is valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates if value is a valid difficulty level
 */
export function isValidDifficulty(difficulty: string): boolean {
  return ["easy", "medium", "hard"].includes(difficulty.toLowerCase());
}
