import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Alert } from "../types";
import { severityColor } from "../utils/severity";
import { colors, radius, spacing, typography } from "../theme";

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const borderColor = severityColor(alert.severity);

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {alert.title}
        </Text>
        <View style={[styles.severityBadge, { backgroundColor: borderColor }]}>
          <Text style={styles.severityText}>{alert.severity}</Text>
        </View>
      </View>
      <Text style={styles.location}>{alert.location}</Text>
      <Text style={styles.timestamp}>
        {new Date(alert.timestamp).toLocaleString("en-CA", { timeZone: "America/Edmonton" })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    flex: 1,
    marginRight: spacing.sm,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  severityText: {
    color: colors.text,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
  },
  location: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.xs,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
});
