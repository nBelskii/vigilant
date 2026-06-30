import React, { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius, spacing, tabBarBottomMargin, tabBarHeight, typography } from "../theme";
import { THEME } from "../theme/theme";

export interface SafetyScoreBreakdownItem {
  label: string;
  score: number;
  detail: string;
}

interface SafetyScoreSheetProps {
  visible: boolean;
  onClose: () => void;
  cityLabel: string;
  score: number;
  rating: string;
  color: string;
  breakdown: SafetyScoreBreakdownItem[];
}

function scoreBarColor(score: number): string {
  if (score >= 75) return THEME.colors.primary;
  if (score >= 55) return THEME.colors.warning;
  return THEME.colors.danger;
}

export function SafetyScoreSheet({ visible, onClose, cityLabel, score, rating, color, breakdown }: SafetyScoreSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(400);
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 9, tension: 70 }).start();
    }
  }, [visible, translateY]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.sheetWrapper,
          { paddingBottom: insets.bottom + tabBarHeight + tabBarBottomMargin, transform: [{ translateY }] },
        ]}
      >
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Safety Score Breakdown</Text>
              <Text style={styles.subtitle}>{cityLabel}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={THEME.colors.textSecondary} />
            </Pressable>
          </View>

          <View style={[styles.overallBadge, { borderColor: color }]}>
            <Text style={styles.overallScore}>
              <Text style={{ color, fontWeight: "800" }}>{score}</Text>/100
            </Text>
            <Text style={[styles.overallRating, { color }]}>{rating}</Text>
          </View>

          {breakdown.length === 0 ? (
            <Text style={styles.empty}>Detailed breakdown for {cityLabel} is coming soon.</Text>
          ) : (
            breakdown.map((item) => (
              <View key={item.label} style={styles.item}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={[styles.itemScore, { color: scoreBarColor(item.score) }]}>{item.score}/100</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${item.score}%`, backgroundColor: scoreBarColor(item.score) }]} />
                </View>
                <Text style={styles.itemDetail}>{item.detail}</Text>
              </View>
            ))
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 42, 32, 0.35)",
  },
  sheetWrapper: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: 0,
  },
  sheet: {
    backgroundColor: THEME.colors.background,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: "#0f2a20",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  overallBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1.5,
    backgroundColor: THEME.colors.surface,
    marginBottom: spacing.md,
  },
  overallScore: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  overallRating: {
    fontSize: typography.body.fontSize,
    fontWeight: "800",
  },
  empty: {
    color: THEME.colors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  item: {
    marginBottom: spacing.md,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  itemLabel: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  itemScore: {
    fontSize: typography.body.fontSize,
    fontWeight: "800",
  },
  barTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: THEME.colors.surface,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  barFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  itemDetail: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    lineHeight: 18,
  },
});
