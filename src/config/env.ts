import Constants from "expo-constants";

/**
 * Environment configuration with validation
 * Ensures all required environment variables are present
 */

interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  geminiApiKey: string;
  appEnv: "development" | "staging" | "production";
}

/**
 * Validates and retrieves environment variables
 * Throws error if required variables are missing
 */
function validateEnv(): EnvConfig {
  const extra = Constants.expoConfig?.extra;

  const supabaseUrl =
    extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const geminiApiKey = extra?.geminiApiKey || process.env.GEMINI_API_KEY;
  const appEnv =
    extra?.appEnv || process.env.EXPO_PUBLIC_APP_ENV || "development";

  // Validate required variables
  const missing: string[] = [];

  if (!supabaseUrl) missing.push("EXPO_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missing.push("EXPO_PUBLIC_SUPABASE_ANON_KEY");
  if (!geminiApiKey) missing.push("GEMINI_API_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env file and app.config.js"
    );
  }

  // Validate Supabase URL format
  if (!supabaseUrl.startsWith("https://")) {
    throw new Error("EXPO_PUBLIC_SUPABASE_URL must start with https://");
  }

  // Validate environment value
  if (!["development", "staging", "production"].includes(appEnv)) {
    throw new Error(
      "EXPO_PUBLIC_APP_ENV must be development, staging, or production"
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    geminiApiKey,
    appEnv: appEnv as "development" | "staging" | "production",
  };
}

// Export validated environment configuration
export const env = validateEnv();

// Environment helpers
export const isDevelopment = env.appEnv === "development";
export const isStaging = env.appEnv === "staging";
export const isProduction = env.appEnv === "production";

// Feature flags (can be expanded later)
export const featureFlags = {
  enableCloudSync: true,
  enableOfflineMode: true,
  enableAITutor: true,
  enableAnalytics: isProduction,
  enableDebugLogs: isDevelopment || isStaging,
};
