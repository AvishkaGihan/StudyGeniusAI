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
import { useAuth } from "../../hooks/useAuth";
import { validateEmail, validatePassword } from "../../utils/validation";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { logger } from "../../services/logger";

type SignUpScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "SignUp"
>;

/**
 * SignUpScreen
 * User registration with email and password
 */
export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { signUp, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Clear previous errors
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || "");
      isValid = false;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error || "");
      isValid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    return isValid;
  };

  /**
   * Handle sign up
   */
  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      logger.logUserAction("signup_button_pressed", { email });
      await signUp(email, password);
      // Navigation handled by auth state change
    } catch (err) {
      logger.error("Signup failed", { error: err });
      // Error displayed via useAuth hook
    }
  };

  /**
   * Navigate to login
   */
  const handleNavigateToLogin = () => {
    clearError();
    navigation.navigate("Login");
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Creating your account..." />;
  }

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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join StudyGenius and start learning smarter
            </Text>
          </View>

          {/* Form */}
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
              testID="signup-email-input"
            />

            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              label="Password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              error={passwordError}
              helperText="Min 8 characters, 1 uppercase, 1 lowercase, 1 number"
              testID="signup-password-input"
            />

            <Input
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              label="Confirm Password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              error={confirmPasswordError}
              testID="signup-confirm-password-input"
            />

            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Sign up button */}
            <Button
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
              style={styles.signUpButton}
              testID="signup-button"
            >
              Sign Up
            </Button>

            {/* Login link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Button
                onPress={handleNavigateToLogin}
                variant="tertiary"
                size="small"
                testID="navigate-to-login-button"
              >
                Log In
              </Button>
            </View>
          </View>
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
  },

  form: {
    width: "100%",
  },

  signUpButton: {
    marginTop: spacing.md,
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },

  loginText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },

  errorContainer: {
    backgroundColor: colors.error.main,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },

  errorText: {
    ...typography.bodyRegular,
    color: colors.error.contrast,
    textAlign: "center",
  },
});

export default SignUpScreen;
