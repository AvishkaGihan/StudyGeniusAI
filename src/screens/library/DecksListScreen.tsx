import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LibraryStackParamList, Deck } from "../../utils/types";
import { useDecks } from "../../hooks/useDecks";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";
import { formatRelative } from "../../utils/dateUtils";
import { logger } from "../../services/logger";

type DecksListScreenNavigationProp = NativeStackNavigationProp<
  LibraryStackParamList,
  "DecksList"
>;

/**
 * DecksListScreen
 * Display all user decks with stats
 * Primary screen in Library tab
 */
export const DecksListScreen: React.FC = () => {
  const navigation = useNavigation<DecksListScreenNavigationProp>();
  const {
    decks,
    loading,
    error,
    deckCount,
    loadDecks,
    createDeck: createDeckAction,
    deleteDeck: deleteDeckAction,
    clearError,
  } = useDecks();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const [creatingDeck, setCreatingDeck] = useState(false);

  /**
   * Load decks on mount and when screen comes into focus
   */
  useFocusEffect(
    React.useCallback(() => {
      if (decks.length === 0 && !loading) {
        loadDecks();
      }
    }, [])
  );

  /**
   * Handle pull to refresh
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDecks();
    } catch (err) {
      logger.error("Failed to refresh decks", { error: err });
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Navigate to deck detail
   */
  const handleDeckPress = (deckId: string) => {
    logger.logNavigation("DecksList", "DeckDetail", { deckId });
    navigation.navigate("DeckDetail", { deckId });
  };

  /**
   * Navigate to study mode
   */
  const handleStudyPress = (deckId: string) => {
    logger.logNavigation("DecksList", "StudyMode", { deckId });
    navigation.navigate("StudyMode", { deckId });
  };

  /**
   * Open create deck modal
   */
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setNewDeckTitle("");
    setNewDeckDescription("");
    setTitleError("");
    clearError();
  };

  /**
   * Close create deck modal
   */
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewDeckTitle("");
    setNewDeckDescription("");
    setTitleError("");
  };

  /**
   * Validate deck title
   */
  const validateTitle = (): boolean => {
    if (!newDeckTitle.trim()) {
      setTitleError("Deck title is required");
      return false;
    }

    if (newDeckTitle.trim().length < 3) {
      setTitleError("Deck title must be at least 3 characters");
      return false;
    }

    if (newDeckTitle.trim().length > 100) {
      setTitleError("Deck title must be less than 100 characters");
      return false;
    }

    setTitleError("");
    return true;
  };

  /**
   * Create new deck
   */
  const handleCreateDeck = async () => {
    if (!validateTitle()) {
      return;
    }

    try {
      setCreatingDeck(true);
      logger.logUserAction("create_deck_from_list", {
        title: newDeckTitle.trim(),
      });

      await createDeckAction(
        newDeckTitle.trim(),
        newDeckDescription.trim() || undefined
      );

      logger.logUserAction("deck_created_from_list", {
        title: newDeckTitle.trim(),
      });

      handleCloseCreateModal();
    } catch (err) {
      logger.error("Failed to create deck", { error: err });
      Alert.alert("Error", "Failed to create deck. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setCreatingDeck(false);
    }
  };

  /**
   * Delete deck with confirmation
   */
  const handleDeleteDeck = (deck: Deck) => {
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
              logger.logUserAction("delete_deck", { deckId: deck.id });
              await deleteDeckAction(deck.id);
              logger.logUserAction("deck_deleted", { deckId: deck.id });
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
   * Render individual deck card
   */
  const renderDeck = ({ item }: { item: Deck }) => (
    <TouchableOpacity
      onPress={() => handleDeckPress(item.id)}
      onLongPress={() => handleDeleteDeck(item)}
      style={styles.deckContainer}
      activeOpacity={0.7}
      testID={`deck-${item.id}`}
    >
      <Card style={styles.deckCard}>
        <View style={styles.deckHeader}>
          <Text style={styles.deckTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={styles.deckDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>

        <View style={styles.deckStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.card_count}</Text>
            <Text style={styles.statLabel}>
              {item.card_count === 1 ? "Card" : "Cards"}
            </Text>
          </View>

          {/* Future: Add more stats like cards_due, retention_rate when API supports it */}
        </View>

        <View style={styles.deckFooter}>
          <Text style={styles.deckDate}>
            Created {formatRelative(item.created_at)}
          </Text>

          <Button
            variant="primary"
            size="small"
            onPress={() => handleStudyPress(item.id)}
            style={styles.studyButton}
            testID={`study-button-${item.id}`}
          >
            Study
          </Button>
        </View>
      </Card>
    </TouchableOpacity>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>No decks yet</Text>
        <Text style={styles.emptySubtext}>
          Create your first deck to get started studying
        </Text>
        <Button
          variant="primary"
          onPress={handleOpenCreateModal}
          style={styles.emptyButton}
          testID="empty-create-button"
        >
          Create Deck
        </Button>
      </View>
    );
  };

  /**
   * Render error state
   */
  if (error && !loading && decks.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Failed to load decks</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          variant="primary"
          onPress={loadDecks}
          style={styles.retryButton}
          testID="retry-button"
        >
          Try Again
        </Button>
      </View>
    );
  }

  /**
   * Render loading state (initial load only)
   */
  if (loading && decks.length === 0) {
    return <LoadingSpinner fullScreen message="Loading your decks..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Decks</Text>
          <Text style={styles.subtitle}>
            {deckCount} {deckCount === 1 ? "deck" : "decks"}
          </Text>
        </View>

        <Button
          variant="primary"
          onPress={handleOpenCreateModal}
          style={styles.createButton}
          testID="create-deck-button"
        >
          + New Deck
        </Button>
      </View>

      {/* Decks List */}
      <FlatList
        data={decks}
        renderItem={renderDeck}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          decks.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
        showsVerticalScrollIndicator={false}
        testID="decks-list"
      />

      {/* Create Deck Modal */}
      <Modal
        visible={showCreateModal}
        onClose={handleCloseCreateModal}
        title="Create New Deck"
        size="medium"
        primaryAction={{
          label: "Create",
          onPress: handleCreateDeck,
          loading: creatingDeck,
        }}
        secondaryAction={{
          label: "Cancel",
          onPress: handleCloseCreateModal,
        }}
        testID="create-deck-modal"
      >
        <View style={styles.modalContent}>
          <Input
            label="Deck Title"
            placeholder="e.g., Biology Chapter 5"
            value={newDeckTitle}
            onChangeText={(text) => {
              setNewDeckTitle(text);
              if (titleError) {
                setTitleError("");
              }
            }}
            error={titleError}
            maxLength={100}
            testID="deck-title-input"
          />

          <Input
            label="Description (Optional)"
            placeholder="Brief description of the deck"
            value={newDeckDescription}
            onChangeText={setNewDeckDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
            style={styles.descriptionInput}
            testID="deck-description-input"
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  title: {
    ...typography.h1,
    color: colors.text.primary,
  },

  subtitle: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  createButton: {
    minWidth: 120,
  },

  listContent: {
    padding: spacing.md,
  },

  listContentEmpty: {
    flex: 1,
  },

  deckContainer: {
    marginBottom: spacing.md,
  },

  deckCard: {
    padding: spacing.md,
  },

  deckHeader: {
    marginBottom: spacing.md,
  },

  deckTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  deckDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },

  deckStats: {
    flexDirection: "row",
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },

  statItem: {
    alignItems: "center",
    marginRight: spacing.xl,
  },

  statValue: {
    ...typography.h2,
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },

  statLabel: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    textTransform: "uppercase",
  },

  deckFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  deckDate: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },

  studyButton: {
    minWidth: 80,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },

  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },

  emptySubtext: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },

  emptyButton: {
    minWidth: 200,
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

export default DecksListScreen;
