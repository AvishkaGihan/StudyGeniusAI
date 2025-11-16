import { Middleware } from "@reduxjs/toolkit";
import { logout, refreshAccessToken } from "../slices/authSlice";
import { showToast, setNetworkStatus } from "../slices/uiSlice";
import { logger } from "../../services/logger";
import { ErrorCode } from "../../utils/errorHandling";

/**
 * API Middleware
 * Handles API errors, token refresh, and network status
 */

export const apiMiddleware: Middleware = (store) => (next) => (action) => {
  // Pass action through first
  const result = next(action);

  // Check if action is a rejected async thunk
  if ((action as any).type && (action as any).type.endsWith("/rejected")) {
    const error = (action as any).payload;
    const errorMessage = typeof error === "string" ? error : error?.message;

    logger.error("API action rejected", {
      type: (action as any).type,
      error: errorMessage,
    });

    // Handle specific error cases
    handleApiError(store, (action as any).type, errorMessage);
  }

  // Check if action is a pending async thunk (network activity)
  if ((action as any).type && (action as any).type.endsWith("/pending")) {
    // Update network status to online when API calls are made
    const currentStatus = store.getState().ui.networkStatus;
    if (currentStatus === "offline") {
      store.dispatch(setNetworkStatus("online"));
      logger.info("Network status changed to online");
    }
  }

  return result;
};

/**
 * Handle API errors and dispatch appropriate actions
 */
function handleApiError(
  store: any,
  actionType: string,
  errorMessage: string
): void {
  const dispatch = store.dispatch;

  // Token expired - refresh or logout
  if (
    errorMessage.includes("token") &&
    (errorMessage.includes("expired") || errorMessage.includes("invalid"))
  ) {
    logger.warn("Token expired, attempting refresh");

    const refreshToken = store.getState().auth.refreshToken;

    if (refreshToken) {
      // Attempt token refresh
      dispatch(refreshAccessToken(refreshToken));
    } else {
      // No refresh token - force logout
      logger.warn("No refresh token, forcing logout");
      dispatch(logout());
      dispatch(
        showToast({
          type: "error",
          message: "Your session has expired. Please log in again.",
        })
      );
    }
    return;
  }

  // Permission denied - force logout
  if (
    errorMessage.includes("permission") ||
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("403")
  ) {
    logger.warn("Permission denied, forcing logout");
    dispatch(logout());
    dispatch(
      showToast({
        type: "error",
        message: "Access denied. Please log in again.",
      })
    );
    return;
  }

  // Network error - set offline mode
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("connection")
  ) {
    logger.warn("Network error detected");
    dispatch(setNetworkStatus("offline"));
    dispatch(
      showToast({
        type: "warning",
        message: "No internet connection. You can continue working offline.",
        duration: 5000,
      })
    );
    return;
  }

  // Show generic error toast for other errors
  // But only for user-facing actions (not background operations)
  const userFacingActions = [
    "auth/signUp",
    "auth/login",
    "deck/createDeck",
    "deck/updateDeck",
    "deck/deleteDeck",
    "card/createCard",
    "card/updateCard",
    "card/deleteCard",
    "study/startSession",
  ];

  const actionName = actionType.replace("/rejected", "");
  if (userFacingActions.includes(actionName)) {
    dispatch(
      showToast({
        type: "error",
        message: errorMessage || "An error occurred. Please try again.",
      })
    );
  }
}

export default apiMiddleware;
