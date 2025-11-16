import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Card, NormalizedState, GeneratedCard } from "../../utils/types";
import * as cardApi from "../../services/api/cardApi";
import { logger } from "../../services/logger";

/**
 * Card Slice
 * Manages card state with normalized structure
 */

interface CardState extends NormalizedState<Card> {
  generatingCardIds: string[]; // Cards currently being generated
}

// Initial state
const initialState: CardState = {
  byId: {},
  allIds: [],
  loading: false,
  error: null,
  generatingCardIds: [],
};

// Async thunks

/**
 * Fetch cards for a deck
 */
export const fetchCards = createAsyncThunk(
  "card/fetchCards",
  async (
    { deckId, dueOnly }: { deckId: string; dueOnly?: boolean },
    { rejectWithValue }
  ) => {
    try {
      logger.info("Fetching cards", { deckId, dueOnly });

      const response = await cardApi.getCards({ deckId, dueOnly });

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Failed to fetch cards"
        );
      }

      logger.info("Cards fetched successfully", {
        count: response.data.cards.length,
      });

      return response.data.cards;
    } catch (error) {
      logger.error("Fetch cards failed", { error, deckId });
      return rejectWithValue("Failed to fetch cards");
    }
  }
);

/**
 * Fetch single card
 */
export const fetchCard = createAsyncThunk(
  "card/fetchCard",
  async (cardId: string, { rejectWithValue }) => {
    try {
      logger.info("Fetching card", { cardId });

      const response = await cardApi.getCard(cardId);

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Failed to fetch card"
        );
      }

      logger.info("Card fetched successfully", { cardId });

      return response.data.card;
    } catch (error) {
      logger.error("Fetch card failed", { error, cardId });
      return rejectWithValue("Failed to fetch card");
    }
  }
);

/**
 * Create single card
 */
export const createCard = createAsyncThunk(
  "card/createCard",
  async (
    {
      deckId,
      question,
      answer,
      difficulty,
    }: {
      deckId: string;
      question: string;
      answer: string;
      difficulty?: "easy" | "medium" | "hard";
    },
    { rejectWithValue }
  ) => {
    try {
      logger.logUserAction("create_card", { deckId });

      const response = await cardApi.createCard({
        deckId,
        question,
        answer,
        difficulty,
      });

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Failed to create card"
        );
      }

      logger.logUserAction("card_created", { cardId: response.data.card.id });

      return response.data.card;
    } catch (error) {
      logger.error("Create card failed", { error });
      return rejectWithValue("Failed to create card");
    }
  }
);

/**
 * Create multiple cards (batch)
 */
export const createMultipleCards = createAsyncThunk(
  "card/createMultipleCards",
  async (
    {
      deckId,
      cards,
    }: {
      deckId: string;
      cards: Array<{
        question: string;
        answer: string;
        difficulty?: "easy" | "medium" | "hard";
      }>;
    },
    { rejectWithValue }
  ) => {
    try {
      logger.logUserAction("create_multiple_cards", {
        deckId,
        count: cards.length,
      });

      const response = await cardApi.createMultipleCards({ deckId, cards });

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Failed to create cards"
        );
      }

      logger.logUserAction("cards_created", {
        count: response.data.cards.length,
        deckId,
      });

      return response.data.cards;
    } catch (error) {
      logger.error("Create multiple cards failed", { error });
      return rejectWithValue("Failed to create cards");
    }
  }
);

/**
 * Update card
 */
export const updateCard = createAsyncThunk(
  "card/updateCard",
  async (
    {
      cardId,
      updates,
    }: {
      cardId: string;
      updates: {
        question?: string;
        answer?: string;
        difficulty?: "easy" | "medium" | "hard";
        easeFactor?: number;
        nextReview?: string;
        lastReviewed?: string;
        reviewCount?: number;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      logger.logUserAction("update_card", { cardId });

      const response = await cardApi.updateCard(cardId, updates);

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Failed to update card"
        );
      }

      logger.logUserAction("card_updated", { cardId });

      return response.data.card;
    } catch (error) {
      logger.error("Update card failed", { error, cardId });
      return rejectWithValue("Failed to update card");
    }
  }
);

/**
 * Delete card
 */
export const deleteCard = createAsyncThunk(
  "card/deleteCard",
  async (cardId: string, { rejectWithValue }) => {
    try {
      logger.logUserAction("delete_card", { cardId });

      const response = await cardApi.deleteCard(cardId);

      if (!response.success) {
        return rejectWithValue(
          response.error?.message || "Failed to delete card"
        );
      }

      logger.logUserAction("card_deleted", { cardId });

      return cardId;
    } catch (error) {
      logger.error("Delete card failed", { error, cardId });
      return rejectWithValue("Failed to delete card");
    }
  }
);

/**
 * Fetch due cards for a deck
 */
