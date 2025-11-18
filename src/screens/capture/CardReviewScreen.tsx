import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CaptureStackParamList, GeneratedCard } from "../../utils/types";
import { useAppDispatch } from "../../store";
import { createMultipleCards } from "../../store/slices/cardSlice";
import { createDeck } from "../../store/slices/deckSlice";
import { showToast } from "../../store/slices/uiSlice";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { logger } from "../../services/logger";

type CardReviewScreenNavigationProp = NativeStackNavigationProp<
  CaptureStackParamList,
  "CardReview"
>;

type CardReviewScreenRouteProp = RouteProp<CaptureStackParamList, "CardReview">;

/**
 * CardReviewScreen
 * Review and edit generated cards before saving
 */
export const CardReviewScreen: React.FC = () => {
  const navigation = useNavigation<CardReviewScreenNavigationProp>();
  const route = useRoute<CardReviewScreenRouteProp>();
  const dispatch = useAppDispatch();

  const { cards: initialCards, deckId } = route.params;

  const [cards, setCards] = useState<GeneratedCard[]>(initialCards);
  const [editingCard, setEditingCard] = useState<GeneratedCard | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [deckTitle, setDeckTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Open edit modal
   */
  const handleEditCard = (card: GeneratedCard) => {
    setEditingCard(card);
    setShowEditModal(true);
  };

  /**
   * Save edited card
   */
  const handleSaveEdit = () => {
    if (!editingCard) return;

    setCards((prev) =>
      prev.map((c) => (c.tempId === editingCard.tempId ? editingCard : c))
    );

    setShowEditModal(false);
    setEditingCard(null);

    logger.logUserAction("card_edited", { cardId: editingCard.tempId });
  };

  /**
   * Delete card
   */
  const handleDeleteCard = (card: GeneratedCard) => {
    Alert.alert("Delete Card", "Are you sure you want to delete this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setCards((prev) => prev.filter((c) => c.tempId !== card.tempId));
          logger.logUserAction("card_deleted", { cardId: card.tempId });
        },
      },
    ]);
  };

  /**
   * Save cards
   */
  const handleSaveCards = async () => {
    if (cards.length === 0) {
      Alert.alert(
        "No Cards",
        "Please generate at least one card before saving."
      );
      return;
    }

    // If no deck ID, show deck creation modal
    if (!deckId) {
      setShowDeckModal(true);
      return;
    }

    await saveCardsToExistingDeck(deckId);
  };

  /**
   * Create deck and save cards
   */
  const handleCreateDeck = async () => {
    if (!deckTitle.trim()) {
      Alert.alert("Deck Title Required", "Please enter a title for your deck.");
      return;
    }

    setIsSaving(true);

    try {
      logger.logUserAction("creating_deck_with_cards", {
        deckTitle,
        cardCount: cards.length,
      });

      // Create deck
      const deck = await dispatch(
        createDeck({ title: deckTitle.trim() })
      ).unwrap();

      logger.info("Deck created", { deckId: deck.id });

      // Save cards to new deck
      await saveCardsToExistingDeck(deck.id);

      setShowDeckModal(false);
    } catch (error) {
      logger.error("Failed to create deck", { error });
      setIsSaving(false);

      dispatch(
        showToast({
          type: "error",
          message: "Failed to create deck. Please try again.",
        })
      );
    }
  };

  /**
   * Save cards to existing deck
   */
  const saveCardsToExistingDeck = async (targetDeckId: string) => {
    setIsSaving(true);

    try {
      logger.logUserAction("saving_cards_to_deck", {
        deckId: targetDeckId,
        cardCount: cards.length,
      });

      // Convert to card format
      const cardsToSave = cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: "medium" as const,
      }));

      // Save cards
      await dispatch(
        createMultipleCards({
          deckId: targetDeckId,
          cards: cardsToSave,
        })
      ).unwrap();

      logger.logUserAction("cards_saved_successfully", {
        cardCount: cards.length,
      });

      dispatch(
        showToast({
          type: "success",
          message: `${cards.length} cards saved successfully!`,
        })
      );

      // Navigate to deck or library
      navigation.navigate("Camera"); // Reset to camera for next capture
    } catch (error) {
      logger.error("Failed to save cards", { error });
      setIsSaving(false);

      dispatch(
        showToast({
          type: "error",
          message: "Failed to save cards. Please try again.",
        })
      );
    }
  };

  /**
   * Render card item
   */
  const renderCard = ({
    item,
    index,
  }: {
    item: GeneratedCard;
    index: number;
  }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardNumber}>Card {index + 1}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => handleEditCard(item)}>
            <Text style={styles.actionText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteCard(item)}>
            <Text style={[styles.actionText, styles.deleteText]}>
              🗑️ Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.label}>Q:</Text>
        <Text style={styles.question}>{item.question}</Text>

        <Text style={styles.label}>A:</Text>
        <Text style={styles.answer}>{item.answer}</Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Review Cards</Text>
        <Text style={styles.subtitle}>
          {cards.length} card{cards.length !== 1 ? "s" : ""} ready to save
        </Text>
      </View>

      {/* Cards List */}
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.tempId || ""}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No cards to review</Text>
          </View>
        }
      />

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
          testID="back-button"
        >
          Back
        </Button>

        <Button
          onPress={handleSaveCards}
          disabled={cards.length === 0 || isSaving}
          loading={isSaving}
          style={styles.actionButton}
          testID="save-cards-button"
        >
          Save Cards
        </Button>
      </View>

      {/* Edit Card Modal */}
      <Modal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Card"
        primaryAction={{
          label: "Save",
          onPress: handleSaveEdit,
        }}
        secondaryAction={{
          label: "Cancel",
          onPress: () => setShowEditModal(false),
        }}
      >
        {editingCard && (
          <View>
            <Input
              value={editingCard.question}
              onChangeText={(text) =>
                setEditingCard({ ...editingCard, question: text })
              }
              label="Question"
              multiline
            />

            <Input
              value={editingCard.answer}
              onChangeText={(text) =>
                setEditingCard({ ...editingCard, answer: text })
              }
              label="Answer"
              multiline
            />
          </View>
        )}
      </Modal>

      {/* Create Deck Modal */}
      <Modal
        visible={showDeckModal}
        onClose={() => setShowDeckModal(false)}
        title="Create New Deck"
        primaryAction={{
          label: "Create",
          onPress: handleCreateDeck,
          loading: isSaving,
        }}
        secondaryAction={{
          label: "Cancel",
          onPress: () => setShowDeckModal(false),
        }}
      >
        <Input
          value={deckTitle}
          onChangeText={setDeckTitle}
          label="Deck Title"
          placeholder="e.g., Biology Chapter 3"
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },

  header: {
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },

  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },

  card: {
    marginBottom: spacing.md,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  cardNumber: {
    ...typography.label,
    color: colors.primary.main,
    fontWeight: "600",
  },

  cardActions: {
    flexDirection: "row",
    gap: spacing.md,
  },

  actionText: {
    ...typography.bodySmall,
    color: colors.primary.main,
  },

  deleteText: {
    color: colors.error.main,
  },

  cardContent: {},

  label: {
    ...typography.label,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  question: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  answer: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },

  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },

  emptyText: {
    ...typography.bodyLarge,
    color: colors.text.tertiary,
  },

  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.sm,
  },

  actionButton: {
    flex: 1,
  },
});

export default CardReviewScreen;
