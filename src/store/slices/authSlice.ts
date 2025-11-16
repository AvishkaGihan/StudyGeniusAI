import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthState } from "../../utils/types";
import * as authApi from "../../services/api/authApi";
import {
  storeAuthTokens,
  clearAuthTokens,
} from "../../services/storage/secureStore";
import { logger } from "../../services/logger";

/**
 * Auth Slice
 * Manages authentication state (user, tokens, loading)
 */

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks

/**
 * Sign up new user
 */
export const signUp = createAsyncThunk(
  "auth/signUp",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      logger.logUserAction("signup_attempt", { email });

      const response = await authApi.signUp({ email, password });

      if (!response.success || !response.data) {
        return rejectWithValue(response.error?.message || "Signup failed");
      }

      // Store tokens securely
      await storeAuthTokens(response.data.token, response.data.refreshToken);

      logger.logUserAction("signup_success", { userId: response.data.user.id });

      return response.data;
    } catch (error) {
      logger.error("Signup failed", { error });
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

/**
 * Log in existing user
 */
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      logger.logUserAction("login_attempt", { email });

      const response = await authApi.login({ email, password });

      if (!response.success || !response.data) {
        return rejectWithValue(response.error?.message || "Login failed");
      }

      // Store tokens securely
      await storeAuthTokens(response.data.token, response.data.refreshToken);

      logger.logUserAction("login_success", { userId: response.data.user.id });

      return response.data;
    } catch (error) {
      logger.error("Login failed", { error });
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

/**
 * Log out current user
 */
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      logger.logUserAction("logout_attempt");

      const response = await authApi.logout();

      if (!response.success) {
        logger.warn("Logout API failed, clearing local data anyway");
      }

      // Clear tokens from secure storage
      await clearAuthTokens();

      logger.logUserAction("logout_success");

      return true;
    } catch (error) {
      logger.error("Logout failed", { error });
      // Still clear local tokens even if API fails
      await clearAuthTokens();
      return rejectWithValue("Logout failed");
    }
  }
);

/**
 * Refresh access token
 */
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (refreshToken: string, { rejectWithValue }) => {
    try {
      logger.info("Refreshing access token");

      const response = await authApi.refreshToken({ refreshToken });

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Token refresh failed"
        );
      }

      // Store new tokens
      await storeAuthTokens(response.data.token, response.data.refreshToken);

      logger.info("Access token refreshed successfully");

      return response.data;
    } catch (error) {
      logger.error("Token refresh failed", { error });
      return rejectWithValue("Token refresh failed");
    }
  }
);

/**
 * Request password reset
 */
export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email: string, { rejectWithValue }) => {
    try {
      logger.logUserAction("password_reset_request", { email });

      const response = await authApi.requestPasswordReset({ email });

      if (!response.success) {
        return rejectWithValue(
          response.error?.message || "Password reset failed"
        );
      }

      logger.logUserAction("password_reset_email_sent", { email });

      return response.data?.message || "Password reset email sent";
    } catch (error) {
      logger.error("Password reset request failed", { error });
      return rejectWithValue("Failed to request password reset");
    }
  }
);

/**
 * Get current user (for session restoration)
 */
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      logger.info("Getting current user");

      const response = await authApi.getCurrentUser();

      if (!response.success || !response.data) {
        return rejectWithValue(response.error?.message || "Failed to get user");
      }

      logger.info("Current user retrieved", { userId: response.data.id });

      return response.data;
    } catch (error) {
      logger.error("Get current user failed", { error });
      return rejectWithValue("Failed to get user");
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set user manually (for session restoration)
     */
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    /**
     * Set tokens manually (for session restoration)
     */
    setTokens(
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>
    ) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },

    /**
     * Clear error
     */
    clearError(state) {
      state.error = null;
    },

    /**
     * Reset auth state (logout cleanup)
     */
    resetAuthState(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // Sign up
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        // Still clear state even on error
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Refresh token
    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Token refresh failed - user needs to log in again
        state.isAuthenticated = false;
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Password reset
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { setUser, setTokens, clearError, resetAuthState } =
  authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

// Reducer
export default authSlice.reducer;
