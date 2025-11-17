import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectToasts, hideToast } from "../../store/slices/uiSlice";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, borderRadius } from "../../theme/spacing";
import { ToastType } from "../../utils/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Toast Component
 * Displays toast notifications with auto-dismiss
 */

interface ToastItemProps {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  id,
  type,
  message,
  duration,
  onDismiss,
}) => {
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    // Slide out animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(id);
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return colors.success.main;
      case "error":
        return colors.error.main;
      case "warning":
        return colors.warning.main;
      case "info":
      default:
        return colors.primary.main;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
      default:
        return "ℹ";
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: getBackgroundColor() },
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={styles.message} numberOfLines={3}>
          {message}
        </Text>
      </View>

      <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Toast Container
 * Manages multiple toasts
 */
export const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector(selectToasts);

  const handleDismiss = (id: string) => {
    dispatch(hideToast(id));
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration || 3000}
          onDismiss={handleDismiss}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: spacing.md,
  },

  toast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: SCREEN_WIDTH - spacing.md * 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  icon: {
    fontSize: 20,
    marginRight: spacing.sm,
    color: colors.text.primary,
  },

  message: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    flex: 1,
  },

  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },

  closeText: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: "600",
  },
});

export default ToastContainer;
