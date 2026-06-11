import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Incident } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { categoryColors, colors, radius, spacing, typography } from "../theme";

interface IncidentRowProps {
  incident: Incident;
}

export function IncidentRow({ incident }: IncidentRowProps) {
  const category = categorizeIncident(incident.type);

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: categoryColors[category] }]} />
      <View style={styles.content}>
        <Text style={styles.type}>{incident.type}</Text>
        <Text style={styles.location} numberOfLines={1}>
          {incident.location}
        </Text>
      </View>
      <Text style={styles.time}>
        {new Date(incident.timestamp).toLocaleTimeString("en-CA", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Edmonton",
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  type: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    marginBottom: 2,
  },
  location: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  time: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginLeft: spacing.sm,
  },
});
