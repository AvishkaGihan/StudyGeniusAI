import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";
import { spacing, borderRadius, elevation } from "../../theme/spacing";

/**
 * Card Component
 * Base container component with elevation and styling
 */

interface CardProps {
  children: React.ReactNode;
  elevated?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = true,
  style,
  testID,
}) => {
  return (
    <View
      style={[styles.card, elevated && styles.elevated, style]}
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.main,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    padding: spacing.md,
  },

  elevated: {
    ...elevation.md,
  },
});

export default Card;
