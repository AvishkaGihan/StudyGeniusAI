import React from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";

/**
 * LoadingSpinner Component
 * Displays loading indicator with optional message
 */

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  color = colors.primary.main,
  message,
  fullScreen = false,
  style,
  testID,
}) => {
  const containerStyle = fullScreen ? styles.fullScreen : styles.container;

  return (
    <View style={[containerStyle, style]} testID={testID}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },

  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.default,
  },

  message: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: "center",
  },
});

export default LoadingSpinner;
