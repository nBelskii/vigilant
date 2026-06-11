export const colors = {
  background: "#0a0a0f",
  surface: "#15151f",
  surfaceAlt: "#1e1e2c",
  surfaceRaised: "#23232f",
  border: "#2a2a3a",
  text: "#ffffff",
  textMuted: "#9a9ab0",
  textFaint: "#6b6b80",
  accent: "#4f7fff",
  danger: "#ff4757",
  warning: "#ffa502",
  success: "#2ed573",
  brandStart: "#ff9500",
  brandEnd: "#ff2d55",
} as const;

export const gradients = {
  brand: [colors.brandStart, colors.brandEnd] as const,
  card: ["rgba(255,149,0,0.12)", "rgba(255,45,85,0.04)"] as const,
};

export const categoryColors = {
  crime: colors.brandEnd,
  fire: colors.warning,
  traffic: colors.accent,
  other: colors.textMuted,
} as const;

export type IncidentCategory = keyof typeof categoryColors;
