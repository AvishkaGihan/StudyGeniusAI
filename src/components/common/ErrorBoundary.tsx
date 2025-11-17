import React, { Component, ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing } from "../../theme/spacing";
import { logger, logException } from "../../services/logger";
import Button from "./Button";

/**
 * ErrorBoundary Component
 * Catches JavaScript errors in child components
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error
    logException(error, "ErrorBoundary");
    logger.error("Error caught by boundary", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>😞</Text>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>
            We're sorry for the inconvenience. Please try again.
          </Text>

          {__DEV__ && this.state.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorTitle}>Error Details (Dev Only):</Text>
              <Text style={styles.errorText}>{this.state.error.message}</Text>
            </View>
          )}

          <Button onPress={this.handleReset} style={styles.button}>
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.background.default,
  },

  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },

  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.md,
  },

  message: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },

  errorDetails: {
    backgroundColor: colors.surface.main,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
    width: "100%",
  },

  errorTitle: {
    ...typography.bodyRegular,
    color: colors.error.main,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },

  errorText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontFamily: "monospace",
  },

  button: {
    minWidth: 200,
  },
});

export default ErrorBoundary;
