import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Deck, NormalizedState } from "../../utils/types";
import * as deckApi from "../../services/api/deckApi";
import { logger } from "../../services/logger";

/**
 * Deck Slice
 * Manages deck state with normalized structure (byId + allIds)
 */

// Initial state
const initialState: NormalizedState<Deck> = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
};

// Async thunks

/**
 * Fetch all decks
 */
export const fetchDecks = createAsyncThunk(
  "deck/fetchDecks",
  async (_, { rejectWithValue }) => {
    try {
      logger.info("Fetching decks");

      const response = await deckApi.getDecks();

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Failed to fetch decks"
        );
      }

      logger.info("Decks fetched successfully", {
        count: response.data.decks.length,
      });

      return response.data.decks;
    } catch (error) {
      logger.error("Fetch decks failed", { error });
      return rejectWithValue("Failed to fetch decks");
    }
  }
);

/**
 * Fetch single deck
 */
export const fetchDeck = createAsyncThunk(
  "deck/fetchDeck",
  async (deckId: string, { rejectWithValue }) => {
    try {
      logger.info("Fetching deck", { deckId });

      const response = await deckApi.getDeck(deckId);

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Failed to fetch deck"
        );
      }

      logger.info("Deck fetched successfully", { deckId });

      return response.data.deck;
    } catch (error) {
      logger.error("Fetch deck failed", { error, deckId });
      return rejectWithValue("Failed to fetch deck");
    }
  }
);

/**
 * Create new deck
 */
export const createDeck = createAsyncThunk(
  "deck/createDeck",
  async (
    { title, description }: { title: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      logger.logUserAction("create_deck", { title });

      const response = await deckApi.createDeck({ title, description });

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Failed to create deck"
        );
      }

      logger.logUserAction("deck_created", { deckId: response.data.deck.id });

      return response.data.deck;
    } catch (error) {
      logger.error("Create deck failed", { error });
      return rejectWithValue("Failed to create deck");
    }
  }
);

/**
 * Update deck
 */
export const updateDeck = createAsyncThunk(
  "deck/updateDeck",
  async (
    {
      deckId,
      title,
      description,
    }: { deckId: string; title?: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      logger.logUserAction("update_deck", { deckId });

      const response = await deckApi.updateDeck(deckId, { title, description });

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Failed to update deck"
        );
      }

      logger.logUserAction("deck_updated", { deckId });

      return response.data.deck;
    } catch (error) {
      logger.error("Update deck failed", { error, deckId });
      return rejectWithValue("Failed to update deck");
    }
  }
);

/**
 * Delete deck
 */
export const deleteDeck = createAsyncThunk(
  "deck/deleteDeck",
  async (deckId: string, { rejectWithValue }) => {
    try {
      logger.logUserAction("delete_deck", { deckId });

      const response = await deckApi.deleteDeck(deckId);

      if (!response.success) {
        return rejectWithValue(
          response.error?.message || "Failed to delete deck"
        );
      }

      logger.logUserAction("deck_deleted", { deckId });

      return deckId;
    } catch (error) {
      logger.error("Delete deck failed", { error, deckId });
      return rejectWithValue("Failed to delete deck");
    }
  }
);

// Slice
const deckSlice = createSlice({
  name: "deck",
  initialState,
  reducers: {
    /**
     * Clear error
     */
    clearDeckError(state) {
      state.error = null;
    },

    /**
     * Update deck locally (optimistic update)
     */
    updateDeckLocally(state, action: PayloadAction<Deck>) {
      const deck = action.payload;
      state.byId[deck.id] = deck;
    },

    /**
     * Clear all decks (on logout)
     */
    clearDecks(state) {
      state.byId = {};
      state.allIds = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch all decks
    builder
      .addCase(fetchDecks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDecks.fulfilled, (state, action) => {
        state.loading = false;
        // Normalize decks
        state.byId = {};
        state.allIds = [];
        action.payload.forEach((deck) => {
          state.byId[deck.id] = deck;
          state.allIds.push(deck.id);
        });
        state.error = null;
      })
      .addCase(fetchDecks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single deck
    builder
      .addCase(fetchDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeck.fulfilled, (state, action) => {
        state.loading = false;
        const deck = action.payload;
        state.byId[deck.id] = deck;
        if (!state.allIds.includes(deck.id)) {
          state.allIds.push(deck.id);
        }
        state.error = null;
      })
      .addCase(fetchDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create deck
    builder
      .addCase(createDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeck.fulfilled, (state, action) => {
        state.loading = false;
        const deck = action.payload;
        state.byId[deck.id] = deck;
        state.allIds.unshift(deck.id); // Add to beginning
        state.error = null;
      })
      .addCase(createDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update deck
    builder
      .addCase(updateDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeck.fulfilled, (state, action) => {
        state.loading = false;
        const deck = action.payload;
        state.byId[deck.id] = deck;
        state.error = null;
      })
      .addCase(updateDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete deck
    builder
      .addCase(deleteDeck.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDeck.fulfilled, (state, action) => {
        state.loading = false;
        const deckId = action.payload;
        delete state.byId[deckId];
        state.allIds = state.allIds.filter((id) => id !== deckId);
        state.error = null;
      })
      .addCase(deleteDeck.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearDeckError, updateDeckLocally, clearDecks } =
  deckSlice.actions;

// Selectors
export const selectDeckState = (state: { deck: NormalizedState<Deck> }) =>
  state.deck;

export const selectAllDecks = (state: { deck: NormalizedState<Deck> }) =>
  state.deck.allIds.map((id) => state.deck.byId[id]);

export const selectDeckById =
  (deckId: string) => (state: { deck: NormalizedState<Deck> }) =>
    state.deck.byId[deckId];

export const selectDeckLoading = (state: { deck: NormalizedState<Deck> }) =>
  state.deck.loading;

export const selectDeckError = (state: { deck: NormalizedState<Deck> }) =>
  state.deck.error;

export const selectDeckCount = (state: { deck: NormalizedState<Deck> }) =>
  state.deck.allIds.length;

// Reducer
export default deckSlice.reducer;
