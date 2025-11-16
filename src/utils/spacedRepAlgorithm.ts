import { appConfig } from "../config/appConfig";
import { calculateNextReview } from "./dateUtils";

/**
 * Spaced Repetition Algorithm (SM-2 Lite)
 * Based on the SuperMemo SM-2 algorithm
 * Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

export type Difficulty = "easy" | "medium" | "hard" | "again";

export interface CardReviewData {
  easeFactor: number;
  interval: number; // Days until next review
  reviewCount: number;
  lastReviewed: string; // ISO date string
  nextReview: string; // ISO date string
}

export interface ReviewResult {
  easeFactor: number;
  interval: number;
  nextReview: string;
  reviewCount: number;
}

/**
 * Calculates new ease factor based on difficulty rating
 * Easy = increase ease factor (card is easy, show less often)
 * Medium = maintain ease factor
 * Hard = decrease ease factor (card is hard, show more often)
 * Again = reset to minimum ease factor
 */
function calculateNewEaseFactor(
  currentEaseFactor: number,
  difficulty: Difficulty
): number {
  const { minEaseFactor, maxEaseFactor, easyBonus } =
    appConfig.spacedRepetition;

  let newEaseFactor = currentEaseFactor;

  switch (difficulty) {
    case "again":
      // Reset to minimum for cards user failed
      newEaseFactor = minEaseFactor;
      break;

    case "hard":
      // Decrease ease factor (will show more frequently)
      newEaseFactor = currentEaseFactor - 0.15;
      break;

    case "medium":
      // Maintain current ease factor
      newEaseFactor = currentEaseFactor;
      break;

    case "easy":
      // Increase ease factor (will show less frequently)
      newEaseFactor = currentEaseFactor + 0.1;
      break;
  }

  // Clamp ease factor between min and max
  return Math.max(minEaseFactor, Math.min(maxEaseFactor, newEaseFactor));
}

/**
 * Calculates new interval (days until next review) based on difficulty
 */
function calculateNewInterval(
  currentInterval: number,
  easeFactor: number,
  difficulty: Difficulty,
  reviewCount: number
): number {
  const { intervals } = appConfig.spacedRepetition;

  // First review (reviewCount = 0)
  if (reviewCount === 0) {
    switch (difficulty) {
      case "again":
        return intervals.again; // 1 day
      case "hard":
        return intervals.hard; // 1.2 days
      case "medium":
        return intervals.medium; // 2 days
      case "easy":
        return intervals.easy; // 3 days
      default:
        return intervals.medium;
    }
  }

  // Second review (reviewCount = 1)
  if (reviewCount === 1) {
    switch (difficulty) {
      case "again":
        return intervals.again; // Back to 1 day
      case "hard":
        return Math.max(1, currentInterval * 1.2); // Slight increase
      case "medium":
        return currentInterval * 2; // Double the interval
      case "easy":
        return currentInterval * 2.5; // Even longer interval
      default:
        return currentInterval * 2;
    }
  }

  // Subsequent reviews (reviewCount >= 2)
  switch (difficulty) {
    case "again":
      // Reset to first interval
      return intervals.again;

    case "hard":
      // Shorter interval than last time
      return Math.max(1, currentInterval * 1.2);

    case "medium":
      // Standard SM-2 calculation
      return Math.round(currentInterval * easeFactor);

    case "easy":
      // Longer interval with easy bonus
      return Math.round(
        currentInterval * easeFactor * appConfig.spacedRepetition.easyBonus
      );

    default:
      return Math.round(currentInterval * easeFactor);
  }
}

/**
 * Main function: Calculate next review parameters based on user's difficulty rating
 */
export function calculateNextReviewData(
  currentData: CardReviewData,
  difficulty: Difficulty
): ReviewResult {
  // Calculate new ease factor
  const newEaseFactor = calculateNewEaseFactor(
    currentData.easeFactor,
    difficulty
  );

  // Calculate new interval (days)
  const newInterval = calculateNewInterval(
    currentData.interval,
    newEaseFactor,
    difficulty,
    currentData.reviewCount
  );

  // Calculate next review date (in UTC ISO format)
  const nextReview = calculateNextReview(newInterval);

  // Increment review count
  const reviewCount = currentData.reviewCount + 1;

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReview,
    reviewCount,
  };
}

/**
 * Initializes card review data for a brand new card
 */
export function initializeCardReviewData(): CardReviewData {
  const { defaultEaseFactor } = appConfig.spacedRepetition;

  return {
    easeFactor: defaultEaseFactor,
    interval: 0, // Not yet reviewed
    reviewCount: 0,
    lastReviewed: new Date().toISOString(),
    nextReview: new Date().toISOString(), // Due immediately
  };
}

/**
 * Estimates retention rate based on ease factor (for display purposes)
 * Higher ease factor = higher retention
 */
export function estimateRetentionRate(easeFactor: number): number {
  const { minEaseFactor, maxEaseFactor } = appConfig.spacedRepetition;

  // Normalize ease factor to 0-1 range
  const normalized =
    (easeFactor - minEaseFactor) / (maxEaseFactor - minEaseFactor);

  // Convert to percentage (50% to 100% retention)
  return Math.round(50 + normalized * 50);
}

/**
 * Calculates average ease factor across multiple cards
 */
export function calculateAverageEaseFactor(cards: CardReviewData[]): number {
  if (cards.length === 0) return appConfig.spacedRepetition.defaultEaseFactor;

  const sum = cards.reduce((acc, card) => acc + card.easeFactor, 0);
  return sum / cards.length;
}

/**
 * Determines if a card should be shown in study session based on next review date
 */
export function shouldShowCard(nextReview: string): boolean {
  const nextReviewDate = new Date(nextReview);
  const now = new Date();

  return nextReviewDate <= now;
}

/**
 * Sorts cards by priority (most overdue first)
 */
export function sortCardsByPriority(cards: CardReviewData[]): CardReviewData[] {
  return [...cards].sort((a, b) => {
    const aDate = new Date(a.nextReview);
    const bDate = new Date(b.nextReview);

    // Most overdue cards first
    return aDate.getTime() - bDate.getTime();
  });
}

/**
 * Calculates study statistics for a deck
 */
export interface DeckStatistics {
  totalCards: number;
  dueCards: number;
  newCards: number;
  averageEaseFactor: number;
  estimatedRetention: number;
}

export function calculateDeckStatistics(
  cards: CardReviewData[]
): DeckStatistics {
  const totalCards = cards.length;
  const now = new Date();

  const dueCards = cards.filter(
    (card) => new Date(card.nextReview) <= now
  ).length;

  const newCards = cards.filter((card) => card.reviewCount === 0).length;

  const averageEaseFactor = calculateAverageEaseFactor(cards);

  const estimatedRetention = estimateRetentionRate(averageEaseFactor);

  return {
    totalCards,
    dueCards,
    newCards,
    averageEaseFactor,
    estimatedRetention,
  };
}
