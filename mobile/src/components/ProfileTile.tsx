import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, typography } from "../theme";
import { THEME } from "../theme/theme";

interface ProfileTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: string;
  onPress?: () => void;
}

// Rounded icon tile used in the Profile screen's quick-link grid — two per
// row, icon-on-top / label-below, with an optional small count badge.
export function ProfileTile({ icon, label, badge, onPress }: ProfileTileProps) {
  return (
    <Pressable style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={THEME.colors.textPrimary} />
        </View>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: "48%",
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 100,
    justifyContent: "space-between",
  },
  tilePressed: {
    backgroundColor: THEME.colors.secondary,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: THEME.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: radius.full,
    backgroundColor: THEME.colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  label: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    marginTop: spacing.md,
  },
});
