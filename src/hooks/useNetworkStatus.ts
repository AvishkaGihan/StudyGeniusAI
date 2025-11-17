import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  setNetworkStatus,
  selectNetworkStatus,
  selectIsOffline,
} from "../store/slices/uiSlice";
import { logger } from "../services/logger";

/**
 * useNetworkStatus Hook
 * Custom hook for monitoring network connectivity
 */
export function useNetworkStatus() {
  const dispatch = useAppDispatch();

  const networkStatus = useAppSelector(selectNetworkStatus);
  const isOffline = useAppSelector(selectIsOffline);
  const isOnline = networkStatus === "online";

  /**
   * Check current network status
   */
  const checkNetworkStatus = useCallback(async () => {
    try {
      const isConnected = navigator.onLine;
      const status = isConnected ? "online" : "offline";

      dispatch(setNetworkStatus(status));

      logger.info("Network status checked", {
        status,
        isConnected,
      });

      return isConnected;
    } catch (error) {
      logger.error("Failed to check network status", { error });
      return false;
    }
  }, [dispatch]);

  /**
   * Setup network listener
   */
  useEffect(() => {
    logger.info("Setting up network status listener");

    // Initial check
    checkNetworkStatus();

    // Handle online/offline events
    const handleOnline = () => {
      const status = "online";
      logger.info("Network status changed", { status });
      dispatch(setNetworkStatus(status));
    };

    const handleOffline = () => {
      const status = "offline";
      logger.info("Network status changed", { status });
      dispatch(setNetworkStatus(status));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      logger.info("Cleaning up network status listener");
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [dispatch, checkNetworkStatus]);

  return {
    networkStatus,
    isOnline,
    isOffline,
    checkNetworkStatus,
  };
}

export default useNetworkStatus;
