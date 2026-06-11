import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { colors, radius, spacing, typography } from "../theme";

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function RadiusSlider({ value, onChange, min = 1, max = 15 }: RadiusSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Alert radius</Text>
        <Text style={styles.value}>{value.toFixed(1)} km</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={0.5}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.brandEnd}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.brandEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
  },
  value: {
    color: colors.brandEnd,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  slider: {
    width: "100%",
    height: 36,
  },
});
