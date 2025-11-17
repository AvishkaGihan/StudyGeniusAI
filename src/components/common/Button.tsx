import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";

/**
 * Button Component
 * Primary, secondary, tertiary, and destructive variants
 */

interface ButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "medium",
  children,
  style,
  textStyle,
  testID,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "secondary" || variant === "tertiary"
              ? colors.primary.main
              : colors.text.primary
          }
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${variant}`],
            styles[`text_size_${size}`],
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  // Variants
  primary: {
    backgroundColor: colors.primary.main,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.secondary.main,
  },
  tertiary: {
    backgroundColor: "transparent",
  },
  destructive: {
    backgroundColor: colors.error.main,
  },

  // Sizes
  size_small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + spacing.xs,
    minHeight: 36,
  },
  size_medium: {
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  size_large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    fontFamily: typography.button.fontFamily,
    fontWeight: typography.button.fontWeight,
    letterSpacing: typography.button.letterSpacing,
  },
  text_primary: {
    color: colors.primary.contrast,
  },
  text_secondary: {
    color: colors.secondary.main,
  },
  text_tertiary: {
    color: colors.text.secondary,
  },
  text_destructive: {
    color: colors.error.contrast,
  },
  text_size_small: {
    fontSize: typography.bodySmall.fontSize,
  },
  text_size_medium: {
    fontSize: typography.button.fontSize,
  },
  text_size_large: {
    fontSize: typography.buttonLarge.fontSize,
  },
});

export default Button;
