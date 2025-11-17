import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet as ChatStyles,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  testID?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = "Ask a question...",
  disabled = false,
  testID,
}) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim().length === 0) return;

    onSend(message.trim());
    setMessage("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={inputStyles.container} testID={testID}>
        <View style={inputStyles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor={colors.text.tertiary}
            multiline
            maxLength={500}
            editable={!disabled}
            onSubmitEditing={handleSend}
            style={inputStyles.input}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={disabled || message.trim().length === 0}
            style={[
              inputStyles.sendButton,
              (disabled || message.trim().length === 0) &&
                inputStyles.sendButtonDisabled,
            ]}
            activeOpacity={0.7}
          >
            <Text style={inputStyles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const inputStyles = ChatStyles.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.surface.main,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  input: {
    ...typography.bodyRegular,
    flex: 1,
    color: colors.text.primary,
    maxHeight: 100,
    paddingVertical: spacing.xs,
  },

  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.main,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
  },

  sendButtonDisabled: {
    opacity: 0.5,
  },

  sendIcon: {
    fontSize: 18,
    color: colors.primary.contrast,
  },
});
