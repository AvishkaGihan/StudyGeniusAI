import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  fetchDecks,
  fetchDeck,
  createDeck,
  updateDeck,
  deleteDeck,
  selectAllDecks,
  selectDeckById,
  selectDeckLoading,
  selectDeckError,
  selectDeckCount,
  clearDeckError,
} from "../store/slices/deckSlice";
import { logger } from "../services/logger";

/**
 * useDecks Hook
 * Custom hook for deck CRUD operations
 */
export function useDecks() {
  const dispatch = useAppDispatch();

  const decks = useAppSelector(selectAllDecks);
  const loading = useAppSelector(selectDeckLoading);
  const error = useAppSelector(selectDeckError);
  const deckCount = useAppSelector(selectDeckCount);

  /**
   * Load all decks
   */
  const loadDecks = useCallback(async () => {
    try {
      logger.info("Loading decks");
      await dispatch(fetchDecks()).unwrap();
      logger.info("Decks loaded successfully");
    } catch (err) {
      logger.error("Failed to load decks", { error: err });
      throw err;
    }
  }, [dispatch]);

  /**
   * Load single deck
   */
  const loadDeck = useCallback(
    async (deckId: string) => {
      try {
        logger.info("Loading deck", { deckId });
        await dispatch(fetchDeck(deckId)).unwrap();
        logger.info("Deck loaded successfully", { deckId });
      } catch (err) {
        logger.error("Failed to load deck", { error: err, deckId });
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Create new deck
   */
  const handleCreateDeck = useCallback(
    async (title: string, description?: string) => {
      try {
        logger.logUserAction("create_deck", { title });
        const result = await dispatch(
          createDeck({ title, description })
        ).unwrap();
        logger.logUserAction("deck_created", { deckId: result.id });
        return result;
      } catch (err) {
        logger.error("Failed to create deck", { error: err });
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Update deck
   */
  const handleUpdateDeck = useCallback(
    async (deckId: string, title?: string, description?: string) => {
      try {
        logger.logUserAction("update_deck", { deckId });
        const result = await dispatch(
          updateDeck({ deckId, title, description })
        ).unwrap();
        logger.logUserAction("deck_updated", { deckId });
        return result;
      } catch (err) {
        logger.error("Failed to update deck", { error: err, deckId });
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Delete deck
   */
  const handleDeleteDeck = useCallback(
    async (deckId: string) => {
      try {
        logger.logUserAction("delete_deck", { deckId });
        await dispatch(deleteDeck(deckId)).unwrap();
        logger.logUserAction("deck_deleted", { deckId });
      } catch (err) {
        logger.error("Failed to delete deck", { error: err, deckId });
        throw err;
      }
    },
    [dispatch]
  );

  /**
   * Clear error
   */
  const handleClearError = useCallback(() => {
    dispatch(clearDeckError());
  }, [dispatch]);

  /**
   * Auto-load decks on mount
   */
  useEffect(() => {
    if (decks.length === 0 && !loading && !error) {
      loadDecks();
    }
  }, []);

  return {
    decks,
    loading,
    error,
    deckCount,
    loadDecks,
    loadDeck,
    createDeck: handleCreateDeck,
    updateDeck: handleUpdateDeck,
    deleteDeck: handleDeleteDeck,
    clearError: handleClearError,
    getDeckById: (deckId: string) => useAppSelector(selectDeckById(deckId)),
  };
}

export default useDecks;
