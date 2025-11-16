/**
 * Application-wide constants
 * Centralized location for magic numbers and strings
 */

// API Constants
export const API_CONSTANTS = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  // Secure Storage (tokens)
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",

  // Async Storage (cache)
  DECKS_CACHE: "decks_cache",
  CARDS_CACHE: "cards_cache",
  SESSIONS_CACHE: "sessions_cache",
  SETTINGS: "user_settings",
  SYNC_QUEUE: "sync_queue",
  LAST_SYNC: "last_sync",
} as const;

// Spaced Repetition Constants
export const SM2_CONSTANTS = {
  MIN_EASE_FACTOR: 1.3,
  MAX_EASE_FACTOR: 2.5,
  DEFAULT_EASE_FACTOR: 2.5,
  EASY_BONUS: 1.3,

  // Intervals in days
  INTERVAL_AGAIN: 1,
  INTERVAL_HARD: 1.2,
  INTERVAL_MEDIUM: 2,
  INTERVAL_EASY: 3,
} as const;

// Card Generation Constants
export const CARD_GENERATION = {
  MIN_CARD_COUNT: 1,
  DEFAULT_CARD_COUNT: 5,
  MAX_CARD_COUNT: 15,
  MIN_OCR_TEXT_LENGTH: 50,
  MAX_OCR_TEXT_LENGTH: 10000,
  GENERATION_TIMEOUT: 30000, // 30 seconds
} as const;

// OCR Constants
export const OCR_CONSTANTS = {
  MIN_TEXT_LENGTH: 50,
  MAX_TEXT_LENGTH: 10000,
  MIN_ALPHANUMERIC_RATIO: 0.5, // 50% of text should be letters/numbers
  SUPPORTED_LANGUAGES: ["en"],
} as const;

// Camera Constants
export const CAMERA_CONSTANTS = {
  IMAGE_QUALITY: 0.8,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
  ASPECT_RATIO: 4 / 3,
} as const;

// Animation Durations (milliseconds)
export const ANIMATION_DURATION = {
  CARD_FLIP: 300,
  CARD_ENTRANCE: 250,
  BUTTON_PRESS: 150,
  PROGRESS_BAR: 300,
  MODAL_SLIDE: 200,
  TOAST_SLIDE: 300,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  MIN_TOUCH_TARGET: 48, // Minimum touch target size (px)
  TOAST_DURATION: 3000, // 3 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  LOADING_DELAY: 300, // Show loading after 300ms
  MODAL_BACKDROP_OPACITY: 0.5,
} as const;

// Validation Constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,

  DECK_TITLE_MIN_LENGTH: 3,
  DECK_TITLE_MAX_LENGTH: 100,

  CARD_QUESTION_MIN_LENGTH: 10,
  CARD_QUESTION_MAX_LENGTH: 500,

  CARD_ANSWER_MIN_LENGTH: 5,
  CARD_ANSWER_MAX_LENGTH: 1000,
} as const;

// Study Session Constants
export const STUDY_SESSION = {
  DEFAULT_SESSION_SIZE: 20, // Cards per session
  MAX_SESSION_DURATION: 3600, // 1 hour in seconds
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  MIN_SESSION_SIZE: 5,
  MAX_SESSION_SIZE: 50,
} as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  AGAIN: "again",
  HARD: "hard",
  MEDIUM: "medium",
  EASY: "easy",
} as const;

// Navigation Routes
export const ROUTES = {
  // Auth Stack
  AUTH: "Auth",
  SIGN_UP: "SignUp",
  LOGIN: "Login",
  PASSWORD_RESET: "PasswordReset",

  // App Stack
  APP: "App",

  // Capture Tab
  CAPTURE: "Capture",
  CAMERA: "Camera",
  OCR_PREVIEW: "OCRPreview",
  CARD_GENERATION: "CardGeneration",
  CARD_REVIEW: "CardReview",

  // Library Tab
  LIBRARY: "Library",
  DECKS_LIST: "DecksList",
  DECK_DETAIL: "DeckDetail",
  STUDY_MODE: "StudyMode",

  // Tutor Tab
  TUTOR: "Tutor",
  TUTOR_CHAT: "TutorChat",

  // Settings Tab
  SETTINGS: "Settings",
  PROFILE: "Profile",
  PREFERENCES: "Preferences",
  HELP: "Help",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Generic
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  NETWORK_ERROR: "Network connection failed. Please check your internet.",

  // Auth
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",

  // Camera/OCR
  CAMERA_PERMISSION: "Camera permission is required to scan textbooks.",
  OCR_FAILED: "Could not read text from image. Please try a clearer photo.",

  // Card Generation
  GENERATION_FAILED: "Failed to generate flashcards. Please try again.",
  INSUFFICIENT_TEXT:
    "Not enough text detected. Please capture a clearer image.",

  // Validation
  INVALID_EMAIL: "Please enter a valid email address.",
  WEAK_PASSWORD:
    "Password must be at least 8 characters with uppercase, lowercase, and number.",
  EMPTY_FIELD: "This field cannot be empty.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CARDS_GENERATED: "Flashcards generated successfully!",
  DECK_CREATED: "Deck created successfully!",
  DECK_UPDATED: "Deck updated successfully!",
  DECK_DELETED: "Deck deleted successfully!",
  SESSION_COMPLETED: "Study session completed!",
  PROFILE_UPDATED: "Profile updated successfully!",
  SYNC_COMPLETED: "Data synced successfully!",
} as const;

// Feature Flags (can be toggled remotely later)
export const FEATURE_FLAGS = {
  ENABLE_CLOUD_SYNC: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_AI_TUTOR: true,
  ENABLE_ANALYTICS: false, // Enable in production
  ENABLE_CRASH_REPORTING: false, // Enable in production
  ENABLE_STREAMING_GENERATION: true,
} as const;

// App Metadata
export const APP_METADATA = {
  NAME: "StudyGenius AI",
  VERSION: "1.0.0",
  BUILD_NUMBER: 1,
  SUPPORT_EMAIL: "support@studygenius.ai",
  PRIVACY_POLICY_URL: "https://studygenius.ai/privacy",
  TERMS_URL: "https://studygenius.ai/terms",
} as const;

// Date Format Strings
export const DATE_FORMATS = {
  FULL_DATE: "PPP", // Dec 16, 2025
  FULL_DATE_TIME: "PPpp", // Dec 16, 2025, 3:45 PM
  SHORT_DATE: "P", // 12/16/2025
  TIME_ONLY: "p", // 3:45 PM
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", // ISO 8601
  DISPLAY_DAY: "EEEE", // Monday
  DISPLAY_MONTH: "MMMM", // December
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Cache Expiry Times (milliseconds)
export const CACHE_EXPIRY = {
  SHORT: 300000, // 5 minutes
  MEDIUM: 1800000, // 30 minutes
  LONG: 86400000, // 24 hours
  PERMANENT: Infinity,
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Gemini API Constants
export const GEMINI_CONSTANTS = {
  MODEL: "gemini-2.0-flash-exp",
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.7,
  TOP_P: 0.9,
} as const;
