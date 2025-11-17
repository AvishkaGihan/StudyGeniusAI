import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Card as CardType } from "../../utils/types";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 3) / 2;

/**
 * CardGrid Component
 * Grid display of flashcards with preview
 */

interface CardGridProps {
  cards: CardType[];
  onCardPress: (card: CardType) => void;
  onCardLongPress?: (card: CardType) => void;
  testID?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  onCardPress,
  onCardLongPress,
  testID,
}) => {
  const renderCard = ({ item }: { item: CardType }) => (
    <TouchableOpacity
      onPress={() => onCardPress(item)}
      onLongPress={() => onCardLongPress?.(item)}
      style={styles.cardContainer}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Q</Text>
        </View>

        <Text style={styles.cardQuestion} numberOfLines={4}>
          {item.question}
        </Text>

        <View style={styles.cardFooter}>
          <View
            style={[
              styles.difficultyBadge,
              styles[`difficulty_${item.difficulty}`],
            ]}
          >
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No cards yet</Text>
        <Text style={styles.emptySubtext}>
          Create your first flashcard to get started
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={cards}
      renderItem={renderCard}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  grid: {
    padding: spacing.md,
  },

  row: {
    justifyContent: "space-between",
  },

  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: spacing.md,
  },

  card: {
    backgroundColor: colors.surface.main,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    padding: spacing.md,
    minHeight: 180,
    justifyContent: "space-between",
  },

  cardHeader: {
    marginBottom: spacing.sm,
  },

  cardLabel: {
    ...typography.label,
    color: colors.primary.main,
    fontWeight: "600",
  },

  cardQuestion: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    flex: 1,
  },

  cardFooter: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },

  difficulty_easy: {
    backgroundColor: colors.success.main,
  },

  difficulty_medium: {
    backgroundColor: colors.warning.main,
  },

  difficulty_hard: {
    backgroundColor: colors.error.main,
  },

  difficultyText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },

  emptyText: {
    ...typography.h3,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },

  emptySubtext: {
    ...typography.bodyRegular,
    color: colors.text.tertiary,
    textAlign: "center",
  },
});

export default CardGrid;
