import { supabase } from "./supabaseClient";
import { logger } from "../logger";
import { AppError, ErrorCode } from "../../utils/errorHandling";
import { updateDeckCardCount } from "./deckApi";
import {
  ApiResponse,
  CreateCardRequest,
  CreateCardResponse,
  CreateMultipleCardsRequest,
  CreateMultipleCardsResponse,
  UpdateCardRequest,
  UpdateCardResponse,
  GetCardsRequest,
  GetCardsResponse,
  GetCardResponse,
  DeleteCardResponse,
  GetDueCardsRequest,
  GetDueCardsResponse,
} from "./types";
import { Card } from "../../utils/types";
import { appConfig } from "../../config/appConfig";

/**
 * Card API
 * Handles CRUD operations for flashcards
 */

/**
 * Create a single card
 */
export async function createCard(
  request: CreateCardRequest
): Promise<ApiResponse<CreateCardResponse>> {
  try {
    logger.info("Creating card", { deckId: request.deckId });

    const { data, error } = await supabase
      .from("cards")
      .insert({
        deck_id: request.deckId,
        question: request.question,
        answer: request.answer,
        difficulty: request.difficulty || "medium",
        ease_factor: appConfig.spacedRepetition.defaultEaseFactor,
        review_count: 0,
        next_review: new Date().toISOString(), // Due immediately
      })
      .select()
      .single();

    if (error) {
      logger.error("Supabase create card error", { error });
      throw new AppError(ErrorCode.DATABASE_ERROR, "Failed to create card");
    }

    const card: Card = {
      id: data.id,
      deck_id: data.deck_id,
      question: data.question,
      answer: data.answer,
      difficulty: data.difficulty,
      last_reviewed: data.last_reviewed,
      next_review: data.next_review,
      ease_factor: data.ease_factor,
      review_count: data.review_count,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    // Update deck card count
    await updateDeckCardCount(request.deckId);

    logger.info("Card created successfully", { cardId: card.id });

    return {
      success: true,
      data: { card },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Create card failed", { error });

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
        message: "Failed to create card",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Create multiple cards at once (batch insert)
 */
export async function createMultipleCards(
  request: CreateMultipleCardsRequest
): Promise<ApiResponse<CreateMultipleCardsResponse>> {
  try {
    logger.info("Creating multiple cards", {
      deckId: request.deckId,
      count: request.cards.length,
    });

    const cardsToInsert = request.cards.map((card) => ({
      deck_id: request.deckId,
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty || "medium",
      ease_factor: appConfig.spacedRepetition.defaultEaseFactor,
      review_count: 0,
      next_review: new Date().toISOString(), // Due immediately
    }));

    const { data, error } = await supabase
      .from("cards")
      .insert(cardsToInsert)
      .select();

    if (error) {
      logger.error("Supabase create multiple cards error", { error });
      throw new AppError(ErrorCode.DATABASE_ERROR, "Failed to create cards");
    }

    const cards: Card[] = data.map((item) => ({
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

    // Update deck card count
    await updateDeckCardCount(request.deckId);

    logger.info("Cards created successfully", {
      count: cards.length,
      deckId: request.deckId,
    });

    return {
      success: true,
      data: {
        cards,
        successCount: cards.length,
        failedCount: 0,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Create multiple cards failed", { error });

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
        message: "Failed to create cards",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get cards for a deck
 */
export async function getCards(
  request: GetCardsRequest
): Promise<ApiResponse<GetCardsResponse>> {
  try {
    logger.info("Fetching cards", { deckId: request.deckId });

    let query = supabase
      .from("cards")
      .select("*", { count: "exact" })
      .eq("deck_id", request.deckId)
      .order("created_at", { ascending: false });

    // Filter for due cards only
    if (request.dueOnly) {
      query = query.lte("next_review", new Date().toISOString());
    }

    // Pagination
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
      logger.error("Supabase get cards error", { error });
      throw new AppError(ErrorCode.DATABASE_ERROR, "Failed to fetch cards");
    }

    const cards: Card[] = data.map((item) => ({
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

    logger.info("Cards fetched successfully", { count: cards.length });

    return {
      success: true,
      data: {
        cards,
        total: count || 0,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Get cards failed", { error });

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
        message: "Failed to fetch cards",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get single card by ID
 */
export async function getCard(
  cardId: string
): Promise<ApiResponse<GetCardResponse>> {
  try {
    logger.info("Fetching card", { cardId });

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("id", cardId)
      .single();

    if (error) {
      logger.error("Supabase get card error", { error });

      if (error.code === "PGRST116") {
        throw new AppError(ErrorCode.RECORD_NOT_FOUND, "Card not found");
      }

      throw new AppError(ErrorCode.DATABASE_ERROR, "Failed to fetch card");
    }

    const card: Card = {
      id: data.id,
      deck_id: data.deck_id,
      question: data.question,
      answer: data.answer,
      difficulty: data.difficulty,
      last_reviewed: data.last_reviewed,
      next_review: data.next_review,
      ease_factor: data.ease_factor,
      review_count: data.review_count,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return {
      success: true,
      data: { card },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Get card failed", { error, cardId });

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
        message: "Failed to fetch card",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Update card
 */
export async function updateCard(
  cardId: string,
  request: UpdateCardRequest
): Promise<ApiResponse<UpdateCardResponse>> {
  try {
    logger.info("Updating card", { cardId });

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (request.question !== undefined) updateData.question = request.question;
    if (request.answer !== undefined) updateData.answer = request.answer;
    if (request.difficulty !== undefined)
      updateData.difficulty = request.difficulty;
    if (request.easeFactor !== undefined)
      updateData.ease_factor = request.easeFactor;
    if (request.nextReview !== undefined)
      updateData.next_review = request.nextReview;
    if (request.lastReviewed !== undefined)
      updateData.last_reviewed = request.lastReviewed;
    if (request.reviewCount !== undefined)
      updateData.review_count = request.reviewCount;

    const { data, error } = await supabase
      .from("cards")
      .update(updateData)
      .eq("id", cardId)
      .select()
      .single();

    if (error) {
      logger.error("Supabase update card error", { error });
      throw new AppError(ErrorCode.DATABASE_ERROR, "Failed to update card");
    }

    const card: Card = {
      id: data.id,
      deck_id: data.deck_id,
      question: data.question,
      answer: data.answer,
      difficulty: data.difficulty,
      last_reviewed: data.last_reviewed,
      next_review: data.next_review,
      ease_factor: data.ease_factor,
      review_count: data.review_count,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    logger.info("Card updated successfully", { cardId });

    return {
      success: true,
      data: { card },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Update card failed", { error, cardId });

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
        message: "Failed to update card",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Delete card
 */
export async function deleteCard(
  cardId: string
): Promise<ApiResponse<DeleteCardResponse>> {
  try {
    logger.info("Deleting card", { cardId });

    // Get deck_id before deleting
    const { data: cardData } = await supabase
      .from("cards")
      .select("deck_id")
      .eq("id", cardId)
      .single();

    const { error } = await supabase.from("cards").delete().eq("id", cardId);

    if (error) {
      logger.error("Supabase delete card error", { error });
      throw new AppError(ErrorCode.DATABASE_ERROR, "Failed to delete card");
    }

    // Update deck card count
    if (cardData?.deck_id) {
      await updateDeckCardCount(cardData.deck_id);
    }

    logger.info("Card deleted successfully", { cardId });

    return {
      success: true,
      data: {
        message: "Card deleted successfully",
        cardId,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Delete card failed", { error, cardId });

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
        message: "Failed to delete card",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get due cards for a deck
 */
export async function getDueCards(
  request: GetDueCardsRequest
): Promise<ApiResponse<GetDueCardsResponse>> {
  try {
    logger.info("Fetching due cards", { deckId: request.deckId });

    const now = new Date().toISOString();

    let query = supabase
      .from("cards")
      .select("*", { count: "exact" })
      .eq("deck_id", request.deckId)
      .lte("next_review", now)
      .order("next_review", { ascending: true });

    if (request.limit) {
      query = query.limit(request.limit);
    }

    const { data, count, error } = await query;

    if (error) {
      logger.error("Supabase get due cards error", { error });
      throw new AppError(ErrorCode.DATABASE_ERROR, "Failed to fetch due cards");
    }

    const cards: Card[] = data.map((item) => ({
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

    logger.info("Due cards fetched successfully", { count: cards.length });

    return {
      success: true,
      data: {
        cards,
        dueCount: count || 0,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Get due cards failed", { error });

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
        message: "Failed to fetch due cards",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
