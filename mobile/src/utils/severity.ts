import { colors } from "../theme";

export function severityColor(severity: string): string {
  const normalized = severity.toLowerCase();

  if (
    normalized.includes("high") ||
    normalized.includes("severe") ||
    normalized.includes("critical") ||
    normalized.includes("warning")
  ) {
    return colors.danger;
  }

  if (normalized.includes("medium") || normalized.includes("moderate") || normalized.includes("watch")) {
    return colors.warning;
  }

  if (normalized.includes("low") || normalized.includes("minor")) {
    return colors.success;
  }

  return colors.accent;
}
