export const colors = {
  background: "#f2f8f4",
  surface: "#ffffff",
  surfaceAlt: "#e9f3ec",
  surfaceRaised: "#ffffff",
  border: "#dde8e1",
  text: "#102420",
  textMuted: "#62786d",
  textFaint: "#9bb0a4",
  accent: "#3b82f6",
  danger: "#e5484d",
  warning: "#f5a524",
  success: "#22c55e",
  brandStart: "#34d399",
  brandEnd: "#059669",
} as const;

export const gradients = {
  brand: [colors.brandStart, colors.brandEnd] as const,
  card: ["rgba(52,211,153,0.14)", "rgba(5,150,105,0.04)"] as const,
};

export const categoryColors = {
  crime: colors.danger,
  fire: colors.warning,
  traffic: colors.accent,
  other: colors.textMuted,
} as const;

export type IncidentCategory = keyof typeof categoryColors;
