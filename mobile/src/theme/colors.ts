// Hi-Fi dark design system: near-black canvas, soft elevated dark cards,
// a single vivid "conversion" accent reserved for Pro/Subscription surfaces.
// Incident category colors stay untouched — they carry safety meaning,
// not brand decoration.
export const colors = {
  background: "#0A0A0A",
  surface: "#1A1A1C",
  surfaceAlt: "#222224",
  surfaceRaised: "#1C1C1E",
  border: "#2C2C2E",
  text: "#F5F5F5",
  textMuted: "#9A9A9D",
  textFaint: "#6B6B6E",
  accent: "#3b82f6",
  danger: "#FF453A",
  warning: "#FF9F0A",
  success: "#30D158",
  brandStart: "#FFFFFF",
  brandEnd: "#FFFFFF",
  selectionRing: "#FFFFFF",
  calm: "#64D2FF",
  premium: "#FFB800",
  insightBg: "#1A1A1C",
  insightBorder: "#2C2C2E",
  indigo: "#FFFFFF",
} as const;

export const categoryColors = {
  crime: colors.danger,
  fire: colors.warning,
  traffic: colors.accent,
  other: colors.textMuted,
} as const;

export type IncidentCategory = keyof typeof categoryColors;
