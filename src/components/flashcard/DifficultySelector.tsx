import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ReviewDifficulty } from "../../utils/types";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";

/**
 * DifficultySelector Component
 * Four buttons for spaced repetition difficulty selection
 */

interface DifficultySelectorProps {
  onSelect: (difficulty: ReviewDifficulty) => void;
  disabled?: boolean;
  testID?: string;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  onSelect,
  disabled = false,
  testID,
}) => {
  const difficulties: Array<{
    value: ReviewDifficulty;
    label: string;
    color: string;
    description: string;
  }> = [
    {
      value: "again",
      label: "Again",
      color: colors.error.main,
      description: "<1 day",
    },
    {
      value: "hard",
      label: "Hard",
      color: colors.warning.main,
      description: "~1 day",
    },
    {
      value: "medium",
      label: "Good",
      color: colors.primary.main,
      description: "~2 days",
    },
    {
      value: "easy",
      label: "Easy",
      color: colors.success.main,
      description: "~3 days",
    },
  ];

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>How well did you know this?</Text>

      <View style={styles.buttonsRow}>
        {difficulties.map((diff) => (
          <TouchableOpacity
            key={diff.value}
            onPress={() => onSelect(diff.value)}
            disabled={disabled}
            style={[
              styles.button,
              { backgroundColor: diff.color },
              disabled && styles.buttonDisabled,
            ]}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonLabel}>{diff.label}</Text>
            <Text style={styles.buttonDescription}>{diff.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background.paper,
  },

  title: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },

  buttonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  button: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 64,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonLabel: {
    ...typography.button,
    color: colors.text.primary,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },

  buttonDescription: {
    ...typography.caption,
    color: colors.text.primary,
    opacity: 0.9,
  },
});

export default DifficultySelector;
