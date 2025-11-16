import { supabase } from "./supabaseClient";
import { logger } from "../logger";
import { AppError, ErrorCode } from "../../utils/errorHandling";
import { updateCard } from "./cardApi";
import {
  calculateNextReviewData,
  initializeCardReviewData,
} from "../../utils/spacedRepAlgorithm";
import {
  ApiResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  UpdateSessionRequest,
  UpdateSessionResponse,
  RecordReviewRequest,
  RecordReviewResponse,
  GetSessionsRequest,
  GetSessionsResponse,
  GetSessionStatsResponse,
} from "./types";
import { StudySession, Card } from "../../utils/types";

/**
 * Study Session API
 * Handles study sessions and card reviews
 */

/**
 * Create a new study session
 */
export async function createSession(
  request: CreateSessionRequest
): Promise<ApiResponse<CreateSessionResponse>> {
  try {
    logger.info("Creating study session", { deckId: request.deckId });

    // Create session record
    const { data: sessionData, error: sessionError } = await supabase
      .from("study_sessions")
      .insert({
        deck_id: request.deckId,
        cards_reviewed: 0,
        correct_count: 0,
        duration_seconds: 0,
      })
      .select()
      .single();

    if (sessionError) {
      logger.error("Supabase create session error", { error: sessionError });
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to create study session"
      );
    }

    // Fetch due cards for this deck
    const now = new Date().toISOString();
    const { data: cardsData, error: cardsError } = await supabase
      .from("cards")
      .select("*")
      .eq("deck_id", request.deckId)
      .lte("next_review", now)
      .order("next_review", { ascending: true });

    if (cardsError) {
      logger.error("Error fetching cards for session", { error: cardsError });
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch cards for session"
      );
    }

    const session: StudySession = {
      id: sessionData.id,
      user_id: sessionData.user_id,
      deck_id: sessionData.deck_id,
      cards_reviewed: sessionData.cards_reviewed,
      correct_count: sessionData.correct_count,
      duration_seconds: sessionData.duration_seconds,
      created_at: sessionData.created_at,
    };

    const cards: Card[] = cardsData.map((item) => ({
      id: item.id,
      deck_id: item.deck_id,
      question: item.question,
      answer: item.answer,
      difficulty: item.difficulty,
      last_reviewed: item.last_reviewed,
      next_review: item.next_review,
      ease_factor: item.ease_factor,
      review_count: item.review_count,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    logger.info("Study session created successfully", {
      sessionId: session.id,
      cardCount: cards.length,
    });

    return {
      success: true,
      data: {
        session,
        cards,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Create session failed", { error });

    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_ERROR,
        message: "Failed to create study session",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Update study session (called periodically during study)
 */
export async function updateSession(
  sessionId: string,
  request: UpdateSessionRequest
): Promise<ApiResponse<UpdateSessionResponse>> {
  try {
    logger.info("Updating study session", { sessionId });

    const updateData: any = {};

    if (request.cardsReviewed !== undefined)
      updateData.cards_reviewed = request.cardsReviewed;
    if (request.correctCount !== undefined)
      updateData.correct_count = request.correctCount;
    if (request.durationSeconds !== undefined)
      updateData.duration_seconds = request.durationSeconds;

    const { data, error } = await supabase
      .from("study_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      logger.error("Supabase update session error", { error });
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to update study session"
      );
    }

    const session: StudySession = {
      id: data.id,
      user_id: data.user_id,
      deck_id: data.deck_id,
      cards_reviewed: data.cards_reviewed,
      correct_count: data.correct_count,
      duration_seconds: data.duration_seconds,
      created_at: data.created_at,
    };

    return {
      success: true,
      data: { session },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Update session failed", { error, sessionId });

    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_ERROR,
        message: "Failed to update study session",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Record a card review (updates card with spaced repetition data)
 */
export async function recordReview(
  sessionId: string,
  request: RecordReviewRequest
): Promise<ApiResponse<RecordReviewResponse>> {
  try {
    logger.info("Recording card review", {
      sessionId,
      cardId: request.cardId,
      difficulty: request.difficulty,
    });

    // Fetch current card data
    const { data: cardData, error: fetchError } = await supabase
      .from("cards")
      .select("*")
      .eq("id", request.cardId)
      .single();

    if (fetchError) {
      logger.error("Error fetching card for review", { error: fetchError });
      throw new AppError(ErrorCode.RECORD_NOT_FOUND, "Card not found");
    }

    // Calculate next review data using SM-2 algorithm
    const currentReviewData = {
      easeFactor: cardData.ease_factor,
      interval: cardData.review_count === 0 ? 0 : 1, // Simplified
      reviewCount: cardData.review_count,
      lastReviewed: cardData.last_reviewed || new Date().toISOString(),
      nextReview: cardData.next_review || new Date().toISOString(),
    };

    const nextReviewData = calculateNextReviewData(
      currentReviewData,
      request.difficulty
    );

    // Update card with new review data
    const updateResponse = await updateCard(request.cardId, {
      easeFactor: nextReviewData.easeFactor,
      nextReview: nextReviewData.nextReview,
      lastReviewed: new Date().toISOString(),
      reviewCount: nextReviewData.reviewCount,
    });

    if (!updateResponse.success || !updateResponse.data) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to update card review data"
      );
    }

    const updatedCard = updateResponse.data.card;

    // Get next card from the same deck
    const { data: nextCardData } = await supabase
      .from("cards")
      .select("*")
      .eq("deck_id", cardData.deck_id)
      .lte("next_review", new Date().toISOString())
      .neq("id", request.cardId)
      .order("next_review", { ascending: true })
      .limit(1)
      .maybeSingle();

    let nextCard: Card | undefined;
    if (nextCardData) {
      nextCard = {
        id: nextCardData.id,
        deck_id: nextCardData.deck_id,
        question: nextCardData.question,
        answer: nextCardData.answer,
        difficulty: nextCardData.difficulty,
        last_reviewed: nextCardData.last_reviewed,
        next_review: nextCardData.next_review,
        ease_factor: nextCardData.ease_factor,
        review_count: nextCardData.review_count,
        created_at: nextCardData.created_at,
        updated_at: nextCardData.updated_at,
      };
    }

    // Get session progress
    const { data: sessionData } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    const cardsReviewed = sessionData?.cards_reviewed || 0;
    const correctCount = sessionData?.correct_count || 0;

    // Count remaining due cards
    const { count: remainingCount } = await supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .eq("deck_id", cardData.deck_id)
      .lte("next_review", new Date().toISOString());

    logger.info("Card review recorded successfully", {
      cardId: request.cardId,
    });

    return {
      success: true,
      data: {
        card: updatedCard,
        nextCard,
        sessionProgress: {
          cardsReviewed: cardsReviewed + 1,
          cardsRemaining: (remainingCount || 0) - 1,
          correctCount:
            request.difficulty === "easy" || request.difficulty === "medium"
              ? correctCount + 1
              : correctCount,
        },
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Record review failed", { error });

    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_ERROR,
        message: "Failed to record review",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get study sessions (with optional filters)
 */
export async function getSessions(
  request: GetSessionsRequest
): Promise<ApiResponse<GetSessionsResponse>> {
  try {
    logger.info("Fetching study sessions", request);

    let query = supabase
      .from("study_sessions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (request.deckId) {
      query = query.eq("deck_id", request.deckId);
    }

    if (request.limit) {
      query = query.limit(request.limit);
    }

    if (request.offset) {
      query = query.range(
        request.offset,
        request.offset + (request.limit || 20) - 1
      );
    }

    const { data, count, error } = await query;

    if (error) {
      logger.error("Supabase get sessions error", { error });
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch study sessions"
      );
    }

    const sessions: StudySession[] = data.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      deck_id: item.deck_id,
      cards_reviewed: item.cards_reviewed,
      correct_count: item.correct_count,
      duration_seconds: item.duration_seconds,
      created_at: item.created_at,
    }));

    logger.info("Study sessions fetched successfully", {
      count: sessions.length,
    });

    return {
      success: true,
      data: {
        sessions,
        total: count || 0,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Get sessions failed", { error });

    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_ERROR,
        message: "Failed to fetch study sessions",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get study statistics for user
 */
export async function getSessionStats(): Promise<
  ApiResponse<GetSessionStatsResponse>
> {
  try {
    logger.info("Fetching session statistics");

    // Get all sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("study_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (sessionsError) {
      logger.error("Error fetching sessions for stats", {
        error: sessionsError,
      });
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        "Failed to fetch session statistics"
      );
    }

    const totalSessions = sessions.length;
    const totalCardsReviewed = sessions.reduce(
      (sum, s) => sum + s.cards_reviewed,
      0
    );
    const totalStudyTime = sessions.reduce(
      (sum, s) => sum + s.duration_seconds,
      0
    );

    const totalCorrect = sessions.reduce((sum, s) => sum + s.correct_count, 0);
    const averageAccuracy =
      totalCardsReviewed > 0
        ? Math.round((totalCorrect / totalCardsReviewed) * 100)
        : 0;

    // Calculate streak (consecutive days with sessions)
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionDates = sessions
      .map((s) => {
        const date = new Date(s.created_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => b - a);

    for (let i = 0; i < sessionDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (sessionDates[i] === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }

    logger.info("Session statistics calculated", {
      totalSessions,
      totalCardsReviewed,
      currentStreak,
    });

    return {
      success: true,
      data: {
        totalSessions,
        totalCardsReviewed,
        totalStudyTime,
        averageAccuracy,
        currentStreak,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Get session stats failed", { error });

    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_ERROR,
        message: "Failed to fetch session statistics",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
