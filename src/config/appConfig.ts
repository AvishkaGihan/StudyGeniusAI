import { env } from "./env";

/**
 * Application-wide configuration
 * Central place for app constants and settings
 */

export const appConfig = {
  // App Information
  app: {
    name: "StudyGenius AI",
    version: "1.0.0",
    buildNumber: 1,
  },

  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Supabase Configuration
  supabase: {
    url: env.supabaseUrl,
    anonKey: env.supabaseAnonKey,
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },

  // Gemini AI Configuration
  gemini: {
    apiKey: env.geminiApiKey,
    model: "gemini-2.0-flash-exp", // Working model for v1beta API
    defaultCardCount: 5,
    maxCardCount: 15,
    timeout: 30000, // 30 seconds
    streamingEnabled: true,
    maxTokens: 2000, // Maximum output tokens for generation
    temperature: 0.5, // Temperature for generation (0-2, lower = more deterministic)
    topP: 0.95, // Top P for nucleus sampling (0-1)
  },

  // OCR Configuration
  ocr: {
    minTextLength: 50, // Minimum characters for valid OCR
    maxTextLength: 10000, // Maximum characters to process
    languages: ["en"], // Supported languages
  },

  // Card Configuration
  card: {
    minQuestionLength: 10,
    maxQuestionLength: 500,
    minAnswerLength: 5,
    maxAnswerLength: 1000,
  },

  // Study Session Configuration
  studySession: {
    defaultSessionSize: 20, // Number of cards per session
    maxSessionDuration: 3600, // 1 hour in seconds
    autoSaveInterval: 30000, // 30 seconds
  },

  // Spaced Repetition Configuration (SM-2 Algorithm)
  spacedRepetition: {
    minEaseFactor: 1.3,
    maxEaseFactor: 2.5,
    defaultEaseFactor: 2.5,
    easyBonus: 1.3,
    intervals: {
      again: 1, // Review again in 1 day
      hard: 1.2, // Review in 1.2 days
      medium: 2, // Review in 2 days
      easy: 3, // Review in 3 days
    },
  },

  // Storage Configuration
  storage: {
    cacheExpiry: 86400000, // 24 hours in milliseconds
    maxCacheSize: 50, // Maximum number of items to cache
  },

  // Camera Configuration
  camera: {
    quality: 0.8, // Image quality (0-1)
    maxWidth: 1920,
    maxHeight: 1080,
    allowsEditing: true,
  },

  // Offline Sync Configuration
  sync: {
    enabled: true,
    maxQueueSize: 100, // Maximum offline operations to queue
    syncInterval: 60000, // Sync every 60 seconds when online
  },

  // Logging Configuration
  logging: {
    enabled: env.appEnv !== "production",
    levels: {
      debug: env.appEnv === "development",
      info: true,
      warn: true,
      error: true,
    },
  },

  // Animation Configuration
  animation: {
    cardFlipDuration: 300, // milliseconds
    cardEntranceDuration: 250, // milliseconds
    buttonPressDuration: 150, // milliseconds
    progressBarDuration: 300, // milliseconds
  },

  // UI Configuration
  ui: {
    toastDuration: 3000, // 3 seconds
    modalAnimationDuration: 200, // milliseconds
    loadingDebounce: 300, // milliseconds
  },
};

// Type export for TypeScript support
export type AppConfig = typeof appConfig;