export const fetchDueCards = createAsyncThunk(
  "card/fetchDueCards",
  async (
    { deckId, limit }: { deckId: string; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      logger.info("Fetching due cards", { deckId, limit });

      const response = await cardApi.getDueCards({ deckId, limit });

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Failed to fetch due cards"
        );
      }

      logger.info("Due cards fetched", { count: response.data.cards.length });

      return response.data.cards;
    } catch (error) {
      logger.error("Fetch due cards failed", { error, deckId });
      return rejectWithValue("Failed to fetch due cards");
    }
  }
);

// Slice
const cardSlice = createSlice({
  name: "card",
  initialState,
  reducers: {
    /**
     * Add generated card (before saving to database)
     */
    addGeneratedCard(state, action: PayloadAction<GeneratedCard>) {
      const card = action.payload;
      const tempId = card.tempId || `temp_${Date.now()}`;

      // Store as Card with temp ID
      const tempCard: Card = {
        id: tempId,
        deck_id: "", // Will be set when saving
        question: card.question,
        answer: card.answer,
        difficulty: "medium",
        ease_factor: 2.5,
        review_count: 0,
        created_at: new Date().toISOString(),
      };

      state.byId[tempId] = tempCard;
      state.allIds.push(tempId);
      state.generatingCardIds.push(tempId);
    },

    /**
     * Remove generated card (before saving)
     */
    removeGeneratedCard(state, action: PayloadAction<string>) {
      const tempId = action.payload;
      delete state.byId[tempId];
      state.allIds = state.allIds.filter((id) => id !== tempId);
      state.generatingCardIds = state.generatingCardIds.filter(
        (id) => id !== tempId
      );
    },

    /**
     * Clear generated cards
     */
    clearGeneratedCards(state) {
      state.generatingCardIds.forEach((tempId) => {
        delete state.byId[tempId];
      });
      state.allIds = state.allIds.filter(
        (id) => !state.generatingCardIds.includes(id)
      );
      state.generatingCardIds = [];
    },

    /**
     * Update card locally (optimistic update)
     */
    updateCardLocally(state, action: PayloadAction<Card>) {
      const card = action.payload;
      state.byId[card.id] = card;
    },

    /**
     * Clear error
     */
    clearCardError(state) {
      state.error = null;
    },

    /**
     * Clear all cards (on logout)
     */
    clearCards(state) {
      state.byId = {};
      state.allIds = [];
      state.generatingCardIds = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch cards
    builder
      .addCase(fetchCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.loading = false;
        // Add/update cards
        action.payload.forEach((card) => {
          state.byId[card.id] = card;
          if (!state.allIds.includes(card.id)) {
            state.allIds.push(card.id);
          }
        });
        state.error = null;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single card
    builder
      .addCase(fetchCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCard.fulfilled, (state, action) => {
        state.loading = false;
        const card = action.payload;
        state.byId[card.id] = card;
        if (!state.allIds.includes(card.id)) {
          state.allIds.push(card.id);
        }
        state.error = null;
      })
      .addCase(fetchCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create card
    builder
      .addCase(createCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.loading = false;
        const card = action.payload;
        state.byId[card.id] = card;
        state.allIds.push(card.id);
        state.error = null;
      })
      .addCase(createCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create multiple cards
    builder
      .addCase(createMultipleCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMultipleCards.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach((card) => {
          state.byId[card.id] = card;
          state.allIds.push(card.id);
        });
        // Clear generated cards after successful save
        state.generatingCardIds = [];
        state.error = null;
      })
      .addCase(createMultipleCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update card
    builder
      .addCase(updateCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.loading = false;
        const card = action.payload;
        state.byId[card.id] = card;
        state.error = null;
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete card
    builder
      .addCase(deleteCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.loading = false;
        const cardId = action.payload;
        delete state.byId[cardId];
        state.allIds = state.allIds.filter((id) => id !== cardId);
        state.error = null;
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch due cards
    builder
      .addCase(fetchDueCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDueCards.fulfilled, (state, action) => {
        state.loading = false;
        action.payload.forEach((card) => {
          state.byId[card.id] = card;
          if (!state.allIds.includes(card.id)) {
            state.allIds.push(card.id);
          }
        });
        state.error = null;
      })
      .addCase(fetchDueCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  addGeneratedCard,
  removeGeneratedCard,
  clearGeneratedCards,
  updateCardLocally,
  clearCardError,
  clearCards,
} = cardSlice.actions;

// Selectors
export const selectCardState = (state: { card: CardState }) => state.card;

export const selectAllCards = (state: { card: CardState }) =>
  state.card.allIds.map((id) => state.card.byId[id]);

export const selectCardById =
  (cardId: string) => (state: { card: CardState }) =>
    state.card.byId[cardId];

export const selectCardsByDeckId =
  (deckId: string) => (state: { card: CardState }) =>
    state.card.allIds
      .map((id) => state.card.byId[id])
      .filter((card) => card.deck_id === deckId);

export const selectGeneratedCards = (state: { card: CardState }) =>
  state.card.generatingCardIds.map((id) => state.card.byId[id]);

export const selectCardLoading = (state: { card: CardState }) =>
  state.card.loading;

export const selectCardError = (state: { card: CardState }) => state.card.error;

// Reducer
export default cardSlice.reducer;
