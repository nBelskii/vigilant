import React, { useEffect, useRef } from "react";
import {
  Alert as RNAlert,
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Incident } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { distanceKm } from "../utils/geo";
import { formatRelativeTime } from "../utils/time";
import { CATEGORY_ICONS } from "./IncidentMarker";
import { categoryColors, colors, radius, spacing, tabBarBottomMargin, tabBarHeight, typography } from "../theme";

interface IncidentDetailSheetProps {
  incidents: Incident[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
  center?: { lat: number; lng: number } | null;
  loading?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  crime: "Crime",
  fire: "Fire / Emergency",
  traffic: "Traffic",
  other: "Other",
};

const DISMISS_THRESHOLD = 80;
const SHEET_OFFSET = 400;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export function IncidentDetailSheet({ incidents, selectedId, onSelectId, center, loading }: IncidentDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const index = incidents.findIndex((item) => item.id === selectedId);
  const incident = index >= 0 ? incidents[index] : null;

  const translateY = useRef(new Animated.Value(SHEET_OFFSET)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 6 && gesture.dy > 0,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > DISMISS_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: SHEET_OFFSET,
            duration: 180,
            useNativeDriver: true,
          }).start(() => onSelectId(null));
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 9,
            tension: 70,
          }).start();
        }
      },
    })
  ).current;

  // Slide the sheet up from below the screen whenever a new incident is
  // selected (but not on prev/next navigation within an already-open sheet).
  useEffect(() => {
    if (!selectedId) return;
    translateY.setValue(SHEET_OFFSET);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      friction: 9,
      tension: 70,
    }).start();
  }, [selectedId, translateY]);

  if (!selectedId) return null;

  // Bottom offset so the sheet (and its content) clears the floating custom
  // tab bar + the device's safe-area inset exactly, on any iPhone.
  const bottomOffset = insets.bottom + tabBarHeight + tabBarBottomMargin + spacing.sm;
  const maxSheetHeight = SCREEN_HEIGHT * 0.6;

  if (!incident || loading) {
    return (
      <Animated.View
        style={[styles.sheetWrapper, { bottom: bottomOffset, transform: [{ translateY }] }]}
      >
        <View style={styles.sheet}>
          <View {...panResponder.panHandlers}>
            <View style={styles.grip} />
            <View style={styles.headerRow}>
              <View style={[styles.skeletonBlock, styles.skeletonIcon]} />
              <View style={[styles.skeletonBlock, styles.skeletonBadge]} />
              <View style={styles.spacer} />
              <Pressable onPress={() => onSelectId(null)} hitSlop={8} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <View style={[styles.skeletonBlock, styles.skeletonTitle]} />
            <View style={[styles.skeletonBlock, styles.skeletonLineShort]} />
          </View>
          <View style={styles.divider} />
          <View style={[styles.skeletonBlock, styles.skeletonLine]} />
          <View style={[styles.skeletonBlock, styles.skeletonLine]} />
          <View style={[styles.skeletonBlock, styles.skeletonCard]} />
        </View>
      </Animated.View>
    );
  }

  const category = categorizeIncident(incident.type, incident.source);
  const accentColor = categoryColors[category];
  const hasDistance = center && incident.lat !== null && incident.lng !== null;
  const distance = hasDistance
    ? distanceKm(center!, { lat: incident.lat as number, lng: incident.lng as number })
    : null;

  return (
    <Animated.View style={[styles.sheetWrapper, { bottom: bottomOffset, transform: [{ translateY }] }]}>
      <View style={[styles.sheet, { maxHeight: maxSheetHeight }]}>
        <View {...panResponder.panHandlers}>
          <View style={styles.grip} />

          <View style={styles.headerRow}>
            <View style={[styles.iconWrap, { backgroundColor: `${accentColor}1f` }]}>
              <Ionicons name={CATEGORY_ICONS[category]} size={18} color={accentColor} />
            </View>
            <View style={[styles.badge, { backgroundColor: `${accentColor}1f` }]}>
              <Text style={[styles.badgeText, { color: accentColor }]}>{CATEGORY_LABELS[category]}</Text>
            </View>
            <View style={styles.spacer} />
            <Pressable onPress={() => onSelectId(null)} hitSlop={8} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.title}>{incident.type}</Text>
          <Text style={styles.timestamp}>{formatRelativeTime(incident.timestamp, "Reported")}</Text>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} style={styles.rowIcon} />
            <Text style={styles.rowText}>{incident.location}</Text>
          </View>

          {distance !== null && (
            <View style={styles.row}>
              <Ionicons name="navigate-outline" size={14} color={colors.textMuted} style={styles.rowIcon} />
              <Text style={styles.rowText}>{distance.toFixed(1)} km from your watched area</Text>
            </View>
          )}

          {incident.source === "police" && (
            <View style={styles.row}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.textMuted} style={styles.rowIcon} />
              <Text style={styles.rowText}>Source: Edmonton Police Service</Text>
            </View>
          )}

          <View style={styles.insightsCard}>
            <View style={styles.insightsBadge}>
              <Ionicons name="sparkles" size={11} color={colors.indigo} />
              <Text style={styles.insightsBadgeText}>Analytics</Text>
            </View>

            <View style={styles.insightsHeader}>
              <Ionicons name="shield-checkmark" size={16} color={colors.indigo} />
              <Text style={styles.insightsTitle}>Neighborhood Safety Insights</Text>
            </View>
            <Text style={styles.insightsSubtitle}>
              A deeper look at this area to help you decide with confidence.
            </Text>

            <View style={styles.insightsStats}>
              <View style={styles.insightsStatRow}>
                <View style={styles.insightsStatIcon}>
                  <Ionicons name="school-outline" size={16} color={colors.indigo} />
                </View>
                <Text style={styles.insightsStatLabel}>School Zone Safety Rating</Text>
                <Text style={styles.insightsStatValue}>A+ · 9.2/10</Text>
              </View>
              <View style={styles.insightsStatRow}>
                <View style={styles.insightsStatIcon}>
                  <Ionicons name="stats-chart-outline" size={16} color={colors.indigo} />
                </View>
                <Text style={styles.insightsStatLabel}>30-Day Safety Trend</Text>
                <Text style={styles.insightsStatValue}>Stable / Quiet Area</Text>
              </View>
              <View style={styles.insightsStatRow}>
                <View style={styles.insightsStatIcon}>
                  <Ionicons name="moon-outline" size={16} color={colors.indigo} />
                </View>
                <Text style={styles.insightsStatLabel}>Nighttime Safety Index</Text>
                <Text style={styles.insightsStatValue}>94% Safe Hours</Text>
              </View>
            </View>

            <Pressable
              style={styles.upgradeButton}
              onPress={() =>
                RNAlert.alert(
                  "Unlock Deep Neighborhood Analytics",
                  "Thanks for your interest! We are currently benchmarking Edmonton neighborhood safety data. This premium feature will be available in the next update."
                )
              }
            >
              <Text style={styles.upgradeButtonText}>Unlock Deep Neighborhood Analytics</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheetWrapper: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
  },
  sheet: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: "#0f2a20",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  grip: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
  },
  spacer: {
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    marginBottom: 2,
  },
  timestamp: {
    color: colors.textFaint,
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.sm,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.sm,
  },
  scrollBody: {
    flexGrow: 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  rowIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  rowText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.body.fontSize,
  },
  insightsCard: {
    backgroundColor: colors.insightBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.insightBorder,
    padding: spacing.md,
    marginTop: spacing.md,
    position: "relative",
  },
  insightsBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    gap: 4,
  },
  insightsBadgeText: {
    color: colors.indigo,
    fontSize: 11,
    fontWeight: "700",
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingRight: 80,
  },
  insightsTitle: {
    color: colors.text,
    fontSize: typography.subheading.fontSize,
    fontWeight: typography.subheading.fontWeight,
    marginLeft: spacing.xs,
  },
  insightsSubtitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.md,
  },
  insightsStats: {
    opacity: 0.55,
    marginBottom: spacing.md,
  },
  insightsStatRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  insightsStatIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  insightsStatLabel: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  insightsStatValue: {
    color: colors.text,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    marginLeft: spacing.sm,
  },
  upgradeButton: {
    backgroundColor: colors.indigo,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  upgradeButtonText: {
    color: "#ffffff",
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  skeletonBlock: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
  skeletonIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    marginRight: spacing.sm,
  },
  skeletonBadge: {
    width: 72,
    height: 22,
    borderRadius: radius.full,
  },
  skeletonTitle: {
    width: "70%",
    height: 18,
    marginBottom: spacing.sm,
  },
  skeletonLine: {
    width: "100%",
    height: 14,
    marginBottom: spacing.sm,
  },
  skeletonLineShort: {
    width: "40%",
    height: 12,
    marginBottom: spacing.sm,
  },
  skeletonCard: {
    width: "100%",
    height: 96,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
});
