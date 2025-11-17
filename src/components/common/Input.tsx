import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";

/**
 * Input Component
 * Text input with label, error, and helper text
 */

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  editable?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  testID?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helperText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  editable = true,
  style,
  inputStyle,
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = !!error;

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
          !editable && styles.inputContainerDisabled,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, multiline && styles.inputMultiline, inputStyle]}
          testID={testID}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeButton}
          >
            <Text style={styles.eyeText}>
              {isPasswordVisible ? "🙈" : "👁️"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {helperText && !error && <Text style={styles.helper}>{helperText}</Text>}

      {maxLength && (
        <Text style={styles.charCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },

  label: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface.main,
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },

  inputContainerFocused: {
    borderColor: colors.primary.main,
    backgroundColor: colors.surface.hover,
  },

  inputContainerError: {
    borderColor: colors.error.main,
  },

  inputContainerDisabled: {
    opacity: 0.5,
  },

  input: {
    ...typography.input,
    flex: 1,
    color: colors.text.primary,
    paddingVertical: spacing.sm + spacing.xs,
  },

  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: spacing.md,
  },

  eyeButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },

  eyeText: {
    fontSize: 18,
  },

  error: {
    ...typography.bodySmall,
    color: colors.error.main,
    marginTop: spacing.xs,
  },

  helper: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },

  charCount: {
    ...typography.caption,
    color: colors.text.tertiary,
    textAlign: "right",
    marginTop: spacing.xs,
  },
});

export default Input;
