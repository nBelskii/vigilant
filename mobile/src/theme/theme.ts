// Premium Light Mode design system: White & Green palette.
export const THEME = {
  colors: {
    primary: "#00C853", // Vibrant Green for accents, primary buttons, and success
    secondary: "#E8F5E9", // Soft light-green tint for icon backgrounds and badges
    background: "#FFFFFF", // Clean White background for screens and cards
    surface: "#F4F6F8", // Light gray for subtle structure
    textPrimary: "#1A1C1E", // Dark charcoal/black for readable headers and text
    textSecondary: "#6C757D", // Cool gray for timestamps and descriptions
    textOnPrimary: "#FFFFFF", // White text when placed on green backgrounds
    danger: "#FF3B30", // Red for critical crime/fire alerts
    warning: "#FF9500", // Orange for medium alerts
    border: "#E2E8F0",
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadius: { sm: 8, md: 16, lg: 24, round: 9999 },
} as const;

export type Theme = typeof THEME;
