import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography } from "../theme";
import { THEME } from "../theme/theme";

interface SafetyScoreGaugeProps {
  score: number;
  rating: string;
  color: string;
  onPress?: () => void;
}

const SIZE = 88;
const STROKE = 9;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SafetyScoreGauge({ score, rating, color, onPress }: SafetyScoreGaugeProps) {
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.gaugeWrap}>
        <Svg width={SIZE} height={SIZE}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke={THEME.colors.border} strokeWidth={STROKE} fill="none" />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation="-90"
            originX={SIZE / 2}
            originY={SIZE / 2}
          />
        </Svg>
        <View style={styles.gaugeCenter}>
          <Text style={[styles.score, { color }]}>{score}</Text>
          <Text style={styles.outOf}>/ 100</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.infoLabel}>Safety Score</Text>
        <Text style={[styles.infoRating, { color }]}>{rating}</Text>
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>View breakdown</Text>
          <Ionicons name="chevron-forward" size={14} color={THEME.colors.textSecondary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.md,
  },
  gaugeWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeCenter: {
    position: "absolute",
    alignItems: "center",
  },
  score: {
    fontSize: typography.title.fontSize,
    fontWeight: "800",
  },
  outOf: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize - 1,
    marginTop: -2,
  },
  info: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  infoLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoRating: {
    fontSize: typography.heading.fontSize,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
  },
  tapHintText: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginRight: 2,
  },
});
