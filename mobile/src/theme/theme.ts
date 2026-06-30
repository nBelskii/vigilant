// Hi-Fi Terminal design system: Black & White, sharp corners, one vivid
// "conversion" accent reserved for Pro/Subscription CTAs.
export const THEME = {
  colors: {
    primary: "#0A0A0A", // Near-black for primary buttons, active states, icons
    secondary: "#F0F0F0", // Light gray tint for icon backgrounds and badges
    background: "#FFFFFF", // Clean white background for screens and cards
    surface: "#F5F5F5", // Light gray for subtle structure
    textPrimary: "#0A0A0A", // Near-black for readable headers and text
    textSecondary: "#5C5C5C", // Neutral gray for timestamps and descriptions
    textOnPrimary: "#FFFFFF", // White text when placed on black backgrounds
    danger: "#FF3B30", // Red for critical crime/fire alerts
    warning: "#FF9500", // Orange for medium alerts
    border: "#1A1A1A", // Strong dark border — terminal/outlined look
    conversion: "#FFB800", // Vivid amber — reserved for Pro/Subscription CTAs only
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadius: { sm: 2, md: 4, lg: 8, round: 999 },
} as const;

export type Theme = typeof THEME;
