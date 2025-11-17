import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TutorMessage } from "../../utils/types";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";
import { formatTimestamp } from "../../utils/dateUtils";

interface ChatBubbleProps {
  message: TutorMessage;
  testID?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, testID }) => {
  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
      testID={testID}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[styles.text, isUser ? styles.userText : styles.assistantText]}
        >
          {message.content}
        </Text>
        <Text
          style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.assistantTimestamp,
          ]}
        >
          {formatTimestamp(message.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },

  userContainer: {
    alignItems: "flex-end",
  },

  assistantContainer: {
    alignItems: "flex-start",
  },

  bubble: {
    maxWidth: "80%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    borderRadius: borderRadius.lg,
  },

  userBubble: {
    backgroundColor: colors.primary.main,
    borderBottomRightRadius: spacing.xs,
  },

  assistantBubble: {
    backgroundColor: colors.surface.main,
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderBottomLeftRadius: spacing.xs,
  },

  text: {
    ...typography.bodyRegular,
    lineHeight: typography.bodyRegular.lineHeight,
  },

  userText: {
    color: colors.primary.contrast,
  },

  assistantText: {
    color: colors.text.primary,
  },

  timestamp: {
    ...typography.caption,
    marginTop: spacing.xs,
  },

  userTimestamp: {
    color: colors.primary.contrast,
    opacity: 0.8,
    textAlign: "right",
  },

  assistantTimestamp: {
    color: colors.text.tertiary,
  },
});
