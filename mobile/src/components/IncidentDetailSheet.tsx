import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Incident } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { distanceKm } from "../utils/geo";
import { CATEGORY_ICONS } from "./IncidentMarker";
import { categoryColors, colors, radius, spacing, typography } from "../theme";

interface IncidentDetailSheetProps {
  incidents: Incident[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  center?: { lat: number; lng: number } | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  crime: "Crime",
  fire: "Fire / Emergency",
  traffic: "Traffic",
  other: "Other",
};

export function IncidentDetailSheet({ incidents, selectedId, onSelectId, center }: IncidentDetailSheetProps) {
  const index = incidents.findIndex((item) => item.id === selectedId);
  const incident = index >= 0 ? incidents[index] : null;

  if (!incident) return null;

  const category = categorizeIncident(incident.type, incident.source);
  const accentColor = categoryColors[category];
  const hasDistance = center && incident.lat !== null && incident.lng !== null;
  const distance = hasDistance
    ? distanceKm(center!, { lat: incident.lat as number, lng: incident.lng as number })
    : null;

  const canPrev = index > 0;
  const canNext = index < incidents.length - 1;

  return (
    <View style={styles.sheet}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${accentColor}26` }]}>
          <Ionicons name={CATEGORY_ICONS[category]} size={18} color={accentColor} />
        </View>
        <View style={[styles.badge, { backgroundColor: accentColor }]}>
          <Text style={styles.badgeText}>{CATEGORY_LABELS[category]}</Text>
        </View>
        <View style={styles.spacer} />
        <Pressable onPress={() => onSelectId(null)} hitSlop={8} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.title}>{incident.type}</Text>

      <View style={styles.row}>
        <Ionicons name="location-outline" size={14} color={colors.textMuted} style={styles.rowIcon} />
        <Text style={styles.rowText}>{incident.location}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="time-outline" size={14} color={colors.textMuted} style={styles.rowIcon} />
        <Text style={styles.rowText}>
          {new Date(incident.timestamp).toLocaleString("en-CA", { timeZone: "America/Edmonton" })}
        </Text>
      </View>

      {distance !== null && (
        <View style={styles.row}>
          <Ionicons name="navigate-outline" size={14} color={colors.textMuted} style={styles.rowIcon} />
          <Text style={styles.rowText}>{distance.toFixed(1)} km from your watched area</Text>
        </View>
      )}

      {incident.source === "police" && (
        <View style={styles.row}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} style={styles.rowIcon} />
          <Text style={styles.rowText}>Source: Edmonton Police Service</Text>
        </View>
      )}

      {incidents.length > 1 && (
        <View style={styles.navRow}>
          <Pressable
            style={[styles.navButton, !canPrev && styles.navButtonDisabled]}
            onPress={() => canPrev && onSelectId(incidents[index - 1].id)}
            disabled={!canPrev}
          >
            <Ionicons name="chevron-back" size={18} color={canPrev ? colors.text : colors.textFaint} />
            <Text style={[styles.navLabel, !canPrev && styles.navLabelDisabled]}>Previous</Text>
          </Pressable>
          <Text style={styles.navCount}>
            {index + 1} of {incidents.length}
          </Text>
          <Pressable
            style={[styles.navButton, !canNext && styles.navButtonDisabled]}
            onPress={() => canNext && onSelectId(incidents[index + 1].id)}
            disabled={!canNext}
          >
            <Text style={[styles.navLabel, !canNext && styles.navLabelDisabled]}>Next</Text>
            <Ionicons name="chevron-forward" size={18} color={canNext ? colors.text : colors.textFaint} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.xl,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeText: {
    color: colors.text,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
  },
  spacer: {
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  rowIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  rowText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.body.fontSize,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navLabel: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    marginHorizontal: 4,
  },
  navLabelDisabled: {
    color: colors.textFaint,
  },
  navCount: {
    color: colors.textFaint,
    fontSize: typography.caption.fontSize,
  },
});
