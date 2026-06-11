import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "../types";
import { severityColor } from "../utils/severity";
import { colors, radius, spacing, typography } from "../theme";

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const accent = severityColor(alert.severity);

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent}26` }]}>
        <Ionicons name="warning" size={18} color={accent} />
      </View>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {alert.title}
          </Text>
          <View style={[styles.severityBadge, { backgroundColor: accent }]}>
            <Text style={styles.severityText}>{alert.severity}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {alert.location}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {new Date(alert.timestamp).toLocaleString("en-CA", { timeZone: "America/Edmonton" })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  body: {
    flex: 1,
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
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  location: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginLeft: 4,
  },
  timestamp: {
    color: colors.textFaint,
    fontSize: typography.caption.fontSize,
  },
});
