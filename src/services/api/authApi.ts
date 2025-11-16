import { supabase } from "./supabaseClient";
import { logger } from "../logger";
import { AppError, ErrorCode } from "../../utils/errorHandling";
import {
  ApiResponse,
  SignUpRequest,
  SignUpResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  PasswordResetRequest,
  PasswordResetResponse,
} from "./types";
import { User } from "../../utils/types";

/**
 * Authentication API
 * Handles user signup, login, logout, and password reset
 */

/**
 * Sign up new user
 */
export async function signUp(
  request: SignUpRequest
): Promise<ApiResponse<SignUpResponse>> {
  try {
    logger.info("Signing up new user", { email: request.email });

    const { data, error } = await supabase.auth.signUp({
      email: request.email,
      password: request.password,
    });

    if (error) {
      logger.error("Supabase signup error", { error });

      // Handle specific error cases
      if (error.message.includes("already registered")) {
        throw new AppError(
          ErrorCode.EMAIL_ALREADY_EXISTS,
          "An account with this email already exists"
        );
      }

      throw new AppError(
        ErrorCode.UNKNOWN_ERROR,
        error.message || "Failed to create account"
      );
    }

    if (!data.user || !data.session) {
      throw new AppError(
        ErrorCode.UNKNOWN_ERROR,
        "Failed to create account - no user data returned"
      );
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      created_at: data.user.created_at,
    };

    logger.info("User signed up successfully", { userId: user.id });

    return {
      success: true,
      data: {
        user,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Sign up failed", { error });

    if (error instanceof AppError) {
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

    return {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_ERROR,
        message: "Failed to create account",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Log in existing user
 */
export async function login(
  request: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  try {
    logger.info("Logging in user", { email: request.email });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: request.email,
      password: request.password,
    });

    if (error) {
      logger.error("Supabase login error", { error });

      throw new AppError(
        ErrorCode.INVALID_CREDENTIALS,
        "Invalid email or password"
      );
    }

    if (!data.user || !data.session) {
      throw new AppError(
        ErrorCode.UNKNOWN_ERROR,
        "Failed to log in - no user data returned"
      );
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email!,
      created_at: data.user.created_at,
    };

    logger.info("User logged in successfully", { userId: user.id });

    return {
      success: true,
      data: {
        user,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Login failed", { error });

    if (error instanceof AppError) {
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

    return {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_ERROR,
        message: "Failed to log in",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Log out current user
 */
export async function logout(): Promise<ApiResponse<void>> {
  try {
    logger.info("Logging out user");

    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error("Supabase logout error", { error });
      throw new AppError(ErrorCode.UNKNOWN_ERROR, "Failed to log out");
    }

    logger.info("User logged out successfully");

    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Logout failed", { error });

    if (error instanceof AppError) {
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

    return {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_ERROR,
        message: "Failed to log out",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(
  request: RefreshTokenRequest
): Promise<ApiResponse<RefreshTokenResponse>> {
  try {
    logger.info("Refreshing access token");

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: request.refreshToken,
    });

    if (error) {
      logger.error("Supabase refresh token error", { error });
      throw new AppError(
        ErrorCode.TOKEN_EXPIRED,
        "Session expired. Please log in again."
      );
    }

    if (!data.session) {
      throw new AppError(
        ErrorCode.UNKNOWN_ERROR,
        "Failed to refresh token - no session returned"
      );
    }

    logger.info("Access token refreshed successfully");

    return {
      success: true,
      data: {
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Token refresh failed", { error });

    if (error instanceof AppError) {
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

    return {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_ERROR,
        message: "Failed to refresh token",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(
  request: PasswordResetRequest
): Promise<ApiResponse<PasswordResetResponse>> {
  try {
    logger.info("Requesting password reset", { email: request.email });

    const { error } = await supabase.auth.resetPasswordForEmail(request.email, {
      redirectTo: "studygenius://reset-password",
    });

    if (error) {
      logger.error("Supabase password reset error", { error });
      throw new AppError(
        ErrorCode.UNKNOWN_ERROR,
        "Failed to send password reset email"
      );
    }

    logger.info("Password reset email sent successfully", {
      email: request.email,
    });

    return {
      success: true,
      data: {
        message: "Password reset email sent. Please check your inbox.",
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Password reset request failed", { error });

    if (error instanceof AppError) {
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

    return {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_ERROR,
        message: "Failed to send password reset email",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  try {
    logger.info("Getting current user");

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      logger.error("Supabase get user error", { error });
      throw new AppError(ErrorCode.PERMISSION_DENIED, "Not authenticated");
    }

    if (!user) {
      throw new AppError(ErrorCode.USER_NOT_FOUND, "User not found");
    }

    const userData: User = {
      id: user.id,
      email: user.email!,
      created_at: user.created_at,
    };

    return {
      success: true,
      data: userData,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Get current user failed", { error });

    if (error instanceof AppError) {
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

    return {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_ERROR,
        message: "Failed to get user",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
