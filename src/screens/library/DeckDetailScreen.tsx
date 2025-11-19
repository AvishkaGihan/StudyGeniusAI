import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SectionList,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LibraryStackParamList, Deck, Card } from "../../utils/types";
import { useDecks } from "../../hooks/useDecks";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchCards } from "../../store/slices/cardSlice";
import { selectCardsByDeckId } from "../../store/slices/cardSlice";
import { selectDeckById } from "../../store/slices/deckSlice";
import Button from "../../components/common/Button";
import CardComponent from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { CardGrid } from "../../components/flashcard/CardGrid";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";
import { formatRelative, formatDate } from "../../utils/dateUtils";
import { logger } from "../../services/logger";

type DeckDetailScreenNavigationProp = NativeStackNavigationProp<
  LibraryStackParamList,
  "DeckDetail"
>;

type DeckDetailScreenRouteProp = RouteProp<LibraryStackParamList, "DeckDetail">;

/**
 * DeckDetailScreen
 * Display deck details, cards, and statistics
 * Secondary screen in Library tab
 */
export const DeckDetailScreen: React.FC = () => {
  const navigation = useNavigation<DeckDetailScreenNavigationProp>();
  const route = useRoute<DeckDetailScreenRouteProp>();
  const dispatch = useAppDispatch();

  const { deckId } = route.params;
  const { loadDeck, updateDeck: updateDeckAction, deleteDeck } = useDecks();

  const deck = useAppSelector(selectDeckById(deckId));
  const deckCards = useAppSelector(selectCardsByDeckId(deckId));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Load deck and cards on mount
   */
  useEffect(() => {
    loadDeckData();
  }, [deckId]);

  /**
   * Update edit form when deck changes
   */
  useEffect(() => {
    if (deck) {
      setEditTitle(deck.title);
      setEditDescription(deck.description || "");
    }
  }, [deck]);

  /**
   * Load deck data
   */
  const loadDeckData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load deck details
      await loadDeck(deckId);

      // Load cards for deck
      await dispatch(fetchCards({ deckId, dueOnly: false })).unwrap();

      // Initialize edit form with current deck data
      if (deck) {
        setEditTitle(deck.title);
        setEditDescription(deck.description || "");
      }
    } catch (err) {
      logger.error("Failed to load deck detail", { error: err, deckId });
      setError("Failed to load deck details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle pull to refresh
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDeckData();
    } catch (err) {
      logger.error("Failed to refresh deck", { error: err });
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Open edit modal
   */
  const handleOpenEditModal = () => {
    if (!deck) return;
    setEditTitle(deck.title);
    setEditDescription(deck.description || "");
    setTitleError("");
    setShowEditModal(true);
  };

  /**
   * Close edit modal
   */
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditTitle("");
    setEditDescription("");
    setTitleError("");
  };

  /**
   * Validate title
   */
  const validateTitle = (): boolean => {
    if (!editTitle.trim()) {
      setTitleError("Deck title is required");
      return false;
    }

    if (editTitle.trim().length < 3) {
      setTitleError("Deck title must be at least 3 characters");
      return false;
    }

    if (editTitle.trim().length > 100) {
      setTitleError("Deck title must be less than 100 characters");
      return false;
    }

    setTitleError("");
    return true;
  };

  /**
   * Update deck
   */
  const handleUpdateDeck = async () => {
    if (!validateTitle() || !deck) {
      return;
    }

    try {
      setIsUpdating(true);
      logger.logUserAction("update_deck", { deckId });

      await updateDeckAction(
        deckId,
        editTitle.trim(),
        editDescription.trim() || undefined
      );

      logger.logUserAction("deck_updated", { deckId });
      handleCloseEditModal();
    } catch (err) {
      logger.error("Failed to update deck", { error: err });
      Alert.alert("Error", "Failed to update deck. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete deck with confirmation
   */
  const handleDeleteDeck = () => {
    if (!deck) return;

    Alert.alert(
      "Delete Deck",
      `Are you sure you want to delete "${deck.title}"? This will also delete all ${deck.card_count} card${deck.card_count !== 1 ? "s" : ""}.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              logger.logUserAction("delete_deck", { deckId });
              await deleteDeck(deckId);
              logger.logUserAction("deck_deleted", { deckId });
              navigation.goBack();
            } catch (err) {
              logger.error("Failed to delete deck", { error: err });
              Alert.alert("Error", "Failed to delete deck. Please try again.", [
                { text: "OK" },
              ]);
            }
          },
        },
      ]
    );
  };

  /**
   * Navigate to study mode
   */
  const handleStudyDeck = () => {
    logger.logNavigation("DeckDetail", "StudyMode", { deckId });
    navigation.navigate("StudyMode", { deckId });
  };

  /**
   * Handle card press
   */
  const handleCardPress = (card: Card) => {
    logger.logUserAction("view_card", { cardId: card.id, deckId });
    // Future: Navigate to card detail or edit screen
  };

  /**
   * Handle card long press
   */
  const handleCardLongPress = (card: Card) => {
    logger.logUserAction("long_press_card", { cardId: card.id });
    // Future: Show card options (edit, delete, duplicate)
  };

  /**
   * Render error state
   */
  if (error && !loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Failed to load deck</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          variant="primary"
          onPress={() => loadDeckData()}
          style={styles.retryButton}
          testID="retry-button"
        >
          Try Again
        </Button>
      </View>
    );
  }

  /**
   * Render loading state
   */
  if (loading || !deck) {
    return <LoadingSpinner fullScreen message="Loading deck details..." />;
  }

  const dueCards = deckCards.filter((card) => {
    if (!card.next_review) return true;
    return new Date(card.next_review) <= new Date();
  }).length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{deck.title}</Text>
            {deck.description && (
              <Text style={styles.description}>{deck.description}</Text>
            )}
          </View>

          <Button
            variant="secondary"
            size="small"
            onPress={handleOpenEditModal}
            testID="edit-deck-button"
          >
            Edit
          </Button>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <CardComponent style={styles.statsCard}>
            <View style={styles.statsGrid}>
              {/* Total Cards */}
              <View style={styles.statCell}>
                <Text style={styles.statNumber}>{deck.card_count}</Text>
                <Text style={styles.statLabel}>Total Cards</Text>
              </View>

              {/* Cards Due */}
              <View style={styles.statCell}>
                <Text style={styles.statNumber}>{dueCards}</Text>
                <Text style={styles.statLabel}>Due Today</Text>
              </View>

              {/* Created */}
              <View style={styles.statCell}>
                <Text style={styles.statNumber}>
                  {formatDate(deck.created_at, "MMM dd")}
                </Text>
                <Text style={styles.statLabel}>Created</Text>
              </View>
            </View>
          </CardComponent>
        </View>

        {/* Study Mode Section */}
        <View style={styles.actionSection}>
          <Button
            variant="primary"
            size="large"
            onPress={handleStudyDeck}
            disabled={deck.card_count === 0}
            testID="study-button"
            style={styles.studyButton}
          >
            {deck.card_count === 0
              ? "No Cards to Study"
              : `Study ${dueCards || deck.card_count} Cards`}
          </Button>
        </View>

        {/* Cards Section */}
        <View style={styles.cardsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cards</Text>
            <Text style={styles.cardCount}>
              {deckCards.length} {deckCards.length === 1 ? "card" : "cards"}
            </Text>
          </View>

          {deckCards.length === 0 ? (
            <View style={styles.emptyCardsContainer}>
              <Text style={styles.emptyIcon}>🗂️</Text>
              <Text style={styles.emptyText}>No cards yet</Text>
              <Text style={styles.emptySubtext}>
                Add cards by creating them or uploading from a photo
              </Text>
            </View>
          ) : (
            <CardGrid
              cards={deckCards}
              onCardPress={handleCardPress}
              onCardLongPress={handleCardLongPress}
              testID="deck-cards-grid"
            />
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Button
          variant="tertiary"
          onPress={handleDeleteDeck}
          style={styles.deleteButton}
          testID="delete-button"
        >
          Delete Deck
        </Button>
      </View>

      {/* Edit Deck Modal */}
      <Modal
        visible={showEditModal}
        onClose={handleCloseEditModal}
        title="Edit Deck"
        size="medium"
        primaryAction={{
          label: "Save",
          onPress: handleUpdateDeck,
          loading: isUpdating,
        }}
        secondaryAction={{
          label: "Cancel",
          onPress: handleCloseEditModal,
        }}
        testID="edit-deck-modal"
      >
        <View style={styles.modalContent}>
          <Input
            label="Deck Title"
            placeholder="e.g., Biology Chapter 5"
            value={editTitle}
            onChangeText={(text) => {
              setEditTitle(text);
              if (titleError) {
                setTitleError("");
              }
            }}
            error={titleError}
            maxLength={100}
            testID="edit-title-input"
          />

          <Input
            label="Description (Optional)"
            placeholder="Brief description of the deck"
            value={editDescription}
            onChangeText={setEditDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
            style={styles.descriptionInput}
            testID="edit-description-input"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },

  scrollView: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  headerContent: {
    flex: 1,
    marginRight: spacing.md,
  },

  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  description: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },

  statsSection: {
    padding: spacing.md,
  },

  statsCard: {
    padding: spacing.md,
  },

  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  statCell: {
    alignItems: "center",
    flex: 1,
  },

  statNumber: {
    ...typography.h2,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },

  statLabel: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    textAlign: "center",
    textTransform: "uppercase",
  },

  actionSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },

  studyButton: {
    width: "100%",
  },

  cardsSection: {
    paddingHorizontal: spacing.md,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },

  cardCount: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },

  emptyCardsContainer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },

  emptyText: {
    ...typography.h3,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },

  emptySubtext: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    textAlign: "center",
  },

  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },

  deleteButton: {
    width: "100%",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.background.default,
  },

  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },

  errorTitle: {
    ...typography.h2,
    color: colors.error.main,
    marginBottom: spacing.sm,
    textAlign: "center",
  },

  errorText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },

  retryButton: {
    minWidth: 200,
  },

  modalContent: {
    gap: spacing.md,
  },

  descriptionInput: {
    minHeight: 80,
  },
});

export default DeckDetailScreen;
