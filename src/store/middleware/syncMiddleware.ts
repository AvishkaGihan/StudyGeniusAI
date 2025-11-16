import { Middleware } from "@reduxjs/toolkit";
import {
  addToSyncQueue,
  processSyncQueue,
  saveSyncQueue,
} from "../slices/syncSlice";
import { setNetworkStatus } from "../slices/uiSlice";
import { logger } from "../../services/logger";
import { appConfig } from "../../config/appConfig";

/**
 * Sync Middleware
 * Handles offline queue management and auto-sync
 */

let syncInterval: NodeJS.Timeout | null = null;

export const syncMiddleware: Middleware = (store) => {
  // Start periodic sync when online
  const startPeriodicSync = () => {
    if (syncInterval) return; // Already running

    syncInterval = setInterval(() => {
      const state = store.getState();

      // Only sync if online and have pending changes
      if (
        state.ui.networkStatus === "online" &&
        state.sync.pendingChanges.length > 0 &&
        !state.sync.isSyncing
      ) {
        logger.info("Auto-sync triggered", {
          pendingChanges: state.sync.pendingChanges.length,
        });
        store.dispatch(processSyncQueue() as any);
      }
    }, appConfig.sync.syncInterval);

    logger.info("Periodic sync started");
  };

  // Stop periodic sync
  const stopPeriodicSync = () => {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
      logger.info("Periodic sync stopped");
    }
  };

  return (next) => (action) => {
    const result = next(action);

    // Handle network status changes
    if ((action as any).type === setNetworkStatus.type) {
      const status = (action as any).payload;

      if (status === "online") {
        // Network came back online - start sync
        logger.info("Network online, starting sync");
        startPeriodicSync();

        // Trigger immediate sync if there are pending changes
        const state = store.getState();
        if (state.sync.pendingChanges.length > 0 && !state.sync.isSyncing) {
          store.dispatch(processSyncQueue() as any);
        }
      } else if (status === "offline") {
        // Network went offline - stop sync
        logger.info("Network offline, stopping sync");
        stopPeriodicSync();
      }
    }

    // Queue mutations when offline
    const isOffline = store.getState().ui.networkStatus === "offline";

    if (isOffline && shouldQueueAction((action as any).type)) {
      logger.info("Queueing action for offline sync", {
        type: (action as any).type,
      });

      // Add to sync queue
      const queueItem = createSyncQueueItem(action);
      if (queueItem) {
        store.dispatch(addToSyncQueue(queueItem) as any);

        // Save queue to storage
        const updatedQueue = store.getState().sync.pendingChanges;
        store.dispatch(saveSyncQueue(updatedQueue) as any);
      }
    }

    // Save sync queue whenever it changes
    if (
      (action as any).type === addToSyncQueue.type ||
      (action as any).type.startsWith("sync/") ||
      (action as any).type === processSyncQueue.fulfilled.type
    ) {
      // Debounce queue saves
      setTimeout(() => {
        const queue = store.getState().sync.pendingChanges;
        store.dispatch(saveSyncQueue(queue) as any);
      }, 1000);
    }

    return result;
  };
};

/**
 * Determine if action should be queued for offline sync
 */
function shouldQueueAction(actionType: string | symbol | undefined): boolean {
  if (!actionType || typeof actionType !== "string") {
    return false;
  }

  const queueableActions = [
    // Deck actions
    "deck/createDeck/fulfilled",
    "deck/updateDeck/fulfilled",
    "deck/deleteDeck/fulfilled",

    // Card actions
    "card/createCard/fulfilled",
    "card/createMultipleCards/fulfilled",
    "card/updateCard/fulfilled",
    "card/deleteCard/fulfilled",

    // Study session actions
    "study/recordReview/fulfilled",
  ];

  return queueableActions.some((pattern) => actionType.includes(pattern));
}

/**
 * Create sync queue item from action
 */
function createSyncQueueItem(action: any): any | null {
  const actionType = action.type;

  // Deck actions
  if (actionType.includes("deck/createDeck")) {
    return {
      operation: "create" as const,
      entity: "deck" as const,
      entityId: action.payload.id,
      data: action.payload,
    };
  }

  if (actionType.includes("deck/updateDeck")) {
    return {
      operation: "update" as const,
      entity: "deck" as const,
      entityId: action.meta.arg.deckId,
      data: action.payload,
    };
  }

  if (actionType.includes("deck/deleteDeck")) {
    return {
      operation: "delete" as const,
      entity: "deck" as const,
      entityId: action.payload,
      data: null,
    };
  }

  // Card actions
  if (actionType.includes("card/createCard")) {
    return {
      operation: "create" as const,
      entity: "card" as const,
      entityId: action.payload.id,
      data: action.payload,
    };
  }

  if (actionType.includes("card/createMultipleCards")) {
    return {
      operation: "create" as const,
      entity: "card" as const,
      entityId: `batch_${Date.now()}`,
      data: action.payload,
    };
  }

  if (actionType.includes("card/updateCard")) {
    return {
      operation: "update" as const,
      entity: "card" as const,
      entityId: action.meta.arg.cardId,
      data: action.payload,
    };
  }

  if (actionType.includes("card/deleteCard")) {
    return {
      operation: "delete" as const,
      entity: "card" as const,
      entityId: action.payload,
      data: null,
    };
  }

  // Study session actions
  if (actionType.includes("study/recordReview")) {
    return {
      operation: "update" as const,
      entity: "card" as const,
      entityId: action.meta.arg.cardId,
      data: {
        difficulty: action.meta.arg.difficulty,
        timeSpent: action.meta.arg.timeSpent,
      },
    };
  }

  return null;
}

export default syncMiddleware;
