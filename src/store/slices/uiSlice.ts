import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Toast, ToastType, Modal } from "../../utils/types";

/**
 * UI Slice
 * Manages global UI state (modals, toasts, loading indicators)
 */

interface UIState {
  offlineMode: boolean;
  loadingOperations: string[]; // Track multiple loading operations
  toasts: Toast[];
  modals: Modal[];
  networkStatus: "online" | "offline" | "unknown";
}

// Initial state
const initialState: UIState = {
  offlineMode: false,
  loadingOperations: [],
  toasts: [],
  modals: [],
  networkStatus: "unknown",
};

// Slice
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    /**
     * Set offline mode
     */
    setOfflineMode(state, action: PayloadAction<boolean>) {
      state.offlineMode = action.payload;
    },

    /**
     * Set network status
     */
    setNetworkStatus(
      state,
      action: PayloadAction<"online" | "offline" | "unknown">
    ) {
      state.networkStatus = action.payload;
      state.offlineMode = action.payload === "offline";
    },

    /**
     * Start loading operation
     */
    startLoading(state, action: PayloadAction<string>) {
      if (!state.loadingOperations.includes(action.payload)) {
        state.loadingOperations.push(action.payload);
      }
    },

    /**
     * Stop loading operation
     */
    stopLoading(state, action: PayloadAction<string>) {
      state.loadingOperations = state.loadingOperations.filter(
        (op) => op !== action.payload
      );
    },

    /**
     * Clear all loading operations
     */
    clearAllLoading(state) {
      state.loadingOperations = [];
    },

    /**
     * Show toast notification
     */
    showToast(
      state,
      action: PayloadAction<{
        type: ToastType;
        message: string;
        duration?: number;
      }>
    ) {
      const toast: Toast = {
        id: `toast_${Date.now()}_${Math.random()}`,
        type: action.payload.type,
        message: action.payload.message,
        duration: action.payload.duration || 3000,
      };

      state.toasts.push(toast);

      // Auto-remove after duration (handled by component)
    },

    /**
     * Hide toast
     */
    hideToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      );
    },

    /**
     * Clear all toasts
     */
    clearAllToasts(state) {
      state.toasts = [];
    },

    /**
     * Show modal
     */
    showModal(
      state,
      action: PayloadAction<{
        type: string;
        props?: Record<string, any>;
      }>
    ) {
      const modal: Modal = {
        id: `modal_${Date.now()}_${Math.random()}`,
        type: action.payload.type,
        props: action.payload.props,
      };

      state.modals.push(modal);
    },

    /**
     * Hide modal
     */
    hideModal(state, action: PayloadAction<string>) {
      state.modals = state.modals.filter(
        (modal) => modal.id !== action.payload
      );
    },

    /**
     * Hide modal by type
     */
    hideModalByType(state, action: PayloadAction<string>) {
      state.modals = state.modals.filter(
        (modal) => modal.type !== action.payload
      );
    },

    /**
     * Clear all modals
     */
    clearAllModals(state) {
      state.modals = [];
    },

    /**
     * Reset UI state (on logout)
     */
    resetUIState(state) {
      state.loadingOperations = [];
      state.toasts = [];
      state.modals = [];
      state.offlineMode = false;
    },
  },
});

// Actions
export const {
  setOfflineMode,
  setNetworkStatus,
  startLoading,
  stopLoading,
  clearAllLoading,
  showToast,
  hideToast,
  clearAllToasts,
  showModal,
  hideModal,
  hideModalByType,
  clearAllModals,
  resetUIState,
} = uiSlice.actions;

// Selectors
export const selectUIState = (state: { ui: UIState }) => state.ui;

export const selectIsOffline = (state: { ui: UIState }) => state.ui.offlineMode;

export const selectNetworkStatus = (state: { ui: UIState }) =>
  state.ui.networkStatus;

export const selectIsLoading =
  (operationId?: string) => (state: { ui: UIState }) => {
    if (operationId) {
      return state.ui.loadingOperations.includes(operationId);
    }
    return state.ui.loadingOperations.length > 0;
  };

export const selectLoadingOperations = (state: { ui: UIState }) =>
  state.ui.loadingOperations;

export const selectToasts = (state: { ui: UIState }) => state.ui.toasts;

export const selectModals = (state: { ui: UIState }) => state.ui.modals;

export const selectModalByType = (type: string) => (state: { ui: UIState }) =>
  state.ui.modals.find((modal) => modal.type === type);

export const selectHasActiveModal = (state: { ui: UIState }) =>
  state.ui.modals.length > 0;

// Reducer
export default uiSlice.reducer;
