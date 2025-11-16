import { Platform } from "react-native";

/**
 * Typography System
 * Font families, sizes, weights, and line heights
 */

// Font Families
export const fontFamily = {
  // iOS uses SF Pro, Android uses Roboto, fallback to system
  primary: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System",
  }),

  // For headings (bold, display text)
  heading: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System",
  }),

  // For monospace text (code, technical content)
  monospace: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
} as const;

// Font Weights
export const fontWeight = {
  light: "300" as const,
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

// Font Sizes (in pixels)
export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
  "5xl": 36,
} as const;

// Line Heights (relative to font size)
export const lineHeight = {
  tight: 1.2, // For headings
  normal: 1.5, // For inputs, buttons
  relaxed: 1.6, // For body text
  loose: 1.8, // For large paragraphs
} as const;

// Letter Spacing (in pixels)
export const letterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
} as const;

// Typography Styles (pre-configured text styles)
export const typography = {
  // Heading 1 - Page titles, main deck names
  h1: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize["4xl"], // 32px
    fontWeight: fontWeight.bold,
    lineHeight: fontSize["4xl"] * lineHeight.tight, // 38.4px
    letterSpacing: letterSpacing.tight,
  },

  // Heading 2 - Section titles
  h2: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize["2xl"], // 24px
    fontWeight: fontWeight.bold,
    lineHeight: fontSize["2xl"] * lineHeight.tight, // 28.8px
    letterSpacing: letterSpacing.tight,
  },

  // Heading 3 - Card titles, subsection headers
  h3: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg, // 18px
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.lg * lineHeight.tight, // 21.6px
    letterSpacing: letterSpacing.normal,
  },

  // Body Large - Primary content, flashcard answers
  bodyLarge: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md, // 16px
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.md * lineHeight.relaxed, // 25.6px
    letterSpacing: letterSpacing.normal,
  },

  // Body Regular - Standard UI text, descriptions
  bodyRegular: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.base, // 14px
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.base * lineHeight.relaxed, // 22.4px
    letterSpacing: letterSpacing.normal,
  },

  // Body Small - Helper text, metadata
  bodySmall: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.sm, // 12px
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.relaxed, // 19.2px
    letterSpacing: letterSpacing.normal,
  },

  // Caption - Timestamps, labels
  caption: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.xs, // 10px
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.xs * lineHeight.normal, // 15px
    letterSpacing: letterSpacing.wide,
  },

  // Button Text
  button: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.base, // 14px
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.base * lineHeight.normal, // 21px
    letterSpacing: letterSpacing.wide,
  },

  // Button Large
  buttonLarge: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md, // 16px
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.md * lineHeight.normal, // 24px
    letterSpacing: letterSpacing.wide,
  },

  // Input Text
  input: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.base, // 14px
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.base * lineHeight.normal, // 21px
    letterSpacing: letterSpacing.normal,
  },

  // Label Text (for form labels)
  label: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.sm, // 12px
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.normal, // 18px
    letterSpacing: letterSpacing.wide,
  },

  // Question Text (flashcard questions)
  question: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl, // 20px
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.xl * lineHeight.relaxed, // 32px
    letterSpacing: letterSpacing.normal,
  },

  // Answer Text (flashcard answers)
  answer: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md, // 16px
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.md * lineHeight.relaxed, // 25.6px
    letterSpacing: letterSpacing.normal,
  },

  // Code/Monospace (for technical content)
  code: {
    fontFamily: fontFamily.monospace,
    fontSize: fontSize.sm, // 12px
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.relaxed, // 19.2px
    letterSpacing: letterSpacing.normal,
  },
} as const;

// Typography utility functions
export const getTextStyle = (variant: keyof typeof typography) => {
  return typography[variant];
};

// Type exports
export type TypographyVariant = keyof typeof typography;
export type FontFamily = typeof fontFamily;
export type FontWeight = typeof fontWeight;
export type FontSize = typeof fontSize;
