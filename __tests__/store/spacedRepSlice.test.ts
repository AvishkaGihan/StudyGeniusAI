import { configureStore, Reducer } from "@reduxjs/toolkit";
import spacedRepSlice, {
  calculateNextReview,
  clearSpacedRepState,
  selectCurrentEaseFactor,
  selectNextReviewDate,
  selectCurrentInterval,
  selectReviewHistory,
  selectReviewStats,
} from "../../src/store/slices/spacedRepSlice";
import { RootState } from "../../src/store";
import { CardReviewData } from "../../src/utils/spacedRepAlgorithm";

type TestState = Pick<RootState, "spacedRep">;

function createTestStore(preloadedState?: Partial<TestState>) {
  return configureStore({
    reducer: {
      spacedRep: spacedRepSlice as Reducer,
    },
    preloadedState,
  });
}

describe("spacedRepSlice", () => {
  describe("initial state", () => {
    it("should have correct default values", () => {
      const store = createTestStore();
      const state = store.getState() as RootState;

      expect(state.spacedRep.currentCardEaseFactor).toBe(2.5);
      expect(state.spacedRep.nextReviewDate).toBeNull();
      expect(state.spacedRep.currentInterval).toBe(0);
      expect(state.spacedRep.reviewHistory).toEqual([]);
    });
  });

  describe("calculateNextReview action", () => {
    it("should update state with easy difficulty response", () => {
      const store = createTestStore();

      const currentData: CardReviewData = {
        easeFactor: 2.5,
        interval: 1,
        reviewCount: 0,
        lastReviewed: "2025-11-19T10:00:00Z",
        nextReview: "2025-11-19T10:00:00Z",
      };

      store.dispatch(
        calculateNextReview({
          cardId: "card-1",
          currentData,
          difficulty: "easy",
        })
      );
      const state = (store.getState() as RootState).spacedRep;

      expect(state.currentCardEaseFactor).toBeGreaterThan(2.5);
      expect(state.currentInterval).toBeGreaterThan(0);
      expect(state.nextReviewDate).not.toBeNull();
    });

    it("should update state with medium difficulty response", () => {
      const store = createTestStore();

      const currentData: CardReviewData = {
        easeFactor: 2.5,
        interval: 1,
        reviewCount: 0,
        lastReviewed: "2025-11-19T10:00:00Z",
        nextReview: "2025-11-19T10:00:00Z",
      };

      store.dispatch(
        calculateNextReview({
          cardId: "card-1",
          currentData,
          difficulty: "medium",
        })
      );
      const state = (store.getState() as RootState).spacedRep;

      expect(state.currentCardEaseFactor).toBe(2.5);
      expect(state.currentInterval).toBeGreaterThan(0);
    });

    it("should decrease ease factor with hard difficulty", () => {
      const store = createTestStore();

      const currentData: CardReviewData = {
        easeFactor: 2.5,
        interval: 1,
        reviewCount: 0,
        lastReviewed: "2025-11-19T10:00:00Z",
        nextReview: "2025-11-19T10:00:00Z",
      };

      store.dispatch(
        calculateNextReview({
          cardId: "card-1",
          currentData,
          difficulty: "hard",
        })
      );
      const state = (store.getState() as RootState).spacedRep;

      expect(state.currentCardEaseFactor).toBeLessThan(2.5);
      expect(state.currentCardEaseFactor).toBeGreaterThanOrEqual(1.3);
    });

    it("should reset to minimum ease factor with again difficulty", () => {
      const store = createTestStore();

      const currentData: CardReviewData = {
        easeFactor: 2.5,
        interval: 1,
        reviewCount: 5,
        lastReviewed: "2025-11-19T10:00:00Z",
        nextReview: "2025-11-19T10:00:00Z",
      };

      store.dispatch(
        calculateNextReview({
          cardId: "card-1",
          currentData,
          difficulty: "again",
        })
      );
      const state = (store.getState() as RootState).spacedRep;

      expect(state.currentCardEaseFactor).toBeLessThanOrEqual(1.3);
      expect(state.currentInterval).toBe(1);
    });

    it("should add entry to review history", () => {
      const store = createTestStore();

      const currentData: CardReviewData = {
        easeFactor: 2.5,
        interval: 1,
        reviewCount: 0,
        lastReviewed: "2025-11-19T10:00:00Z",
        nextReview: "2025-11-19T10:00:00Z",
      };

      store.dispatch(
        calculateNextReview({
          cardId: "card-1",
          currentData,
          difficulty: "easy",
        })
      );
      const state = (store.getState() as RootState).spacedRep;

      expect(state.reviewHistory.length).toBeGreaterThan(0);
      expect(state.reviewHistory[0]).toMatchObject({
        cardId: "card-1",
        difficulty: "easy",
      });
    });

    it("should limit review history to 100 entries", () => {
      const historyArray = Array.from({ length: 100 }, (_, i) => ({
        cardId: `card-${i}`,
        difficulty: "easy" as const,
        timestamp: "2025-11-19T10:00:00Z",
        easeFactor: 2.5,
        interval: 1,
      }));

      const store = createTestStore({
        spacedRep: {
          currentCardEaseFactor: 2.5,
          nextReviewDate: null,
          currentInterval: 0,
          reviewHistory: historyArray,
        } as any,
      });

      const currentData: CardReviewData = {
        easeFactor: 2.5,
        interval: 1,
        reviewCount: 0,
        lastReviewed: "2025-11-19T10:00:00Z",
        nextReview: "2025-11-19T10:00:00Z",
      };

      store.dispatch(
        calculateNextReview({
          cardId: "card-101",
          currentData,
          difficulty: "easy",
        })
      );
      const state = (store.getState() as RootState).spacedRep;

      expect(state.reviewHistory.length).toBeLessThanOrEqual(100);
    });
  });

  describe("clearSpacedRepState action", () => {
    it("should reset state to initial values", () => {
      const initialState = {
        currentCardEaseFactor: 1.5,
        nextReviewDate: "2025-11-20T10:00:00Z",
        currentInterval: 5,
        reviewHistory: [
          {
            cardId: "card-1",
            difficulty: "easy" as const,
            timestamp: "2025-11-19T10:00:00Z",
            easeFactor: 2.5,
            interval: 1,
          },
        ],
      };

      const store = createTestStore({
        spacedRep: initialState as any,
      });

      store.dispatch(clearSpacedRepState());
      const state = (store.getState() as RootState).spacedRep;

      expect(state.currentCardEaseFactor).toBe(2.5);
      expect(state.nextReviewDate).toBeNull();
      expect(state.currentInterval).toBe(0);
      expect(state.reviewHistory).toEqual([]);
    });
  });

  describe("selectors", () => {
    it("selectCurrentEaseFactor should return current ease factor", () => {
      const store = createTestStore({
        spacedRep: {
          currentCardEaseFactor: 1.8,
          nextReviewDate: null,
          currentInterval: 0,
          reviewHistory: [],
        } as any,
      });

      const state = store.getState() as RootState;
      const easeFactor = selectCurrentEaseFactor(state);

      expect(easeFactor).toBe(1.8);
    });

    it("selectNextReviewDate should return next review date", () => {
      const reviewDate = "2025-11-20T10:00:00Z";
      const store = createTestStore({
        spacedRep: {
          currentCardEaseFactor: 2.5,
          nextReviewDate: reviewDate,
          currentInterval: 3,
          reviewHistory: [],
        } as any,
      });

      const state = store.getState() as RootState;
      const date = selectNextReviewDate(state);

      expect(date).toBe(reviewDate);
    });

    it("selectCurrentInterval should return current interval", () => {
      const store = createTestStore({
        spacedRep: {
          currentCardEaseFactor: 2.5,
          nextReviewDate: null,
          currentInterval: 7,
          reviewHistory: [],
        } as any,
      });

      const state = store.getState() as RootState;
      const interval = selectCurrentInterval(state);

      expect(interval).toBe(7);
    });

    it("selectReviewHistory should return review history", () => {
      const history = [
        {
          cardId: "card-1",
          difficulty: "easy" as const,
          timestamp: "2025-11-19T10:00:00Z",
          easeFactor: 2.5,
          interval: 1,
        },
      ];

      const store = createTestStore({
        spacedRep: {
          currentCardEaseFactor: 2.5,
          nextReviewDate: null,
          currentInterval: 0,
          reviewHistory: history,
        } as any,
      });

      const state = store.getState() as RootState;
      const historyResult = selectReviewHistory(state);

      expect(historyResult).toEqual(history);
    });

    it("selectReviewStats should calculate statistics correctly", () => {
      const history = [
        {
          cardId: "card-1",
          difficulty: "easy" as const,
          timestamp: "2025-11-19T10:00:00Z",
          easeFactor: 2.5,
          interval: 1,
        },
        {
          cardId: "card-2",
          difficulty: "hard" as const,
          timestamp: "2025-11-19T10:05:00Z",
          easeFactor: 2.0,
          interval: 1,
        },
      ];

      const store = createTestStore({
        spacedRep: {
          currentCardEaseFactor: 2.5,
          nextReviewDate: null,
          currentInterval: 0,
          reviewHistory: history,
        } as any,
      });

      const state = store.getState() as RootState;
      const stats = selectReviewStats(state);

      expect(stats).toHaveProperty("totalReviews");
      expect(stats).toHaveProperty("averageEaseFactor");
      expect(stats).toHaveProperty("difficultyDistribution");
      expect(stats.totalReviews).toBe(2);
    });
  });

  describe("edge cases", () => {
    it("should handle multiple sequential reviews", () => {
      const store = createTestStore();

      for (let i = 0; i < 3; i++) {
        const currentData: CardReviewData = {
          easeFactor: (store.getState() as RootState).spacedRep
            .currentCardEaseFactor,
          interval: (store.getState() as RootState).spacedRep.currentInterval,
          reviewCount: i,
          lastReviewed: new Date().toISOString(),
          nextReview: new Date().toISOString(),
        };

        store.dispatch(
          calculateNextReview({
            cardId: "card-1",
            currentData,
            difficulty: "easy",
          })
        );
      }

      const state = (store.getState() as RootState).spacedRep;

      expect(state.reviewHistory.length).toBe(3);
      expect(state.currentCardEaseFactor).toBeGreaterThan(2.5);
    });

    it("should handle minimum ease factor boundary", () => {
      const store = createTestStore({
        spacedRep: {
          currentCardEaseFactor: 1.3,
          nextReviewDate: null,
          currentInterval: 0,
          reviewHistory: [],
        } as any,
      });

      const currentData: CardReviewData = {
        easeFactor: 1.3,
        interval: 1,
        reviewCount: 5,
        lastReviewed: "2025-11-19T10:00:00Z",
        nextReview: "2025-11-19T10:00:00Z",
      };

      store.dispatch(
        calculateNextReview({
          cardId: "card-1",
          currentData,
          difficulty: "again",
        })
      );
      const state = (store.getState() as RootState).spacedRep;

      expect(state.currentCardEaseFactor).toBeGreaterThanOrEqual(1.3);
    });
  });
});
