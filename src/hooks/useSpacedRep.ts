import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  calculateNextReview,
  selectCurrentEaseFactor,
  selectNextReviewDate,
  selectCurrentInterval,
  selectReviewStats,
  selectAverageEaseFactor,
} from "../store/slices/spacedRepSlice";
import { ReviewDifficulty, Card } from "../utils/types";
import { CardReviewData } from "../utils/spacedRepAlgorithm";
import { formatDueDate } from "../utils/dateUtils";
import { logger } from "../services/logger";

/**
 * useSpacedRep Hook
 * Custom hook for spaced repetition calculations (SM-2 algorithm)
 */
export function useSpacedRep() {
  const dispatch = useAppDispatch();

  const currentEaseFactor = useAppSelector(selectCurrentEaseFactor);
  const nextReviewDate = useAppSelector(selectNextReviewDate);
  const currentInterval = useAppSelector(selectCurrentInterval);
  const reviewStats = useAppSelector(selectReviewStats);
  const averageEaseFactor = useAppSelector(selectAverageEaseFactor);

  /**
   * Calculate next review for a card
   */
  const calculateCardReview = useCallback(
    (card: Card, difficulty: ReviewDifficulty) => {
      const currentData: CardReviewData = {
        easeFactor: card.ease_factor,
        interval: currentInterval,
        reviewCount: card.review_count,
        lastReviewed: card.last_reviewed || new Date().toISOString(),
        nextReview: card.next_review || new Date().toISOString(),
      };

      dispatch(
        calculateNextReview({
          cardId: card.id,
          currentData,
          difficulty,
        })
      );

      logger.info("Card review calculated", {
        cardId: card.id,
        difficulty,
        oldEaseFactor: card.ease_factor,
        newEaseFactor: currentEaseFactor,
      });
    },
    [dispatch, currentEaseFactor, currentInterval]
  );

  /**
   * Get formatted due date
   */
  const getFormattedDueDate = useCallback((card: Card) => {
    return formatDueDate(card.next_review ?? null);
  }, []);

  /**
   * Check if card is due
   */
  const isCardDue = useCallback((card: Card) => {
    if (!card.next_review) return true;
    const dueDate = new Date(card.next_review);
    const now = new Date();
    return dueDate <= now;
  }, []);

  /**
   * Get days until next review
   */
  const getDaysUntilReview = useCallback((card: Card) => {
    if (!card.next_review) return 0;
    const dueDate = new Date(card.next_review);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, []);

  /**
   * Estimate retention based on ease factor
   */
  const estimateRetention = useCallback((easeFactor: number) => {
    // Simple estimation: higher ease factor = better retention
    // 1.3 (min) = 50% retention, 2.5 (default) = 85% retention
    const minEase = 1.3;
    const maxEase = 2.5;
    const normalized = (easeFactor - minEase) / (maxEase - minEase);
    return Math.round(50 + normalized * 50); // 50% to 100%
  }, []);

  /**
   * Get difficulty distribution
   */
  const getDifficultyDistribution = useCallback(() => {
    const total = reviewStats.totalReviews;
    if (total === 0) {
      return {
        again: 0,
        hard: 0,
        medium: 0,
        easy: 0,
      };
    }

    const dist = reviewStats.difficultyDistribution;
    return {
      again: Math.round((dist.again / total) * 100),
      hard: Math.round((dist.hard / total) * 100),
      medium: Math.round((dist.medium / total) * 100),
      easy: Math.round((dist.easy / total) * 100),
    };
  }, [reviewStats]);

  /**
   * Get recommended study cards count
   */
  const getRecommendedStudyCount = useCallback((dueCards: Card[]) => {
    // Recommend studying 10-20 cards per session
    const dueCount = dueCards.length;

    if (dueCount <= 10) return dueCount;
    if (dueCount <= 30) return 20;
    return 30; // Cap at 30 cards per session
  }, []);

  /**
   * Sort cards by priority (most overdue first)
   */
  const sortCardsByPriority = useCallback((cards: Card[]) => {
    return [...cards].sort((a, b) => {
      const aDate = a.next_review ? new Date(a.next_review).getTime() : 0;
      const bDate = b.next_review ? new Date(b.next_review).getTime() : 0;
      return aDate - bDate; // Earlier dates first
    });
  }, []);

  return {
    currentEaseFactor,
    nextReviewDate,
    currentInterval,
    reviewStats,
    averageEaseFactor,
    calculateCardReview,
    getFormattedDueDate,
    isCardDue,
    getDaysUntilReview,
    estimateRetention,
    getDifficultyDistribution,
    getRecommendedStudyCount,
    sortCardsByPriority,
  };
}

export default useSpacedRep;
