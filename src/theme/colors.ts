/**
 * Color Palette - Cool Focus Theme
 * Dark mode optimized for OLED displays
 */

export const colors = {
  // Primary Colors
  primary: {
    main: "#0ea5e9", // Sky Blue - Primary actions, highlights
    light: "#38bdf8", // Lighter sky blue - Hover states
    dark: "#0284c7", // Darker sky blue - Pressed states
    contrast: "#ffffff", // White text on primary
  },

  // Secondary Colors
  secondary: {
    main: "#06b6d4", // Teal - Secondary actions, accents
    light: "#22d3ee", // Lighter teal - Hover states
    dark: "#0891b2", // Darker teal - Pressed states
    contrast: "#ffffff", // White text on secondary
  },

  // Success (Correct answers, positive feedback)
  success: {
    main: "#14b8a6", // Mint Green
    light: "#2dd4bf", // Lighter mint
    dark: "#0d9488", // Darker mint
    contrast: "#ffffff",
  },

  // Warning (Due cards, important alerts)
  warning: {
    main: "#f59e0b", // Amber
    light: "#fbbf24", // Lighter amber
    dark: "#d97706", // Darker amber
    contrast: "#000000", // Black text on warning
  },

  // Error (Destructive actions, error states)
  error: {
    main: "#ef4444", // Red
    light: "#f87171", // Lighter red
    dark: "#dc2626", // Darker red
    contrast: "#ffffff",
  },

  // Background Colors
  background: {
    default: "#0f172a", // Deep navy - Main background
    paper: "#1e293b", // Dark slate - Card/surface background
    elevated: "#334155", // Lighter slate - Modal/elevated surfaces
    gradient: {
      start: "#0f172a", // Navy
      end: "#1e293b", // Slate
    },
  },

  // Surface Colors (for cards, modals, etc.)
  surface: {
    main: "rgba(15, 165, 233, 0.08)", // Subtle blue tint
    hover: "rgba(15, 165, 233, 0.12)", // Slightly more visible on hover
    active: "rgba(15, 165, 233, 0.16)", // Even more visible when active
    border: "rgba(15, 165, 233, 0.2)", // Border color
  },

  // Text Colors
  text: {
    primary: "#ffffff", // Pure white - Main text
    secondary: "rgba(255, 255, 255, 0.7)", // 70% opacity - Secondary text
    tertiary: "rgba(255, 255, 255, 0.5)", // 50% opacity - Tertiary text
    disabled: "rgba(255, 255, 255, 0.3)", // 30% opacity - Disabled text
    inverse: "#0f172a", // Dark text on light backgrounds
  },

  // Dividers and Borders
  divider: "rgba(255, 255, 255, 0.1)", // 10% opacity

  // Glassmorphism Effects
  glass: {
    background: "rgba(30, 41, 59, 0.7)", // Semi-transparent slate
    border: "rgba(255, 255, 255, 0.1)",
    blur: 12, // Blur radius in px
  },

  // Difficulty Colors (for study mode)
  difficulty: {
    easy: "#14b8a6", // Mint green
    medium: "#f59e0b", // Amber
    hard: "#ef4444", // Red
    again: "#dc2626", // Darker red
  },

  // Status Colors
  status: {
    online: "#10b981", // Green
    offline: "#6b7280", // Gray
    syncing: "#3b82f6", // Blue
  },

  // Chart/Data Visualization Colors
  chart: {
    primary: "#0ea5e9", // Sky blue
    secondary: "#06b6d4", // Teal
    tertiary: "#8b5cf6", // Purple
    quaternary: "#ec4899", // Pink
    gradient: {
      start: "#0ea5e9",
      end: "#06b6d4",
    },
  },

  // Overlay Colors
  overlay: {
    light: "rgba(0, 0, 0, 0.3)", // Light overlay
    medium: "rgba(0, 0, 0, 0.5)", // Medium overlay
    dark: "rgba(0, 0, 0, 0.7)", // Dark overlay
  },

  // Shadow Colors
  shadow: {
    light: "rgba(0, 0, 0, 0.1)",
    medium: "rgba(0, 0, 0, 0.3)",
    dark: "rgba(0, 0, 0, 0.5)",
  },
} as const;

// Color utility functions
export const withOpacity = (color: string, opacity: number): string => {
  // If color is already rgba, replace opacity
  if (color.startsWith("rgba")) {
    return color.replace(/[\d.]+\)$/g, `${opacity})`);
  }

  // If color is rgb, convert to rgba
  if (color.startsWith("rgb")) {
    return color.replace("rgb", "rgba").replace(")", `, ${opacity})`);
  }

  // If hex color, convert to rgba (simplified, works for 6-digit hex)
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return color;
};

// Type exports
export type ColorScheme = typeof colors;
export type PrimaryColor = typeof colors.primary;
export type BackgroundColor = typeof colors.background;
