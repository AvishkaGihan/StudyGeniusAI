import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReviewDifficulty } from "../../utils/types";
import {
  calculateNextReviewData,
  CardReviewData,
  ReviewResult,
} from "../../utils/spacedRepAlgorithm";
import { logger } from "../../services/logger";

/**
 * Spaced Repetition Slice
 * Manages SM-2 algorithm state and calculations
 */

interface SpacedRepState {
  currentCardEaseFactor: number;
  nextReviewDate: string | null;
  currentInterval: number; // days
  reviewHistory: Array<{
    cardId: string;
    difficulty: ReviewDifficulty;
    timestamp: string;
    easeFactor: number;
    interval: number;
  }>;
}

// Initial state
const initialState: SpacedRepState = {
  currentCardEaseFactor: 2.5,
  nextReviewDate: null,
  currentInterval: 0,
  reviewHistory: [],
};

// Slice
const spacedRepSlice = createSlice({
  name: "spacedRep",
  initialState,
  reducers: {
    /**
     * Calculate next review based on difficulty
     */
    calculateNextReview(
      state,
      action: PayloadAction<{
        cardId: string;
        currentData: CardReviewData;
        difficulty: ReviewDifficulty;
      }>
    ) {
      const { cardId, currentData, difficulty } = action.payload;

      logger.info("Calculating next review", {
        cardId,
        difficulty,
        currentEaseFactor: currentData.easeFactor,
      });

      // Calculate using SM-2 algorithm
      const result = calculateNextReviewData(currentData, difficulty);

      // Update state
      state.currentCardEaseFactor = result.easeFactor;
      state.nextReviewDate = result.nextReview;
      state.currentInterval = result.interval;

      // Add to history
      state.reviewHistory.push({
        cardId,
        difficulty,
        timestamp: new Date().toISOString(),
        easeFactor: result.easeFactor,
        interval: result.interval,
      });

      // Keep only last 100 reviews
      if (state.reviewHistory.length > 100) {
        state.reviewHistory = state.reviewHistory.slice(-100);
      }

      logger.info("Next review calculated", {
        cardId,
        easeFactor: result.easeFactor,
        interval: result.interval,
        nextReview: result.nextReview,
      });
    },

    /**
     * Set current card ease factor
     */
    setCurrentEaseFactor(state, action: PayloadAction<number>) {
      state.currentCardEaseFactor = action.payload;
    },

    /**
     * Set next review date
     */
    setNextReviewDate(state, action: PayloadAction<string>) {
      state.nextReviewDate = action.payload;
    },

    /**
     * Clear spaced rep state
     */
    clearSpacedRepState(state) {
      state.currentCardEaseFactor = 2.5;
      state.nextReviewDate = null;
      state.currentInterval = 0;
    },

    /**
     * Clear review history
     */
    clearReviewHistory(state) {
      state.reviewHistory = [];
    },

    /**
     * Reset spaced rep state (on logout)
     */
    resetSpacedRepState() {
      return initialState;
    },
  },
});

// Actions
export const {
  calculateNextReview,
  setCurrentEaseFactor,
  setNextReviewDate,
  clearSpacedRepState,
  clearReviewHistory,
  resetSpacedRepState,
} = spacedRepSlice.actions;

// Selectors
export const selectSpacedRepState = (state: { spacedRep: SpacedRepState }) =>
  state.spacedRep;

export const selectCurrentEaseFactor = (state: { spacedRep: SpacedRepState }) =>
  state.spacedRep.currentCardEaseFactor;

export const selectNextReviewDate = (state: { spacedRep: SpacedRepState }) =>
  state.spacedRep.nextReviewDate;

export const selectCurrentInterval = (state: { spacedRep: SpacedRepState }) =>
  state.spacedRep.currentInterval;

export const selectReviewHistory = (state: { spacedRep: SpacedRepState }) =>
  state.spacedRep.reviewHistory;

export const selectRecentReviews =
  (limit: number = 10) =>
  (state: { spacedRep: SpacedRepState }) =>
    state.spacedRep.reviewHistory.slice(-limit).reverse();

export const selectAverageEaseFactor = (state: {
  spacedRep: SpacedRepState;
}) => {
  const history = state.spacedRep.reviewHistory;
  if (history.length === 0) return 2.5;

  const sum = history.reduce((acc, review) => acc + review.easeFactor, 0);
  return sum / history.length;
};

export const selectReviewStats = (state: { spacedRep: SpacedRepState }) => {
  const history = state.spacedRep.reviewHistory;

  if (history.length === 0) {
    return {
      totalReviews: 0,
      averageEaseFactor: 2.5,
      averageInterval: 0,
      difficultyDistribution: {
        again: 0,
        hard: 0,
        medium: 0,
        easy: 0,
      },
    };
  }

  const totalReviews = history.length;
  const averageEaseFactor =
    history.reduce((sum, r) => sum + r.easeFactor, 0) / totalReviews;
  const averageInterval =
    history.reduce((sum, r) => sum + r.interval, 0) / totalReviews;

  const difficultyDistribution = {
    again: history.filter((r) => r.difficulty === "again").length,
    hard: history.filter((r) => r.difficulty === "hard").length,
    medium: history.filter((r) => r.difficulty === "medium").length,
    easy: history.filter((r) => r.difficulty === "easy").length,
  };

  return {
    totalReviews,
    averageEaseFactor,
    averageInterval,
    difficultyDistribution,
  };
};

// Reducer
export default spacedRepSlice.reducer;
