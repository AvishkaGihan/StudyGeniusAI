import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { logger } from "../services/logger";

// Import reducers
import authReducer from "./slices/authSlice";
import deckReducer from "./slices/deckSlice";
import cardReducer from "./slices/cardSlice";
import studyReducer from "./slices/studySlice";
import spacedRepReducer from "./slices/spacedRepSlice";
import uiReducer from "./slices/uiSlice";
import syncReducer from "./slices/syncSlice";

// Import middleware
import apiMiddleware from "./middleware/apiMiddleware";
import syncMiddleware from "./middleware/syncMiddleware";

/**
 * Root Reducer
 * Combines all slice reducers
 */
const rootReducer = combineReducers({
  auth: authReducer,
  deck: deckReducer,
  card: cardReducer,
  study: studyReducer,
  spacedRep: spacedRepReducer,
  ui: uiReducer,
  sync: syncReducer,
});

/**
 * Configure Store
 * Sets up Redux store with middleware and dev tools
 */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: ["ui/showModal", "ui/showToast", "sync/addToSyncQueue"],
        // Ignore these paths in the state
        ignoredPaths: ["sync.pendingChanges"],
      },
    }).concat(apiMiddleware, syncMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Log store initialization
logger.info("Redux store initialized");

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for TypeScript
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Reset entire store (on logout)
 */
export const resetStore = () => {
  // Import reset actions
  const { resetAuthState } = require("./slices/authSlice");
  const { clearDecks } = require("./slices/deckSlice");
  const { clearCards } = require("./slices/cardSlice");
  const { resetStudyState } = require("./slices/studySlice");
  const { resetSpacedRepState } = require("./slices/spacedRepSlice");
  const { resetUIState } = require("./slices/uiSlice");
  const { resetSyncState } = require("./slices/syncSlice");

  // Dispatch all reset actions
  store.dispatch(resetAuthState());
  store.dispatch(clearDecks());
  store.dispatch(clearCards());
  store.dispatch(resetStudyState());
  store.dispatch(resetSpacedRepState());
  store.dispatch(resetUIState());
  store.dispatch(resetSyncState());

  logger.info("Redux store reset");
};

/**
 * Persist state to storage (for app state restoration)
 */
export const persistState = async () => {
  try {
    const state = store.getState();

    // Only persist essential data
    const persistedState = {
      auth: {
        user: state.auth.user,
        isAuthenticated: state.auth.isAuthenticated,
      },
      ui: {
        networkStatus: state.ui.networkStatus,
      },
    };

    // Save to AsyncStorage
    const { setJSON } = require("../services/storage/asyncStorage");
    await setJSON("PERSISTED_STATE", persistedState);

    logger.debug("State persisted to storage");
  } catch (error) {
    logger.error("Failed to persist state", { error });
  }
};

/**
 * Restore state from storage (on app launch)
 */
export const restoreState = async () => {
  try {
    const { getJSON } = require("../services/storage/asyncStorage");
    const persistedState = await getJSON("PERSISTED_STATE");

    if (persistedState) {
      // Restore auth state
      if (persistedState.auth?.user) {
        const { setUser } = require("./slices/authSlice");
        store.dispatch(setUser(persistedState.auth.user));
      }

      // Restore UI state
      if (persistedState.ui?.networkStatus) {
        const { setNetworkStatus } = require("./slices/uiSlice");
        store.dispatch(setNetworkStatus(persistedState.ui.networkStatus));
      }

      logger.info("State restored from storage");
    }
  } catch (error) {
    logger.error("Failed to restore state", { error });
  }
};

/**
 * Subscribe to state changes for persistence
 */
store.subscribe(() => {
  // Debounce state persistence
  const debounce = (fn: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  const debouncedPersist = debounce(persistState, 1000);
  debouncedPersist();
});

// Export store as default
export default store;
