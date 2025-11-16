import { MD3DarkTheme } from "react-native-paper";
import { colors } from "./colors";
import { typography, fontFamily, fontWeight } from "./typography";
import { spacing, borderRadius } from "./spacing";

/**
 * Dark Theme Configuration for React Native Paper
 * Extends Material Design 3 dark theme with custom colors
 */

export const darkTheme = {
  ...MD3DarkTheme,

  // Dark mode flag
  dark: true,

  // Color scheme
  colors: {
    ...MD3DarkTheme.colors,

    // Primary colors (buttons, links, highlights)
    primary: colors.primary.main,
    primaryContainer: colors.primary.dark,
    onPrimary: colors.primary.contrast,
    onPrimaryContainer: colors.primary.contrast,

    // Secondary colors (supporting elements)
    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.dark,
    onSecondary: colors.secondary.contrast,
    onSecondaryContainer: colors.secondary.contrast,

    // Tertiary colors (additional accents)
    tertiary: colors.success.main,
    tertiaryContainer: colors.success.dark,
    onTertiary: colors.success.contrast,
    onTertiaryContainer: colors.success.contrast,

    // Error colors
    error: colors.error.main,
    errorContainer: colors.error.dark,
    onError: colors.error.contrast,
    onErrorContainer: colors.error.contrast,

    // Background colors
    background: colors.background.default,
    onBackground: colors.text.primary,

    // Surface colors (cards, sheets, dialogs)
    surface: colors.background.paper,
    surfaceVariant: colors.background.elevated,
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
    surfaceDisabled: colors.text.disabled,

    // Outline and borders
    outline: colors.divider,
    outlineVariant: colors.surface.border,

    // Backdrop (for modals)
    backdrop: colors.overlay.medium,

    // Inverse colors (for snackbars, tooltips)
    inverseSurface: colors.text.primary,
    inverseOnSurface: colors.text.inverse,
    inversePrimary: colors.primary.dark,

    // Elevation overlays (for elevated surfaces)
    elevation: {
      level0: colors.background.default,
      level1: colors.background.paper,
      level2: colors.background.elevated,
      level3: colors.surface.main,
      level4: colors.surface.hover,
      level5: colors.surface.active,
    },

    // Custom colors (not part of Material Design)
    success: colors.success.main,
    warning: colors.warning.main,
    info: colors.primary.main,

    // Difficulty colors (for study mode)
    difficultyEasy: colors.difficulty.easy,
    difficultyMedium: colors.difficulty.medium,
    difficultyHard: colors.difficulty.hard,

    // Status colors
    online: colors.status.online,
    offline: colors.status.offline,
    syncing: colors.status.syncing,
  },

  // Typography
  fonts: {
    ...MD3DarkTheme.fonts,

    // Configure font families
    displayLarge: {
      fontFamily: fontFamily.heading,
      fontSize: 57,
      fontWeight: fontWeight.regular,
      lineHeight: 64,
      letterSpacing: 0,
    },
    displayMedium: {
      fontFamily: fontFamily.heading,
      fontSize: 45,
      fontWeight: fontWeight.regular,
      lineHeight: 52,
      letterSpacing: 0,
    },
    displaySmall: {
      fontFamily: fontFamily.heading,
      fontSize: 36,
      fontWeight: fontWeight.regular,
      lineHeight: 44,
      letterSpacing: 0,
    },

    headlineLarge: {
      fontFamily: fontFamily.heading,
      fontSize: 32,
      fontWeight: fontWeight.bold,
      lineHeight: 40,
      letterSpacing: 0,
    },
    headlineMedium: {
      fontFamily: fontFamily.heading,
      fontSize: 28,
      fontWeight: fontWeight.bold,
      lineHeight: 36,
      letterSpacing: 0,
    },
    headlineSmall: {
      fontFamily: fontFamily.heading,
      fontSize: 24,
      fontWeight: fontWeight.bold,
      lineHeight: 32,
      letterSpacing: 0,
    },

    titleLarge: {
      fontFamily: fontFamily.heading,
      fontSize: 22,
      fontWeight: fontWeight.semibold,
      lineHeight: 28,
      letterSpacing: 0,
    },
    titleMedium: {
      fontFamily: fontFamily.primary,
      fontSize: 16,
      fontWeight: fontWeight.medium,
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    titleSmall: {
      fontFamily: fontFamily.primary,
      fontSize: 14,
      fontWeight: fontWeight.medium,
      lineHeight: 20,
      letterSpacing: 0.1,
    },

    bodyLarge: {
      fontFamily: fontFamily.primary,
      fontSize: 16,
      fontWeight: fontWeight.regular,
      lineHeight: 24,
      letterSpacing: 0.5,
    },
    bodyMedium: {
      fontFamily: fontFamily.primary,
      fontSize: 14,
      fontWeight: fontWeight.regular,
      lineHeight: 20,
      letterSpacing: 0.25,
    },
    bodySmall: {
      fontFamily: fontFamily.primary,
      fontSize: 12,
      fontWeight: fontWeight.regular,
      lineHeight: 16,
      letterSpacing: 0.4,
    },

    labelLarge: {
      fontFamily: fontFamily.primary,
      fontSize: 14,
      fontWeight: fontWeight.medium,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    labelMedium: {
      fontFamily: fontFamily.primary,
      fontSize: 12,
      fontWeight: fontWeight.medium,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontFamily: fontFamily.primary,
      fontSize: 11,
      fontWeight: fontWeight.medium,
      lineHeight: 16,
      letterSpacing: 0.5,
    },
  },

  // Roundness (border radius)
  roundness: borderRadius.md, // 8px default

  // Animation timings
  animation: {
    scale: 1.0,
  },

  // Custom theme extensions (not part of Material Design)
  custom: {
    // Spacing system
    spacing,

    // Border radius
    borderRadius,

    // Typography variants
    typography,

    // Glassmorphism effect
    glass: colors.glass,

    // Card styles
    card: {
      backgroundColor: colors.surface.main,
      borderColor: colors.surface.border,
      borderWidth: 1,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },

    // Input styles
    input: {
      backgroundColor: colors.surface.main,
      borderColor: colors.surface.border,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      padding: spacing.md,
    },

    // Button styles
    button: {
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm + spacing.xs,
      paddingHorizontal: spacing.md,
    },

    // Flashcard styles
    flashcard: {
      backgroundColor: colors.surface.main,
      borderColor: colors.surface.border,
      borderWidth: 1,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      minHeight: 200,
    },

    // Modal styles
    modal: {
      backgroundColor: colors.background.elevated,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
    },
  },
} as const;

// Type export
export type DarkTheme = typeof darkTheme;

// Export as default theme
export default darkTheme;
