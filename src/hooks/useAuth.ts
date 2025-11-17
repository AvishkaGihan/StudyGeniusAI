import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  login,
  signUp,
  logout,
  getCurrentUser,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  clearError,
} from "../store/slices/authSlice";
import { getAuthTokens } from "../services/storage/secureStore";
import { logger } from "../services/logger";

/**
 * useAuth Hook
 * Custom hook for authentication logic
 */
export function useAuth() {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  /**
   * Log in user
   */
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        logger.logUserAction("login_attempt", { email });
        await dispatch(login({ email, password })).unwrap();
        logger.logUserAction("login_success");
      } catch (err) {
        logger.error("Login failed", { error: err });
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Sign up new user
   */
  const handleSignUp = useCallback(
    async (email: string, password: string) => {
      try {
        logger.logUserAction("signup_attempt", { email });
        await dispatch(signUp({ email, password })).unwrap();
        logger.logUserAction("signup_success");
      } catch (err) {
        logger.error("Signup failed", { error: err });
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Log out user
   */
  const handleLogout = useCallback(async () => {
    try {
      logger.logUserAction("logout_attempt");
      await dispatch(logout()).unwrap();
      logger.logUserAction("logout_success");
    } catch (err) {
      logger.error("Logout failed", { error: err });
      // Still clear local state even if API fails
    }
  }, [dispatch]);

  /**
   * Clear authentication error
   */
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Restore session on app launch
   */
  const restoreSession = useCallback(async () => {
    try {
      logger.info("Attempting to restore session");

      // Check if we have tokens
      const tokens = await getAuthTokens();

      if (tokens.accessToken) {
        // Try to get current user
        await dispatch(getCurrentUser()).unwrap();
        logger.info("Session restored successfully");
      } else {
        logger.info("No session to restore");
      }
    } catch (err) {
      logger.warn("Session restoration failed", { error: err });
      // Session invalid - user needs to log in again
    }
  }, [dispatch]);

  /**
   * Auto-restore session on mount
   */
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      restoreSession();
    }
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: handleLogin,
    signUp: handleSignUp,
    logout: handleLogout,
    clearError: handleClearError,
    restoreSession,
  };
}

export default useAuth;
