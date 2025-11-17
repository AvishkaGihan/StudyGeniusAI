import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  loadSyncQueue,
  processSyncQueue,
  selectPendingChanges,
  selectPendingChangesCount,
  selectIsSyncing,
  selectLastSyncTime,
  selectHasPendingChanges,
} from "../store/slices/syncSlice";
import {
  selectIsOffline,
  selectNetworkStatus,
  setNetworkStatus,
} from "../store/slices/uiSlice";
import { logger } from "../services/logger";

/**
 * useOfflineSync Hook
 * Custom hook for offline sync queue management
 */
export function useOfflineSync() {
  const dispatch = useAppDispatch();

  const pendingChanges = useAppSelector(selectPendingChanges);
  const pendingCount = useAppSelector(selectPendingChangesCount);
  const isSyncing = useAppSelector(selectIsSyncing);
  const lastSyncTime = useAppSelector(selectLastSyncTime);
  const hasPendingChanges = useAppSelector(selectHasPendingChanges);
  const isOffline = useAppSelector(selectIsOffline);
  const networkStatus = useAppSelector(selectNetworkStatus);

  /**
   * Sync pending changes
   */
  const sync = useCallback(async () => {
    if (isOffline) {
      logger.warn("Cannot sync while offline");
      return;
    }

    if (isSyncing) {
      logger.info("Sync already in progress");
      return;
    }

    if (!hasPendingChanges) {
      logger.info("No pending changes to sync");
      return;
    }

    try {
      logger.info("Starting sync", { pendingCount });
      await dispatch(processSyncQueue()).unwrap();
      logger.info("Sync completed successfully");
    } catch (err) {
      logger.error("Sync failed", { error: err });
      throw err;
    }
  }, [dispatch, isOffline, isSyncing, hasPendingChanges, pendingCount]);

  /**
   * Force sync (even if no pending changes)
   */
  const forceSync = useCallback(async () => {
    try {
      logger.info("Force sync triggered");
      await dispatch(processSyncQueue()).unwrap();
    } catch (err) {
      logger.error("Force sync failed", { error: err });
      throw err;
    }
  }, [dispatch]);

  /**
   * Get last sync time formatted
   */
  const getLastSyncFormatted = useCallback(() => {
    if (!lastSyncTime) return "Never";

    const now = Date.now();
    const diffMs = now - lastSyncTime;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes === 1) return "1 minute ago";
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  }, [lastSyncTime]);

  /**
   * Setup network listener
   */
  useEffect(() => {
    logger.info("Setting up network status listener");

    const handleOnline = () => {
      const status = "online";
      logger.info("Network status changed", { status });
      dispatch(setNetworkStatus(status));

      // Auto-sync when coming back online
      if (hasPendingChanges && !isSyncing) {
        logger.info("Network restored, auto-syncing");
        sync();
      }
    };

    const handleOffline = () => {
      const status = "offline";
      logger.info("Network status changed", { status });
      dispatch(setNetworkStatus(status));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [dispatch, hasPendingChanges, isSyncing, sync]);

  /**
   * Load sync queue on mount
   */
  useEffect(() => {
    dispatch(loadSyncQueue());
  }, [dispatch]);

  return {
    pendingChanges,
    pendingCount,
    isSyncing,
    lastSyncTime,
    hasPendingChanges,
    isOffline,
    networkStatus,
    sync,
    forceSync,
    getLastSyncFormatted,
  };
}

export default useOfflineSync;
