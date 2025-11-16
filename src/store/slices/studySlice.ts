import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ActiveStudySession, Card } from "../../utils/types";
import * as sessionApi from "../../services/api/sessionApi";
import { logger } from "../../services/logger";

/**
 * Study Slice
 * Manages active study session state
 */

interface StudyState {
  activeSession: ActiveStudySession | null;
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  isSessionActive: boolean;
}

// Initial state
const initialState: StudyState = {
  activeSession: null,
  loading: false,
  error: null,
  sessionId: null,
  isSessionActive: false,
};

// Async thunks

/**
 * Start new study session
 */
export const startStudySession = createAsyncThunk(
  "study/startSession",
  async (deckId: string, { rejectWithValue }) => {
    try {
      logger.logUserAction("start_study_session", { deckId });

      const response = await sessionApi.createSession({ deckId });

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Failed to start study session"
        );
      }

      logger.logUserAction("study_session_started", {
        sessionId: response.data.session.id,
        cardCount: response.data.cards.length,
      });

      return {
        session: response.data.session,
        cards: response.data.cards,
      };
    } catch (error) {
      logger.error("Start study session failed", { error, deckId });
      return rejectWithValue("Failed to start study session");
    }
  }
);

/**
 * Record card review
 */
export const recordCardReview = createAsyncThunk(
  "study/recordReview",
  async (
    {
      sessionId,
      cardId,
      difficulty,
      timeSpent,
    }: {
      sessionId: string;
      cardId: string;
      difficulty: "again" | "hard" | "medium" | "easy";
      timeSpent: number;
    },
    { rejectWithValue }
  ) => {
    try {
      logger.logUserAction("record_card_review", { cardId, difficulty });

      const response = await sessionApi.recordReview(sessionId, {
        cardId,
        difficulty,
        timeSpent,
      });

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Failed to record review"
        );
      }

      logger.logUserAction("card_review_recorded", { cardId });

      return response.data;
    } catch (error) {
      logger.error("Record review failed", { error, cardId });
      return rejectWithValue("Failed to record review");
    }
  }
);

/**
 * Update session progress
 */
export const updateSessionProgress = createAsyncThunk(
  "study/updateProgress",
  async (
    {
      sessionId,
      cardsReviewed,
      correctCount,
      durationSeconds,
    }: {
      sessionId: string;
      cardsReviewed: number;
      correctCount: number;
      durationSeconds: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await sessionApi.updateSession(sessionId, {
        cardsReviewed,
        correctCount,
        durationSeconds,
      });

      if (!response.success || !response.data) {
        return rejectWithValue(
          response.error?.message || "Failed to update session"
        );
      }

      return response.data.session;
    } catch (error) {
      logger.error("Update session progress failed", { error, sessionId });
      return rejectWithValue("Failed to update session");
    }
  }
);

// Slice
const studySlice = createSlice({
  name: "study",
  initialState,
  reducers: {
    /**
     * Advance to next card
     */
    advanceToNextCard(state) {
      if (state.activeSession) {
        state.activeSession.current_card_index += 1;
        state.activeSession.cards_reviewed += 1;
      }
    },

    /**
     * Increment correct count
     */
    incrementCorrectCount(state) {
      if (state.activeSession) {
        state.activeSession.correct_count += 1;
      }
    },

    /**
     * Update session timer
     */
    updateSessionTimer(state) {
      if (state.activeSession) {
        const elapsed = Date.now() - state.activeSession.session_start_time;
        // Update elapsed time (for display)
      }
    },

    /**
     * End study session
     */
    endStudySession(state) {
      state.activeSession = null;
      state.sessionId = null;
      state.isSessionActive = false;
    },

    /**
     * Clear error
     */
    clearStudyError(state) {
      state.error = null;
    },

    /**
     * Reset study state (on logout)
     */
    resetStudyState(state) {
      state.activeSession = null;
      state.sessionId = null;
      state.isSessionActive = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Start study session
    builder
      .addCase(startStudySession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startStudySession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionId = action.payload.session.id;
        state.activeSession = {
          deck_id: action.payload.session.deck_id,
          current_card_index: 0,
          cards: action.payload.cards,
          session_start_time: Date.now(),
          cards_reviewed: 0,
          correct_count: 0,
        };
        state.isSessionActive = true;
        state.error = null;
      })
      .addCase(startStudySession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isSessionActive = false;
      });

    // Record card review
    builder
      .addCase(recordCardReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordCardReview.fulfilled, (state, action) => {
        state.loading = false;

        // Update current card with new review data
        if (state.activeSession) {
          const currentIndex = state.activeSession.current_card_index;
          if (currentIndex < state.activeSession.cards.length) {
            state.activeSession.cards[currentIndex] = action.payload.card;
          }

          // Update progress
          state.activeSession.cards_reviewed =
            action.payload.sessionProgress.cardsReviewed;
          state.activeSession.correct_count =
            action.payload.sessionProgress.correctCount;

          // Check if there are more cards
          if (action.payload.sessionProgress.cardsRemaining === 0) {
            // Session complete
            state.isSessionActive = false;
          }
        }

        state.error = null;
      })
      .addCase(recordCardReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update session progress
    builder
      .addCase(updateSessionProgress.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSessionProgress.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateSessionProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const {
  advanceToNextCard,
  incrementCorrectCount,
  updateSessionTimer,
  endStudySession,
  clearStudyError,
  resetStudyState,
} = studySlice.actions;

// Selectors
export const selectStudyState = (state: { study: StudyState }) => state.study;

export const selectActiveSession = (state: { study: StudyState }) =>
  state.study.activeSession;

export const selectCurrentCard = (state: { study: StudyState }) => {
  const session = state.study.activeSession;
  if (!session) return null;

  const currentIndex = session.current_card_index;
  if (currentIndex >= session.cards.length) return null;

  return session.cards[currentIndex];
};

export const selectSessionProgress = (state: { study: StudyState }) => {
  const session = state.study.activeSession;
  if (!session) return null;

  return {
    current: session.current_card_index + 1,
    total: session.cards.length,
    cardsReviewed: session.cards_reviewed,
    correctCount: session.correct_count,
    percentComplete: Math.round(
      ((session.current_card_index + 1) / session.cards.length) * 100
    ),
  };
};

export const selectIsSessionActive = (state: { study: StudyState }) =>
  state.study.isSessionActive;

export const selectStudyLoading = (state: { study: StudyState }) =>
  state.study.loading;

export const selectStudyError = (state: { study: StudyState }) =>
  state.study.error;

// Reducer
export default studySlice.reducer;
