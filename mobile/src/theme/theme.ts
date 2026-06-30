// Hi-Fi dark design system: near-black canvas, soft rounded elevated cards,
// one vivid "conversion" accent reserved for Pro/Subscription CTAs.
export const THEME = {
  colors: {
    primary: "#FFFFFF", // White for primary buttons, active states, icons on dark
    secondary: "#1C1C1E", // Dark elevated tint for icon backgrounds and badges
    background: "#0A0A0A", // Near-black background for screens
    surface: "#1A1A1C", // Slightly lighter dark for cards/structure
    textPrimary: "#F5F5F5", // Near-white for readable headers and text
    textSecondary: "#9A9A9D", // Muted gray for timestamps and descriptions
    textOnPrimary: "#0A0A0A", // Dark text when placed on white backgrounds
    danger: "#FF453A", // Red for critical crime/fire alerts (dark-mode tuned)
    warning: "#FF9F0A", // Orange for medium alerts (dark-mode tuned)
    border: "#2C2C2E", // Subtle border for card separation on dark
    conversion: "#FFB800", // Vivid amber — reserved for Pro/Subscription CTAs only
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadius: { sm: 10, md: 14, lg: 20, round: 999 },
} as const;

export type Theme = typeof THEME;
