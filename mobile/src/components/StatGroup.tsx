import React, { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "./AppText";
import { radius, spacing, typography } from "../theme";
import { THEME } from "../theme/theme";

interface StatItem {
  label: string;
  value: string;
  color?: string;
}

interface StatGroupProps {
  items: StatItem[];
}

// Single elevated card holding several stat cells side-by-side with thin
// separators — the pattern from the Profile hero stats row, reused wherever
// a screen used to show a row of separate StatCard boxes.
export function StatGroup({ items }: StatGroupProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {items.map((item, i) => (
          <Fragment key={item.label}>
            <View style={styles.cell}>
              <Text style={[styles.value, item.color ? { color: item.color } : null]}>{item.value}</Text>
              <Text style={styles.label}>{item.label}</Text>
            </View>
            {i < items.length - 1 && <View style={styles.sep} />}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.sm,
  },
  row: {
    flexDirection: "row",
    backgroundColor: THEME.colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  cell: {
    flex: 1,
    alignItems: "center",
  },
  sep: {
    width: 1,
    backgroundColor: THEME.colors.border,
  },
  value: {
    color: THEME.colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: "700",
    lineHeight: 26,
  },
  label: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
