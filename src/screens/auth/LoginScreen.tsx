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
import { validateEmail } from "../../utils/validation";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { logger } from "../../services/logger";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Login"
>;

/**
 * LoginScreen
 * User login with email and password
 */
export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Clear previous errors
    setEmailError("");
    setPasswordError("");

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || "");
      isValid = false;
    }

    // Validate password not empty
    if (!password || password.trim().length === 0) {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  };

  /**
   * Handle login
   */
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      logger.logUserAction("login_button_pressed", { email });
      await login(email, password);
      // Navigation handled by auth state change
    } catch (err) {
      logger.error("Login failed", { error: err });
      // Error displayed via useAuth hook
    }
  };

  /**
   * Navigate to sign up
   */
  const handleNavigateToSignUp = () => {
    clearError();
    navigation.navigate("SignUp");
  };

  /**
   * Navigate to password reset
   */
  const handleNavigateToPasswordReset = () => {
    clearError();
    navigation.navigate("PasswordReset");
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Logging you in..." />;
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to continue studying</Text>
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
              testID="login-email-input"
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
              testID="login-password-input"
            />

            {/* Forgot password link */}
            <View style={styles.forgotPasswordContainer}>
              <Button
                onPress={handleNavigateToPasswordReset}
                variant="tertiary"
                size="small"
                testID="forgot-password-button"
              >
                Forgot Password?
              </Button>
            </View>

            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Login button */}
            <Button
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              testID="login-button"
            >
              Log In
            </Button>

            {/* Sign up link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <Button
                onPress={handleNavigateToSignUp}
                variant="tertiary"
                size="small"
                testID="navigate-to-signup-button"
              >
                Sign Up
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

  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },

  loginButton: {
    marginTop: spacing.md,
  },

  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },

  signUpText: {
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

export default LoginScreen;
