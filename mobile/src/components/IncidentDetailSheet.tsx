import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Incident } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { categoryColors, colors, radius, spacing, typography } from "../theme";

interface IncidentDetailSheetProps {
  incident: Incident | null;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  crime: "Crime",
  fire: "Fire / Emergency",
  traffic: "Traffic",
  other: "Other",
};

export function IncidentDetailSheet({ incident, onClose }: IncidentDetailSheetProps) {
  const visible = incident !== null;
  const category = incident ? categorizeIncident(incident.type, incident.source) : "other";
  const accentColor = categoryColors[category];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          {incident && (
            <>
              <View style={styles.headerRow}>
                <View style={[styles.badge, { backgroundColor: accentColor }]}>
                  <Text style={styles.badgeText}>{CATEGORY_LABELS[category]}</Text>
                </View>
              </View>
              <Text style={styles.title}>{incident.type}</Text>
              <Text style={styles.location}>{incident.location}</Text>
              <Text style={styles.timestamp}>
                {new Date(incident.timestamp).toLocaleString("en-CA", {
                  timeZone: "America/Edmonton",
                })}
              </Text>
              {incident.source === "police" && (
                <Text style={styles.source}>Source: Edmonton Police Service</Text>
              )}
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
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
  title: {
    color: colors.text,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    marginBottom: spacing.xs,
  },
  location: {
    color: colors.textMuted,
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xs,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  source: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
});
