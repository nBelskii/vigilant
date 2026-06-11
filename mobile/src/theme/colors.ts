export const colors = {
  background: "#0a0a0f",
  surface: "#131326",
  surfaceAlt: "#1c1c36",
  border: "#2a2a45",
  text: "#ffffff",
  textMuted: "#9a9ab8",
  accent: "#4f7fff",
  danger: "#ff4757",
  warning: "#ffa502",
  success: "#2ed573",
  brandStart: "#ff9500",
  brandEnd: "#ff2d55",
} as const;

export const categoryColors = {
  crime: colors.brandEnd,
  fire: colors.warning,
  traffic: colors.accent,
  other: colors.textMuted,
} as const;

export type IncidentCategory = keyof typeof categoryColors;
