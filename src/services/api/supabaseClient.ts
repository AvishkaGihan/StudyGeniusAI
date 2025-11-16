import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "../../config/env";
import { logger } from "../logger";
import {
  getSecureItem,
  setSecureItem,
  removeSecureItem,
} from "../storage/secureStore";
import { STORAGE_KEYS } from "../../utils/constants";

/**
 * Supabase Client Configuration
 * Handles authentication, token management, and database access
 */

// Custom storage implementation for Supabase auth
const authStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await getSecureItem(key);
      return value;
    } catch (error) {
      logger.error("Error getting auth item from secure storage", {
        key,
        error,
      });
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await setSecureItem(key, value);
    } catch (error) {
      logger.error("Error setting auth item in secure storage", { key, error });
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await removeSecureItem(key);
    } catch (error) {
      logger.error("Error removing auth item from secure storage", {
        key,
        error,
      });
    }
  },
};

// Create Supabase client
export const supabase: SupabaseClient = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey,
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-app-version": "1.0.0",
      },
    },
  }
);

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      logger.error("Error getting current user", { error });
      return null;
    }

    return user;
  } catch (error) {
    logger.error("Exception getting current user", { error });
    return null;
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      logger.error("Error getting current session", { error });
      return null;
    }

    return session;
  } catch (error) {
    logger.error("Exception getting current session", { error });
    return null;
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken() {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      logger.error("Error refreshing access token", { error });
      return null;
    }

    if (data.session) {
      logger.info("Access token refreshed successfully");
      return data.session;
    }

    return null;
  } catch (error) {
    logger.error("Exception refreshing access token", { error });
    return null;
  }
}

/**
 * Set up auth state change listener
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    logger.info("Auth state changed", { event, userId: session?.user?.id });
    callback(event, session);
  });

  return subscription;
}

/**
 * Sign out user and clear session
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error("Error signing out", { error });
      return false;
    }

    // Clear tokens from secure storage
    await removeSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
    await removeSecureItem(STORAGE_KEYS.REFRESH_TOKEN);

    logger.info("User signed out successfully");
    return true;
  } catch (error) {
    logger.error("Exception signing out", { error });
    return false;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getCurrentSession();
    return !!session;
  } catch (error) {
    logger.error("Error checking authentication status", { error });
    return false;
  }
}

/**
 * Get access token
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await getCurrentSession();
    return session?.access_token || null;
  } catch (error) {
    logger.error("Error getting access token", { error });
    return null;
  }
}

// Export configured client
export default supabase;
