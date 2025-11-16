import { supabase } from "./supabaseClient";
import { logger } from "../logger";
import { AppError, ErrorCode } from "../../utils/errorHandling";
import {
  ApiResponse,
  CreateDeckRequest,
  CreateDeckResponse,
  UpdateDeckRequest,
  UpdateDeckResponse,
  GetDecksResponse,
  GetDeckResponse,
  DeleteDeckResponse,
} from "./types";
import { Deck } from "../../utils/types";

/**
 * Deck API
 * Handles CRUD operations for decks
 */

/**
 * Create a new deck
 */
export async function createDeck(
  request: CreateDeckRequest
): Promise<ApiResponse<CreateDeckResponse>> {
  try {
    logger.info("Creating new deck", { title: request.title });

    const { data, error } = await supabase
      .from("decks")
      .insert({
        title: request.title,
        description: request.description || null,
        card_count: 0,
      })
      .select()
      .single();

    if (error) {
      logger.error("Supabase create deck error", { error });
      throw new AppError(ErrorCode.DATABASE_ERROR, "Failed to create deck");
    }

    const deck: Deck = {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      description: data.description,
      card_count: data.card_count,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    logger.info("Deck created successfully", { deckId: deck.id });

    return {
      success: true,
      data: { deck },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Create deck failed", { error });

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
        message: "Failed to create deck",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get all decks for current user
 */
export async function getDecks(): Promise<ApiResponse<GetDecksResponse>> {
  try {
    logger.info("Fetching all decks");

    const { data, error } = await supabase
      .from("decks")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      logger.error("Supabase get decks error", { error });
      throw new AppError(ErrorCode.DATABASE_ERROR, "Failed to fetch decks");
    }

    const decks: Deck[] = data.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      description: item.description,
      card_count: item.card_count,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    logger.info("Decks fetched successfully", { count: decks.length });

    return {
      success: true,
      data: { decks },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Get decks failed", { error });

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
        message: "Failed to fetch decks",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get single deck by ID
 */
export async function getDeck(
  deckId: string
): Promise<ApiResponse<GetDeckResponse>> {
  try {
    logger.info("Fetching deck", { deckId });

    // Fetch deck
    const { data: deckData, error: deckError } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .single();

    if (deckError) {
      logger.error("Supabase get deck error", { error: deckError });

      if (deckError.code === "PGRST116") {
        throw new AppError(ErrorCode.RECORD_NOT_FOUND, "Deck not found");
      }

      throw new AppError(ErrorCode.DATABASE_ERROR, "Failed to fetch deck");
    }

    // Count due cards
    const { count: dueCardsCount, error: countError } = await supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .eq("deck_id", deckId)
      .lte("next_review", new Date().toISOString());

    if (countError) {
      logger.warn("Failed to count due cards", { error: countError });
    }

    const deck: Deck = {
      id: deckData.id,
      user_id: deckData.user_id,
      title: deckData.title,
      description: deckData.description,
      card_count: deckData.card_count,
      created_at: deckData.created_at,
      updated_at: deckData.updated_at,
    };

    logger.info("Deck fetched successfully", { deckId: deck.id });

    return {
      success: true,
      data: {
        deck,
        cardCount: deckData.card_count,
        dueCards: dueCardsCount || 0,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Get deck failed", { error, deckId });

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
        message: "Failed to fetch deck",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Update deck
 */
export async function updateDeck(
  deckId: string,
  request: UpdateDeckRequest
): Promise<ApiResponse<UpdateDeckResponse>> {
  try {
    logger.info("Updating deck", { deckId, ...request });

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (request.title !== undefined) {
      updateData.title = request.title;
    }

    if (request.description !== undefined) {
      updateData.description = request.description;
    }

    const { data, error } = await supabase
      .from("decks")
      .update(updateData)
      .eq("id", deckId)
      .select()
      .single();

    if (error) {
      logger.error("Supabase update deck error", { error });
      throw new AppError(ErrorCode.DATABASE_ERROR, "Failed to update deck");
    }

    const deck: Deck = {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      description: data.description,
      card_count: data.card_count,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    logger.info("Deck updated successfully", { deckId: deck.id });

    return {
      success: true,
      data: { deck },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Update deck failed", { error, deckId });

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
        message: "Failed to update deck",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Delete deck
 */
export async function deleteDeck(
  deckId: string
): Promise<ApiResponse<DeleteDeckResponse>> {
  try {
    logger.info("Deleting deck", { deckId });

    const { error } = await supabase.from("decks").delete().eq("id", deckId);

    if (error) {
      logger.error("Supabase delete deck error", { error });
      throw new AppError(ErrorCode.DATABASE_ERROR, "Failed to delete deck");
    }

    logger.info("Deck deleted successfully", { deckId });

    return {
      success: true,
      data: {
        message: "Deck deleted successfully",
        deckId,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Delete deck failed", { error, deckId });

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
        message: "Failed to delete deck",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Update deck card count (called after adding/removing cards)
 */
export async function updateDeckCardCount(deckId: string): Promise<void> {
  try {
    logger.info("Updating deck card count", { deckId });

    // Count cards in deck
    const { count, error: countError } = await supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .eq("deck_id", deckId);

    if (countError) {
      logger.error("Error counting cards", { error: countError });
      return;
    }

    // Update deck card count
    const { error: updateError } = await supabase
      .from("decks")
      .update({
        card_count: count || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", deckId);

    if (updateError) {
      logger.error("Error updating deck card count", { error: updateError });
      return;
    }

    logger.info("Deck card count updated", { deckId, count });
  } catch (error) {
    logger.error("Update deck card count failed", { error, deckId });
  }
}
