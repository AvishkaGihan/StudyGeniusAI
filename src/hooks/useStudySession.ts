import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  startStudySession,
  recordCardReview,
  advanceToNextCard,
  incrementCorrectCount,
  endStudySession,
  selectActiveSession,
  selectCurrentCard,
  selectSessionProgress,
  selectIsSessionActive,
  selectStudyLoading,
  selectStudyError,
} from "../store/slices/studySlice";
import { ReviewDifficulty } from "../utils/types";
import { logger } from "../services/logger";

/**
 * useStudySession Hook
 * Custom hook for managing study sessions
 */
export function useStudySession() {
  const dispatch = useAppDispatch();

  const activeSession = useAppSelector(selectActiveSession);
  const currentCard = useAppSelector(selectCurrentCard);
  const progress = useAppSelector(selectSessionProgress);
  const isActive = useAppSelector(selectIsSessionActive);
  const loading = useAppSelector(selectStudyLoading);
  const error = useAppSelector(selectStudyError);

  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  /**
   * Start new study session
   */
  const startSession = useCallback(
    async (deckId: string) => {
      try {
        logger.logUserAction("start_study_session", { deckId });
        await dispatch(startStudySession(deckId)).unwrap();
        setCardStartTime(Date.now());
        setIsAnswerRevealed(false);
        logger.logUserAction("study_session_started");
      } catch (err) {
        logger.error("Failed to start study session", { error: err });
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Reveal answer
   */
  const revealAnswer = useCallback(() => {
    setIsAnswerRevealed(true);
    logger.logUserAction("answer_revealed", {
      cardId: currentCard?.id,
    });
  }, [currentCard]);

  /**
   * Record card review and advance
   */
  const reviewCard = useCallback(
    async (difficulty: ReviewDifficulty) => {
      if (!activeSession || !currentCard) {
        logger.warn("No active session or current card");
        return;
      }

      try {
        const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000); // seconds

        logger.logUserAction("review_card", {
          cardId: currentCard.id,
          difficulty,
          timeSpent,
        });

        // Record review
        await dispatch(
          recordCardReview({
            sessionId: activeSession.deck_id, // Using deck_id as session identifier
            cardId: currentCard.id,
            difficulty,
            timeSpent,
          })
        ).unwrap();

        // Increment correct count for easy/medium
        if (difficulty === "easy" || difficulty === "medium") {
          dispatch(incrementCorrectCount());
        }

        // Advance to next card
        dispatch(advanceToNextCard());

        // Reset for next card
        setCardStartTime(Date.now());
        setIsAnswerRevealed(false);

        logger.logUserAction("card_reviewed", { difficulty });
      } catch (err) {
        logger.error("Failed to review card", { error: err });
        throw err;
      }
    },
    [dispatch, activeSession, currentCard, cardStartTime]
  );

  /**
   * End study session
   */
  const endSession = useCallback(() => {
    logger.logUserAction("end_study_session");
    dispatch(endStudySession());
    setIsAnswerRevealed(false);
  }, [dispatch]);

  /**
   * Get session duration in seconds
   */
  const getSessionDuration = useCallback(() => {
    if (!activeSession) return 0;
    return Math.floor((Date.now() - activeSession.session_start_time) / 1000);
  }, [activeSession]);

  /**
   * Get time spent on current card
   */
  const getCurrentCardTime = useCallback(() => {
    return Math.floor((Date.now() - cardStartTime) / 1000);
  }, [cardStartTime]);

  /**
   * Check if session is complete
   */
  const isSessionComplete = useCallback(() => {
    if (!progress) return false;
    return progress.current > progress.total;
  }, [progress]);

  /**
   * Get accuracy percentage
   */
  const getAccuracy = useCallback(() => {
    if (!progress || progress.cardsReviewed === 0) return 0;
    return Math.round((progress.correctCount / progress.cardsReviewed) * 100);
  }, [progress]);

  /**
   * Reset answer state when card changes
   */
  useEffect(() => {
    if (currentCard) {
      setIsAnswerRevealed(false);
      setCardStartTime(Date.now());
    }
  }, [currentCard?.id]);

  return {
    activeSession,
    currentCard,
    progress,
    isActive,
    loading,
    error,
    isAnswerRevealed,
    startSession,
    revealAnswer,
    reviewCard,
    endSession,
    getSessionDuration,
    getCurrentCardTime,
    isSessionComplete,
    getAccuracy,
  };
}

export default useStudySession;
