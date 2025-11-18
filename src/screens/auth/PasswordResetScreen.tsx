import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../utils/types";
import { useAppDispatch } from "../../store";
import { requestPasswordReset } from "../../store/slices/authSlice";
import { showToast } from "../../store/slices/uiSlice";
import { validateEmail } from "../../utils/validation";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { logger } from "../../services/logger";

type PasswordResetScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "PasswordReset"
>;

/**
 * PasswordResetScreen
 * Request password reset email
 */
export const PasswordResetScreen: React.FC = () => {
  const navigation = useNavigation<PasswordResetScreenNavigationProp>();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  /**
   * Validate email
   */
  const validateForm = (): boolean => {
    setEmailError("");

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || "");
      return false;
    }

    return true;
  };

  /**
   * Handle password reset request
   */
  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      logger.logUserAction("password_reset_requested", { email });

      const result = await dispatch(requestPasswordReset(email)).unwrap();

      logger.logUserAction("password_reset_email_sent", { email });

      setEmailSent(true);

      dispatch(
        showToast({
          type: "success",
          message: result,
          duration: 5000,
        })
      );
    } catch (err) {
      logger.error("Password reset failed", { error: err });

      dispatch(
        showToast({
          type: "error",
          message: typeof err === "string" ? err : "Failed to send reset email",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate back to login
   */
  const handleBackToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              {emailSent
                ? "Check your email for reset instructions"
                : "Enter your email to receive reset instructions"}
            </Text>
          </View>

          {!emailSent ? (
            /* Form */
            <View style={styles.form}>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                label="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={emailError}
                testID="reset-email-input"
              />

              {/* Reset button */}
              <Button
                onPress={handleResetPassword}
                loading={loading}
                disabled={loading}
                style={styles.resetButton}
                testID="reset-button"
              >
                Send Reset Email
              </Button>

              {/* Back to login link */}
              <View style={styles.backContainer}>
                <Button
                  onPress={handleBackToLogin}
                  variant="tertiary"
                  testID="back-to-login-button"
                >
                  Back to Log In
                </Button>
              </View>
            </View>
          ) : (
            /* Success message */
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>✉️</Text>
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successMessage}>
                We've sent password reset instructions to{" "}
                <Text style={styles.emailText}>{email}</Text>
              </Text>
              <Text style={styles.successNote}>
                Please check your inbox and follow the instructions to reset
                your password.
              </Text>

              <Button
                onPress={handleBackToLogin}
                style={styles.backButton}
                testID="success-back-button"
              >
                Back to Log In
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },

  header: {
    marginBottom: spacing.xl,
    alignItems: "center",
  },

  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: spacing.md,
  },

  form: {
    width: "100%",
  },

  resetButton: {
    marginTop: spacing.md,
  },

  backContainer: {
    alignItems: "center",
    marginTop: spacing.lg,
  },

  successContainer: {
    alignItems: "center",
  },

  successEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },

  successTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  successMessage: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },

  emailText: {
    color: colors.primary.main,
    fontWeight: "600",
  },

  successNote: {
    ...typography.bodyRegular,
    color: colors.text.tertiary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },

  backButton: {
    minWidth: 200,
  },
});

export default PasswordResetScreen;
