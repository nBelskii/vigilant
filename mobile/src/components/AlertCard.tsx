import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./MonoText";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "../types";
import { severityColor } from "../utils/severity";
import { formatRelativeTime } from "../utils/time";
import { colors, radius, spacing, typography } from "../theme";

interface AlertCardProps {
  alert: Alert;
  icon?: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  onPress?: () => void;
  // When true, omits the card's own background/shadow/radius so it can be
  // dropped into an already-styled container (e.g. the map preview carousel).
  compact?: boolean;
}

// Splits a location string like "Downtown, Edmonton" or "Anthony Henday Dr"
// into a short neighbourhood-style label for the meta row.
function neighbourhoodLabel(location: string): string {
  const [first] = location.split(",");
  return first.trim();
}

export function AlertCard({ alert, icon, accentColor, onPress, compact }: AlertCardProps) {
  const accent = accentColor ?? severityColor(alert.severity);
  const iconName = icon ?? (alert.category === "weather" ? "thunderstorm" : "car");

  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper style={[styles.card, compact && styles.cardCompact]} onPress={onPress}>
      <View style={[styles.stripe, { backgroundColor: accent }]} />
      <View style={[styles.iconWrap, { backgroundColor: `${accent}1f` }]}>
        <Ionicons name={iconName} size={18} color={accent} />
      </View>
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {alert.title}
          </Text>
          <View style={[styles.severityDot, { backgroundColor: accent }]} />
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {neighbourhoodLabel(alert.location)}
          </Text>
          <Text style={styles.dotSeparator}>·</Text>
          <Text style={styles.timestamp}>{formatRelativeTime(alert.timestamp)}</Text>
        </View>
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardCompact: {
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 0,
    margin: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  stripe: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    marginLeft: spacing.xs,
  },
  body: { flex: 1 },
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
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    marginTop: 4,
  },
  metaRow: { flexDirection: "row", alignItems: "center" },
  location: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginLeft: 4,
    flexShrink: 1,
  },
  dotSeparator: {
    color: colors.textFaint,
    fontSize: typography.caption.fontSize,
    marginHorizontal: spacing.xs,
  },
  timestamp: { color: colors.textFaint, fontSize: typography.caption.fontSize },
});
