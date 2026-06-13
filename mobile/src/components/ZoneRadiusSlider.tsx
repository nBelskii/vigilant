import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { spacing, typography } from "../theme";
import { THEME } from "../theme/theme";

export const ZONE_RADIUS_MIN_M = 200;
export const ZONE_RADIUS_MAX_M = 10000;
export const ZONE_RADIUS_STEP_M = 50;

interface ZoneRadiusSliderProps {
  radiusM: number;
  onChange: (radiusM: number) => void;
}

export function clampZoneRadius(meters: number): number {
  const snapped = Math.round(meters / ZONE_RADIUS_STEP_M) * ZONE_RADIUS_STEP_M;
  return Math.min(ZONE_RADIUS_MAX_M, Math.max(ZONE_RADIUS_MIN_M, snapped));
}

export function formatZoneRadius(meters: number): string {
  if (meters >= 1000) {
    const km = meters / 1000;
    return `${km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatZoneArea(radiusM: number): string {
  const areaKm2 = Math.PI * (radiusM / 1000) ** 2;
  if (areaKm2 < 0.1) {
    return `${Math.round(areaKm2 * 1_000_000)} m²`;
  }
  return `${areaKm2 < 10 ? areaKm2.toFixed(1) : areaKm2.toFixed(0)} km²`;
}

export function ZoneRadiusSlider({ radiusM, onChange }: ZoneRadiusSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Tracking radius</Text>
        <Text style={styles.value}>{formatZoneRadius(radiusM)}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={ZONE_RADIUS_MIN_M}
        maximumValue={ZONE_RADIUS_MAX_M}
        step={ZONE_RADIUS_STEP_M}
        value={radiusM}
        onValueChange={(value) => onChange(clampZoneRadius(value))}
        minimumTrackTintColor={THEME.colors.primary}
        maximumTrackTintColor={THEME.colors.border}
        thumbTintColor={THEME.colors.primary}
      />
      <View style={styles.rangeRow}>
        <Text style={styles.rangeLabel}>{formatZoneRadius(ZONE_RADIUS_MIN_M)}</Text>
        <Text style={styles.areaLabel}>Area: {formatZoneArea(radiusM)}</Text>
        <Text style={styles.rangeLabel}>{formatZoneRadius(ZONE_RADIUS_MAX_M)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  label: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
  },
  value: {
    color: THEME.colors.primary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  slider: {
    width: "100%",
    height: 36,
  },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -spacing.xs,
  },
  rangeLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
  },
  areaLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "600",
  },
});
