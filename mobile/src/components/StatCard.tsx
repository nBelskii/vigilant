import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "./AppText";
import { radius, spacing, typography } from "../theme";
import { THEME } from "../theme/theme";

interface StatCardProps {
  label: string;
  value: string;
  valueColor?: string;
}

export function StatCard({ label, value, valueColor }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
  },
  value: {
    color: THEME.colors.textPrimary,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginBottom: spacing.xs,
  },
  label: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    textAlign: "center",
  },
});
