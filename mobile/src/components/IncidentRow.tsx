import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Incident } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { categoryColors, colors, radius, spacing, typography } from "../theme";

interface IncidentRowProps {
  incident: Incident;
  onPress?: () => void;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  crime: "shield-outline",
  fire: "flame-outline",
  traffic: "car-outline",
  other: "ellipse-outline",
};

export function IncidentRow({ incident, onPress }: IncidentRowProps) {
  const category = categorizeIncident(incident.type, incident.source);
  const accent = categoryColors[category];

  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent}26` }]}>
        <Ionicons name={CATEGORY_ICONS[category]} size={16} color={accent} />
      </View>
      <View style={styles.content}>
        <Text style={styles.type} numberOfLines={1}>
          {incident.type}
        </Text>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
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
    color: colors.textFaint,
    fontSize: typography.caption.fontSize,
    marginLeft: spacing.sm,
  },
});
