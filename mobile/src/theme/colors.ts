// Hi-Fi monochrome design system: Black & White with a single vivid
// "conversion" accent (premium) reserved for Pro/Subscription surfaces.
// Incident category colors stay untouched — they carry safety meaning,
// not brand decoration.
export const colors = {
  background: "#FFFFFF",
  surface: "#F4F4F4",
  surfaceAlt: "#EBEBEB",
  surfaceRaised: "#FFFFFF",
  border: "#111111",
  text: "#0A0A0A",
  textMuted: "#5C5C5C",
  textFaint: "#9A9A9A",
  accent: "#3b82f6",
  danger: "#e5484d",
  warning: "#f5a524",
  success: "#22c55e",
  brandStart: "#0A0A0A",
  brandEnd: "#0A0A0A",
  selectionRing: "#0A0A0A",
  calm: "#0ea5b8",
  premium: "#FFB800",
  insightBg: "#F2F2F2",
  insightBorder: "#D6D6D6",
  indigo: "#0A0A0A",
} as const;

export const categoryColors = {
  crime: colors.danger,
  fire: colors.warning,
  traffic: colors.accent,
  other: colors.textMuted,
} as const;

export type IncidentCategory = keyof typeof categoryColors;
