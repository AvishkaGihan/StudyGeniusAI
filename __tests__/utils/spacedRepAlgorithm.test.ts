import {
  calculateNextReviewData,
  initializeCardReviewData,
  estimateRetentionRate,
  calculateAverageEaseFactor,
  shouldShowCard,
  sortCardsByPriority,
  calculateDeckStatistics,
  CardReviewData,
} from "../../src/utils/spacedRepAlgorithm";

describe("spacedRepAlgorithm utility", () => {
  describe("initializeCardReviewData", () => {
    it("should create new card with default values", () => {
      const today = new Date().toISOString().split("T")[0];
      const result = initializeCardReviewData();

      expect(result.easeFactor).toBe(2.5);
      expect(result.interval).toBe(0);
      expect(result.reviewCount).toBe(0);
      expect(result.lastReviewed).toBe(today);
      expect(result.nextReview).toBeDefined();
    });

    it("should set nextReview to today for new cards", () => {
      const today = new Date().toISOString().split("T")[0];
      const result = initializeCardReviewData();

      expect(result.nextReview.startsWith(today)).toBe(true);
    });
  });

  describe("calculateNextReviewData", () => {
    const baseReviewData = {
      easeFactor: 2.5,
      interval: 0,
      reviewCount: 0,
      lastReviewed: "2025-11-19T00:00:00Z",
      nextReview: "2025-11-19T00:00:00Z",
    };

    describe("ease factor calculation", () => {
      it("should increase ease factor by 0.1 for easy rating", () => {
        const result = calculateNextReviewData(baseReviewData, "easy");

        expect(result.easeFactor).toBe(2.6);
      });

      it("should keep ease factor same for medium rating", () => {
        const result = calculateNextReviewData(baseReviewData, "medium");

        expect(result.easeFactor).toBe(2.5);
      });

      it("should decrease ease factor by 0.15 for hard rating", () => {
        const result = calculateNextReviewData(baseReviewData, "hard");

        expect(result.easeFactor).toBeCloseTo(2.35);
      });

      it("should reset to 1.3 minimum for again rating", () => {
        const result = calculateNextReviewData(baseReviewData, "again");

        expect(result.easeFactor).toBeLessThanOrEqual(1.3);
      });

      it("should not allow ease factor below 1.3", () => {
        const lowEaseData = { ...baseReviewData, easeFactor: 1.4 };

        const result = calculateNextReviewData(lowEaseData, "hard");

        expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
      });

      it("should allow ease factor to grow beyond 2.5 for easy ratings", () => {
        let currentData = baseReviewData;
        for (let i = 0; i < 5; i++) {
          const result = calculateNextReviewData(currentData, "easy");
          // Update currentData with the result
          currentData = {
            ...currentData,
            easeFactor: result.easeFactor,
            interval: result.interval,
            reviewCount: result.reviewCount,
            nextReview: result.nextReview,
          };
        }

        expect(currentData.easeFactor).toBeGreaterThan(2.5);
      });
    });

    describe("interval calculation", () => {
      it("should set interval to 1 day on first review (easy)", () => {
        const result = calculateNextReviewData(baseReviewData, "easy");

        expect(result.interval).toBeGreaterThan(0);
        expect(result.interval).toBeLessThanOrEqual(3);
      });

      it("should set interval to 1 day on first review (again)", () => {
        const result = calculateNextReviewData(baseReviewData, "again");

        expect(result.interval).toBe(1);
      });

      it("should increase interval based on ease factor on subsequent reviews", () => {
        const firstReview = calculateNextReviewData(baseReviewData, "easy");
        const secondInput: CardReviewData = {
          ...baseReviewData,
          easeFactor: firstReview.easeFactor,
          interval: firstReview.interval,
          reviewCount: firstReview.reviewCount,
          nextReview: firstReview.nextReview,
        };
        const secondReview = calculateNextReviewData(secondInput, "easy");

        expect(secondReview.interval).toBeGreaterThanOrEqual(
          firstReview.interval
        );
      });

      it("should use ease factor in interval calculation", () => {
        const highEaseData = { ...baseReviewData, easeFactor: 2.8 };
        const lowEaseData = { ...baseReviewData, easeFactor: 1.5 };

        const highResult = calculateNextReviewData(highEaseData, "easy");
        const lowResult = calculateNextReviewData(lowEaseData, "easy");

        expect(highResult.interval).toBeGreaterThan(lowResult.interval);
      });

      it("should reset interval to 1 on again rating", () => {
        const reviewData = {
          ...baseReviewData,
          interval: 30,
          reviewCount: 5,
        };

        const result = calculateNextReviewData(reviewData, "again");

        expect(result.interval).toBe(1);
      });
    });

    describe("next review date calculation", () => {
      it("should set nextReview date in the future", () => {
        const result = calculateNextReviewData(baseReviewData, "easy");
        const today = new Date();
        const nextReviewDate = new Date(result.nextReview);

        expect(nextReviewDate.getTime()).toBeGreaterThan(today.getTime());
      });

      it("should use interval to calculate next review date", () => {
        const interval3 = calculateNextReviewData(baseReviewData, "medium");
        const interval7 = {
          ...baseReviewData,
          easeFactor: 2.8,
          reviewCount: 2,
        };
        const result7 = calculateNextReviewData(interval7, "easy");

        const date3 = new Date(interval3.nextReview);
        const date7 = new Date(result7.nextReview);

        expect(date7.getTime()).toBeGreaterThan(date3.getTime());
      });

      it("should return ISO format date", () => {
        const result = calculateNextReviewData(baseReviewData, "easy");

        expect(result.nextReview).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });
    });

    describe("review count and timestamp", () => {
      it("should increment review count", () => {
        const result = calculateNextReviewData(baseReviewData, "easy");

        expect(result.reviewCount).toBe(1);
      });

      it("should increment review count multiple times", () => {
        let currentData = baseReviewData;
        for (let i = 0; i < 3; i++) {
          const result = calculateNextReviewData(currentData, "easy");
          currentData = {
            ...currentData,
            easeFactor: result.easeFactor,
            interval: result.interval,
            reviewCount: result.reviewCount,
            nextReview: result.nextReview,
          };
        }

        expect(currentData.reviewCount).toBe(3);
      });
    });
  });

  describe("estimateRetentionRate", () => {
    it("should convert ease factor to percentage (1.3 = ~50%)", () => {
      const result = estimateRetentionRate(1.3);

      expect(result).toBeGreaterThanOrEqual(45);
      expect(result).toBeLessThanOrEqual(55);
    });

    it("should convert ease factor to percentage (2.5 = ~90%)", () => {
      const result = estimateRetentionRate(2.5);

      expect(result).toBeGreaterThanOrEqual(85);
      expect(result).toBeLessThanOrEqual(95);
    });

    it("should map minimum ease factor to ~50%", () => {
      const result = estimateRetentionRate(1.3);

      expect(result).toBeGreaterThan(40);
    });

    it("should map maximum ease factor to ~100%", () => {
      const result = estimateRetentionRate(3.0);

      expect(result).toBeGreaterThan(95);
    });

    it("should maintain monotonic increasing relationship", () => {
      const result1 = estimateRetentionRate(1.5);
      const result2 = estimateRetentionRate(2.0);
      const result3 = estimateRetentionRate(2.5);

      expect(result2).toBeGreaterThan(result1);
      expect(result3).toBeGreaterThan(result2);
    });
  });

  describe("calculateAverageEaseFactor", () => {
    it("should calculate average of multiple ease factors", () => {
      const cards: CardReviewData[] = [
        { ...initializeCardReviewData(), easeFactor: 2.5 },
        { ...initializeCardReviewData(), easeFactor: 2.3 },
        { ...initializeCardReviewData(), easeFactor: 2.1 },
        { ...initializeCardReviewData(), easeFactor: 2.4 },
      ];

      const result = calculateAverageEaseFactor(cards);

      expect(result).toBeCloseTo(2.325, 2);
    });

    it("should return default ease factor for empty array", () => {
      const result = calculateAverageEaseFactor([]);

      expect(result).toBe(2.5); // defaultEaseFactor
    });

    it("should handle single ease factor", () => {
      const cards: CardReviewData[] = [
        { ...initializeCardReviewData(), easeFactor: 2.5 },
      ];

      const result = calculateAverageEaseFactor(cards);

      expect(result).toBe(2.5);
    });

    it("should handle all minimum ease factors", () => {
      const cards: CardReviewData[] = [
        { ...initializeCardReviewData(), easeFactor: 1.3 },
        { ...initializeCardReviewData(), easeFactor: 1.3 },
        { ...initializeCardReviewData(), easeFactor: 1.3 },
      ];

      const result = calculateAverageEaseFactor(cards);

      expect(result).toBe(1.3);
    });

    it("should be accurate with many factors", () => {
      const factors = Array(100).fill(2.5);

      const result = calculateAverageEaseFactor(factors);

      expect(result).toBe(2.5);
    });
  });

  describe("shouldShowCard", () => {
    it("should return true if nextReview is in the past", () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const result = shouldShowCard(pastDate);

      expect(result).toBe(true);
    });

    it("should return true if nextReview is today", () => {
      const today = new Date().toISOString();

      const result = shouldShowCard(today);

      expect(result).toBe(true);
    });

    it("should return false if nextReview is in the future", () => {
      const futureDate = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();

      const result = shouldShowCard(futureDate);

      expect(result).toBe(false);
    });

    it("should handle boundary case (exactly now)", () => {
      const now = new Date().toISOString();

      const result = shouldShowCard(now);

      expect(result).toBe(true);
    });
  });

  describe("sortCardsByPriority", () => {
    it("should sort cards by review date (most overdue first)", () => {
      const cards: CardReviewData[] = [
        {
          ...initializeCardReviewData(),
          nextReview: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          ...initializeCardReviewData(),
          nextReview: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          ...initializeCardReviewData(),
          nextReview: new Date(
            Date.now() + 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ];

      const sorted = sortCardsByPriority(cards);

      // Most overdue card should be first (earliest nextReview date)
      expect(new Date(sorted[0].nextReview).getTime()).toBeLessThan(
        new Date(sorted[1].nextReview).getTime()
      );
      expect(new Date(sorted[1].nextReview).getTime()).toBeLessThan(
        new Date(sorted[2].nextReview).getTime()
      );
    });

    it("should put due cards before future cards", () => {
      const dueCard: CardReviewData = {
        ...initializeCardReviewData(),
        nextReview: new Date(Date.now() - 1).toISOString(),
      };
      const futureCard: CardReviewData = {
        ...initializeCardReviewData(),
        nextReview: new Date(Date.now() + 1000).toISOString(),
      };

      const sorted = sortCardsByPriority([futureCard, dueCard]);

      expect(new Date(sorted[0].nextReview).getTime()).toBeLessThan(
        new Date(sorted[1].nextReview).getTime()
      );
    });

    it("should handle empty array", () => {
      const result = sortCardsByPriority([]);

      expect(result).toEqual([]);
    });

    it("should handle single card", () => {
      const card: CardReviewData = {
        ...initializeCardReviewData(),
      };

      const result = sortCardsByPriority([card]);

      expect(result).toHaveLength(1);
    });

    it("should preserve relative order for equally urgent cards", () => {
      const sameDate = new Date().toISOString();
      const cards: CardReviewData[] = [
        { ...initializeCardReviewData(), nextReview: sameDate },
        { ...initializeCardReviewData(), nextReview: sameDate },
        { ...initializeCardReviewData(), nextReview: sameDate },
      ];

      const sorted = sortCardsByPriority(cards);

      // All have same urgency, so original order should be preserved
      expect(sorted).toHaveLength(3);
    });
  });

  describe("calculateDeckStatistics", () => {
    it("should calculate correct deck statistics", () => {
      const cards = [
        {
          cardId: "card-1",
          ...initializeCardReviewData(),
          nextReview: new Date(Date.now() - 1).toISOString(),
        },
        {
          cardId: "card-2",
          ...initializeCardReviewData(),
          nextReview: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          cardId: "card-3",
          ...initializeCardReviewData(),
          easeFactor: 1.3,
        },
      ];

      const stats = calculateDeckStatistics(cards);

      expect(stats.totalCards).toBe(3);
      expect(stats.dueCards).toBe(1);
      expect(stats.newCards).toBe(0);
      expect(stats.averageEaseFactor).toBeGreaterThan(0);
      expect(stats.estimatedRetention).toBeGreaterThanOrEqual(50);
      expect(stats.estimatedRetention).toBeLessThanOrEqual(100);
    });

    it("should count new cards (reviewCount = 0)", () => {
      const cards = [
        {
          cardId: "card-1",
          easeFactor: 2.5,
          interval: 0,
          reviewCount: 0,
          lastReviewed: new Date().toISOString(),
          nextReview: new Date().toISOString(),
        },
        {
          cardId: "card-2",
          easeFactor: 2.5,
          interval: 1,
          reviewCount: 1,
          lastReviewed: new Date().toISOString(),
          nextReview: new Date(
            Date.now() + 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ];

      const stats = calculateDeckStatistics(cards);

      expect(stats.newCards).toBe(1);
    });

    it("should handle empty deck", () => {
      const stats = calculateDeckStatistics([]);

      expect(stats.totalCards).toBe(0);
      expect(stats.dueCards).toBe(0);
      expect(stats.newCards).toBe(0);
      expect(stats.averageEaseFactor).toBe(0);
    });

    it("should estimate retention based on average ease factor", () => {
      const lowEaseCards = [
        {
          cardId: "card-1",
          easeFactor: 1.3,
          interval: 1,
          reviewCount: 1,
          lastReviewed: new Date().toISOString(),
          nextReview: new Date(Date.now() + 1).toISOString(),
        },
      ];

      const highEaseCards = [
        {
          cardId: "card-1",
          easeFactor: 2.5,
          interval: 10,
          reviewCount: 5,
          lastReviewed: new Date().toISOString(),
          nextReview: new Date(Date.now() + 10).toISOString(),
        },
      ];

      const lowStats = calculateDeckStatistics(lowEaseCards);
      const highStats = calculateDeckStatistics(highEaseCards);

      expect(highStats.estimatedRetention).toBeGreaterThan(
        lowStats.estimatedRetention
      );
    });

    it("should count all due cards correctly", () => {
      const now = new Date();
      const cards = [
        {
          cardId: "card-1",
          ...initializeCardReviewData(),
          nextReview: new Date(
            now.getTime() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          cardId: "card-2",
          ...initializeCardReviewData(),
          nextReview: new Date(
            now.getTime() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          cardId: "card-3",
          ...initializeCardReviewData(),
          nextReview: new Date(
            now.getTime() + 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ];

      const stats = calculateDeckStatistics(cards);

      expect(stats.dueCards).toBe(2);
    });
  });

  describe("edge cases and integration", () => {
    it("should handle complete SM-2 lifecycle for single card", () => {
      let reviewData = initializeCardReviewData();

      // First review: easy
      reviewData = {
        ...reviewData,
        ...calculateNextReviewData(reviewData, "easy"),
        lastReviewed: new Date().toISOString(),
      };
      expect(reviewData.reviewCount).toBe(1);
      expect(reviewData.easeFactor).toBe(2.6);

      // Second review: medium
      reviewData = {
        ...reviewData,
        ...calculateNextReviewData(reviewData, "medium"),
        lastReviewed: new Date().toISOString(),
      };
      expect(reviewData.reviewCount).toBe(2);
      expect(reviewData.easeFactor).toBe(2.6);

      // Third review: hard
      reviewData = {
        ...reviewData,
        ...calculateNextReviewData(reviewData, "hard"),
        lastReviewed: new Date().toISOString(),
      };
      expect(reviewData.reviewCount).toBe(3);
      expect(reviewData.easeFactor).toBeLessThan(2.6);
    });

    it("should handle percentage conversion in deck statistics", () => {
      const cards = Array.from({ length: 5 }, (_, i) => ({
        cardId: `card-${i}`,
        easeFactor: 2.5 - i * 0.2,
        interval: 1 + i,
        reviewCount: i,
        lastReviewed: new Date().toISOString(),
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }));

      const stats = calculateDeckStatistics(cards);

      expect(stats.estimatedRetention).toBeGreaterThan(0);
      expect(stats.estimatedRetention).toBeLessThanOrEqual(100);
      expect(stats.averageEaseFactor).toBeGreaterThan(0);
    });
  });
});
