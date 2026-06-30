import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./AppText";
import { categoryColors, colors, radius, spacing, typography } from "../theme";
import { IncidentCategory } from "../types";

interface MapLegendProps {
  showCrime: boolean;
  onToggleCrime: () => void;
}

const ITEMS: { category: IncidentCategory; label: string }[] = [
  { category: "crime", label: "Crime (EPS)" },
  { category: "fire", label: "Fire / Medical" },
  { category: "traffic", label: "Traffic" },
  { category: "other", label: "Other" },
];

export function MapLegend({ showCrime, onToggleCrime }: MapLegendProps) {
  return (
    <View style={styles.container}>
      {ITEMS.map((item) => {
        const isCrime = item.category === "crime";
        const dimmed = isCrime && !showCrime;

        return (
          <Pressable
            key={item.category}
            style={styles.row}
            onPress={isCrime ? onToggleCrime : undefined}
            disabled={!isCrime}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: categoryColors[item.category], opacity: dimmed ? 0.25 : 1 },
              ]}
            />
            <Text style={[styles.label, dimmed && styles.labelDimmed]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  label: {
    color: "#1A1A1A",
    fontSize: typography.caption.fontSize,
  },
  labelDimmed: {
    color: "#6B6B6E",
  },
});
