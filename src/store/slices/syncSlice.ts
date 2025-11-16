import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { SyncQueueItem, SyncOperation, SyncEntity } from "../../utils/types";
import { logger } from "../../services/logger";
import { setJSON, getJSON } from "../../services/storage/asyncStorage";
import { STORAGE_KEYS } from "../../utils/constants";

/**
 * Sync Slice
 * Manages offline sync queue and synchronization state
 */

interface SyncState {
  pendingChanges: SyncQueueItem[];
  isSyncing: boolean;
  lastSyncTime: number | null;
  syncError: string | null;
}

// Initial state
const initialState: SyncState = {
  pendingChanges: [],
  isSyncing: false,
  lastSyncTime: null,
  syncError: null,
};

// Async thunks

/**
 * Load sync queue from storage
 */
export const loadSyncQueue = createAsyncThunk(
  "sync/loadQueue",
  async (_, { rejectWithValue }) => {
    try {
      logger.info("Loading sync queue from storage");

      const queue = await getJSON<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE);

      if (!queue) {
        return [];
      }

      logger.info("Sync queue loaded", { count: queue.length });

      return queue;
    } catch (error) {
      logger.error("Failed to load sync queue", { error });
      return rejectWithValue("Failed to load sync queue");
    }
  }
);

/**
 * Save sync queue to storage
 */
export const saveSyncQueue = createAsyncThunk(
  "sync/saveQueue",
  async (queue: SyncQueueItem[], { rejectWithValue }) => {
    try {
      logger.debug("Saving sync queue to storage", { count: queue.length });

      await setJSON(STORAGE_KEYS.SYNC_QUEUE, queue);

      logger.debug("Sync queue saved");

      return true;
    } catch (error) {
      logger.error("Failed to save sync queue", { error });
      return rejectWithValue("Failed to save sync queue");
    }
  }
);

/**
 * Process sync queue (sync all pending changes)
 */
export const processSyncQueue = createAsyncThunk(
  "sync/processQueue",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as { sync: SyncState };
      const queue = state.sync.pendingChanges;

      const synced: string[] = [];
      const failed: string[] = [];

      if (queue.length === 0) {
        logger.info("No pending changes to sync");
        return { synced, failed };
      }

      logger.info("Processing sync queue", { count: queue.length });

      // Process each item in queue
      for (const item of queue) {
        try {
          // Here you would call the appropriate API based on entity type and operation
          // For now, we'll simulate success
          logger.info("Syncing item", {
            entity: item.entity,
            operation: item.operation,
          });

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 100));

          synced.push(item.id);
        } catch (error) {
          logger.error("Failed to sync item", { item, error });
          failed.push(item.id);

          // Increment retry count
          item.retry_count += 1;
        }
      }

      logger.info("Sync queue processed", {
        synced: synced.length,
        failed: failed.length,
      });

      return { synced, failed };
    } catch (error) {
      logger.error("Sync queue processing failed", { error });
      return rejectWithValue("Failed to process sync queue");
    }
  }
);

// Slice
const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {
    /**
     * Add item to sync queue
     */
    addToSyncQueue(
      state,
      action: PayloadAction<{
        operation: SyncOperation;
        entity: SyncEntity;
        entityId: string;
        data: any;
      }>
    ) {
      const queueItem: SyncQueueItem = {
        id: `sync_${Date.now()}_${Math.random()}`,
        operation: action.payload.operation,
        entity: action.payload.entity,
        entity_id: action.payload.entityId,
        data: action.payload.data,
        timestamp: new Date().toISOString(),
        retry_count: 0,
      };

      state.pendingChanges.push(queueItem);

      logger.info("Item added to sync queue", {
        entity: queueItem.entity,
        operation: queueItem.operation,
      });
    },

    /**
     * Remove item from sync queue
     */
    removeFromSyncQueue(state, action: PayloadAction<string>) {
      const itemId = action.payload;
      state.pendingChanges = state.pendingChanges.filter(
        (item) => item.id !== itemId
      );

      logger.debug("Item removed from sync queue", { itemId });
    },

    /**
     * Clear sync queue
     */
    clearSyncQueue(state) {
      state.pendingChanges = [];
      logger.info("Sync queue cleared");
    },

    /**
     * Set syncing status
     */
    setSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
    },

    /**
     * Update last sync time
     */
    updateLastSyncTime(state) {
      state.lastSyncTime = Date.now();
    },

    /**
     * Set sync error
     */
    setSyncError(state, action: PayloadAction<string | null>) {
      state.syncError = action.payload;
    },

    /**
     * Reset sync state (on logout)
     */
    resetSyncState(state) {
      state.pendingChanges = [];
      state.isSyncing = false;
      state.lastSyncTime = null;
      state.syncError = null;
    },
  },
  extraReducers: (builder) => {
    // Load sync queue
    builder
      .addCase(loadSyncQueue.fulfilled, (state, action) => {
        state.pendingChanges = action.payload;
      })
      .addCase(loadSyncQueue.rejected, (state, action) => {
        state.syncError = action.payload as string;
      });

    // Process sync queue
    builder
      .addCase(processSyncQueue.pending, (state) => {
        state.isSyncing = true;
        state.syncError = null;
      })
      .addCase(processSyncQueue.fulfilled, (state, action) => {
        state.isSyncing = false;

        // Remove successfully synced items
        state.pendingChanges = state.pendingChanges.filter(
          (item) => !action.payload.synced.includes(item.id)
        );

        // Update last sync time
        state.lastSyncTime = Date.now();
        state.syncError = null;

        logger.info("Sync completed successfully", {
          remainingItems: state.pendingChanges.length,
        });
      })
      .addCase(processSyncQueue.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncError = action.payload as string;
      });
  },
});

// Actions
export const {
  addToSyncQueue,
  removeFromSyncQueue,
  clearSyncQueue,
  setSyncing,
  updateLastSyncTime,
  setSyncError,
  resetSyncState,
} = syncSlice.actions;

// Selectors
export const selectSyncState = (state: { sync: SyncState }) => state.sync;

export const selectPendingChanges = (state: { sync: SyncState }) =>
  state.sync.pendingChanges;

export const selectPendingChangesCount = (state: { sync: SyncState }) =>
  state.sync.pendingChanges.length;

export const selectIsSyncing = (state: { sync: SyncState }) =>
  state.sync.isSyncing;

export const selectLastSyncTime = (state: { sync: SyncState }) =>
  state.sync.lastSyncTime;

export const selectSyncError = (state: { sync: SyncState }) =>
  state.sync.syncError;

export const selectHasPendingChanges = (state: { sync: SyncState }) =>
  state.sync.pendingChanges.length > 0;

export const selectPendingChangesByEntity =
  (entity: SyncEntity) => (state: { sync: SyncState }) =>
    state.sync.pendingChanges.filter((item) => item.entity === entity);

// Reducer
export default syncSlice.reducer;
