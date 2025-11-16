/**
 * Spacing System (8px base unit)
 * Consistent spacing throughout the app
 */

// Base spacing unit (8px)
const BASE_UNIT = 8;

// Spacing scale (multiples of base unit)
export const spacing = {
  xs: BASE_UNIT * 0.5, // 4px - Minimal spacing
  sm: BASE_UNIT, // 8px - Tight spacing
  md: BASE_UNIT * 2, // 16px - Standard spacing
  lg: BASE_UNIT * 3, // 24px - Generous spacing
  xl: BASE_UNIT * 4, // 32px - Large spacing
  "2xl": BASE_UNIT * 6, // 48px - Extra large spacing
  "3xl": BASE_UNIT * 8, // 64px - Maximum spacing
} as const;

// Padding presets for common components
export const padding = {
  // Screen padding (horizontal edges)
  screen: spacing.md, // 16px

  // Card padding
  card: spacing.md, // 16px
  cardSmall: spacing.sm, // 8px
  cardLarge: spacing.lg, // 24px

  // Button padding
  button: {
    vertical: spacing.sm + spacing.xs, // 12px
    horizontal: spacing.md, // 16px
  },
  buttonSmall: {
    vertical: spacing.sm, // 8px
    horizontal: spacing.sm + spacing.xs, // 12px
  },
  buttonLarge: {
    vertical: spacing.md, // 16px
    horizontal: spacing.lg, // 24px
  },

  // Input padding
  input: {
    vertical: spacing.sm + spacing.xs, // 12px
    horizontal: spacing.md, // 16px
  },

  // Modal padding
  modal: spacing.lg, // 24px

  // Section padding (between major sections)
  section: spacing.lg, // 24px
} as const;

// Margin presets
export const margin = {
  // Gap between cards in a list
  cardGap: spacing.sm + spacing.xs, // 12px

  // Gap between sections
  sectionGap: spacing.lg, // 24px

  // Gap between form fields
  fieldGap: spacing.md, // 16px

  // Gap between buttons in a row
  buttonGap: spacing.sm, // 8px

  // Bottom margin for screen content (above tab bar)
  screenBottom: spacing.xl, // 32px
} as const;

// Border radius values
export const borderRadius = {
  none: 0,
  sm: 4, // Small radius
  md: 8, // Standard radius
  lg: 12, // Large radius
  xl: 16, // Extra large radius
  "2xl": 24, // Very large radius
  full: 9999, // Fully rounded (circles)
} as const;

// Border width values
export const borderWidth = {
  none: 0,
  thin: 1, // Standard border
  medium: 2, // Emphasis border
  thick: 3, // Heavy border
} as const;

// Icon sizes
export const iconSize = {
  xs: 12, // Tiny icons
  sm: 16, // Small icons
  md: 24, // Standard icons
  lg: 32, // Large icons
  xl: 48, // Extra large icons
  "2xl": 64, // Very large icons
} as const;

// Touch target sizes (minimum 48px for accessibility)
export const touchTarget = {
  min: 48, // Minimum touch target
  comfortable: 56, // Comfortable touch target
  large: 64, // Large touch target
} as const;

// Container widths (for responsive layouts)
export const containerWidth = {
  sm: 640, // Small container
  md: 768, // Medium container
  lg: 1024, // Large container
  xl: 1280, // Extra large container
} as const;

// Shadow/Elevation values
export const elevation = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// Spacing utility functions
export const multiply = (value: number, multiplier: number): number => {
  return value * multiplier;
};

export const add = (...values: number[]): number => {
  return values.reduce((sum, value) => sum + value, 0);
};

export const subtract = (base: number, ...values: number[]): number => {
  return values.reduce((result, value) => result - value, base);
};

// Type exports
export type Spacing = typeof spacing;
export type Padding = typeof padding;
export type Margin = typeof margin;
export type BorderRadius = typeof borderRadius;
export type Elevation = typeof elevation;
