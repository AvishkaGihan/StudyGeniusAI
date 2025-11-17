import React from "react";
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from "react-native";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";
import Button from "./Button";

/**
 * Modal Component
 * Reusable modal with title, content, and actions
 */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onPress: () => void;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
  testID?: string;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
  size = "medium",
  style,
  testID,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.container, styles[`size_${size}`], style]}>
          <View style={styles.content}>
            {/* Header */}
            {title && (
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Body */}
            <View style={styles.body}>{children}</View>

            {/* Actions */}
            {(primaryAction || secondaryAction) && (
              <View style={styles.actions}>
                {secondaryAction && (
                  <Button
                    variant="secondary"
                    onPress={secondaryAction.onPress}
                    style={styles.actionButton}
                  >
                    {secondaryAction.label}
                  </Button>
                )}

                {primaryAction && (
                  <Button
                    variant="primary"
                    onPress={primaryAction.onPress}
                    loading={primaryAction.loading}
                    style={styles.actionButton}
                  >
                    {primaryAction.label}
                  </Button>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay.dark,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },

  container: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.xl,
    maxHeight: "90%",
  },

  size_small: {
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 320,
  },
  size_medium: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 480,
  },
  size_large: {
    width: SCREEN_WIDTH * 0.95,
    maxWidth: 640,
  },

  content: {
    padding: spacing.lg,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  title: {
    ...typography.h2,
    color: colors.text.primary,
    flex: 1,
  },

  closeButton: {
    padding: spacing.sm,
    marginLeft: spacing.md,
  },

  closeText: {
    ...typography.h2,
    color: colors.text.secondary,
  },

  body: {
    marginBottom: spacing.lg,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },

  actionButton: {
    minWidth: 100,
  },
});

export default Modal;
