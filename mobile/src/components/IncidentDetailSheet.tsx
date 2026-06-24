import React, { useEffect, useRef, useState } from "react";
import {
  Alert as RNAlert,
  Animated,
  Dimensions,
  Linking,
  PanResponder,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Incident } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { distanceKm } from "../utils/geo";
import { getProStatus } from "../utils/proStatus";
import { computeSafetyIndex } from "../utils/safetyIndex";
import { formatRelativeTime } from "../utils/time";
import { CATEGORY_ICONS } from "./IncidentMarker";
import { SafetyScoreSheet } from "./SafetyScoreSheet";
import { categoryColors, radius, spacing, tabBarBottomMargin, tabBarHeight, typography } from "../theme";
import { THEME } from "../theme/theme";

// Radius around an incident used to compute its NearBy Safety Index.
const SAFETY_INDEX_RADIUS_KM = 2;

function safetyScoreColor(score: number): string {
  if (score >= 75) return THEME.colors.primary;
  if (score >= 55) return THEME.colors.warning;
  return THEME.colors.danger;
}

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
// Compact floating card: roughly 25-30% of the screen height.
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.28;

export function IncidentDetailSheet({ incidents, selectedId, onSelectId, center, loading }: IncidentDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const index = incidents.findIndex((item) => item.id === selectedId);
  const incident = index >= 0 ? incidents[index] : null;

  const [isPro, setIsPro] = useState(false);
  const [safetyIndexOpen, setSafetyIndexOpen] = useState(false);

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
  // selected.
  useEffect(() => {
    if (!selectedId) return;
    translateY.setValue(SHEET_OFFSET);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      friction: 9,
      tension: 70,
    }).start();
    getProStatus().then(setIsPro);
  }, [selectedId, translateY]);

  if (!selectedId) return null;

  // Bottom offset so the sheet (and its content) clears the floating custom
  // tab bar + the device's safe-area inset exactly, on any iPhone.
  const bottomOffset = insets.bottom + tabBarHeight + tabBarBottomMargin + spacing.sm;

  if (!incident || loading) {
    return (
      <Animated.View
        style={[styles.sheetWrapper, { bottom: bottomOffset, height: SHEET_HEIGHT, transform: [{ translateY }] }]}
      >
        <View style={styles.sheet}>
          <View {...panResponder.panHandlers}>
            <View style={styles.grip} />
            <View style={styles.headerRow}>
              <View style={[styles.skeletonBlock, styles.skeletonIcon]} />
              <View style={[styles.skeletonBlock, styles.skeletonBadge]} />
              <View style={styles.spacer} />
              <Pressable onPress={() => onSelectId(null)} hitSlop={8} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={THEME.colors.textSecondary} />
              </Pressable>
            </View>
            <View style={[styles.skeletonBlock, styles.skeletonTitle]} />
            <View style={[styles.skeletonBlock, styles.skeletonLineShort]} />
          </View>
          <View style={styles.divider} />
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

  const safetyIndex =
    incident.lat !== null && incident.lng !== null
      ? computeSafetyIndex({ lat: incident.lat, lng: incident.lng }, SAFETY_INDEX_RADIUS_KM, incidents)
      : null;

  const handleInsightsPress = () => {
    if (isPro) {
      setSafetyIndexOpen(true);
      return;
    }

    RNAlert.alert(
      "NearBy Safety Index is a Pro feature",
      "Unlock crime trends, traffic safety, and fire/EMS activity scores for any location with Nearby Pro.",
      [
        { text: "Not now", style: "cancel" },
        {
          text: "Upgrade",
          onPress: () => navigation.navigate("Profile", { screen: "Subscription" }),
        },
      ]
    );
  };

  const handleShare = () => {
    const mapsLink =
      incident.lat !== null && incident.lng !== null
        ? `https://maps.google.com/?q=${incident.lat},${incident.lng}`
        : null;
    Share.share({
      message: [
        `${CATEGORY_LABELS[category]} reported near ${incident.location}`,
        incident.type,
        mapsLink,
        "Shared via Vigilant — stay aware of what's happening near you.",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  };

  return (
    <Animated.View
      style={[styles.sheetWrapper, { bottom: bottomOffset, height: SHEET_HEIGHT, transform: [{ translateY }] }]}
    >
      <View style={styles.sheet}>
        <View {...panResponder.panHandlers}>
          <View style={styles.grip} />

          <View style={styles.headerRow}>
            <View style={[styles.iconWrap, { backgroundColor: `${accentColor}1f` }]}>
              <Ionicons name={CATEGORY_ICONS[category]} size={16} color={accentColor} />
            </View>
            <View style={[styles.badge, { backgroundColor: `${accentColor}1f` }]}>
              <Text style={[styles.badgeText, { color: accentColor }]}>{CATEGORY_LABELS[category]}</Text>
            </View>
            <View style={styles.spacer} />
            <Pressable onPress={handleShare} hitSlop={8} style={styles.closeButton}>
              <Ionicons name="share-social-outline" size={20} color={THEME.colors.textSecondary} />
            </Pressable>
            <Pressable onPress={() => onSelectId(null)} hitSlop={8} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={THEME.colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.title} numberOfLines={1}>{incident.type}</Text>
          <Text style={styles.timestamp}>{formatRelativeTime(incident.timestamp, "Reported")}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.body}>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color={THEME.colors.textSecondary} style={styles.rowIcon} />
            <Text style={styles.rowText} numberOfLines={1}>{incident.location}</Text>
          </View>

          {distance !== null && (
            <View style={styles.row}>
              <Ionicons name="navigate-outline" size={14} color={THEME.colors.textSecondary} style={styles.rowIcon} />
              <Text style={styles.rowText}>{distance.toFixed(1)} km from your watched area</Text>
            </View>
          )}

          {incident.source === "police" && (
            <View style={styles.row}>
              <Ionicons name="shield-checkmark-outline" size={14} color={THEME.colors.textSecondary} style={styles.rowIcon} />
              <Text style={styles.rowText}>Source: Edmonton Police Service</Text>
            </View>
          )}

          {incident.source === "social" && (
            <View style={styles.row}>
              <Ionicons name="newspaper-outline" size={14} color={THEME.colors.textSecondary} style={styles.rowIcon} />
              {incident.url ? (
                <Text style={styles.rowText}>
                  Official EPS update —{" "}
                  <Text
                    style={styles.linkText}
                    onPress={() => {
                      const url = incident.url as string;
                      if (url.startsWith("https://www.edmontonpolice.ca/")) {
                        Linking.openURL(url);
                      }
                    }}
                  >
                    read full release
                  </Text>
                </Text>
              ) : (
                <Text style={styles.rowText}>Official EPS media release</Text>
              )}
            </View>
          )}

          <Pressable style={styles.insightsCard} onPress={handleInsightsPress}>
            <Ionicons name="shield-checkmark" size={16} color={THEME.colors.primary} style={styles.insightsIcon} />
            <View style={styles.insightsTextWrap}>
              <Text style={styles.insightsTitle}>NearBy Safety Index</Text>
              <Text style={styles.insightsSubtitle}>
                {isPro && safetyIndex
                  ? `${safetyIndex.score}/100 · ${safetyIndex.rating} · within ${SAFETY_INDEX_RADIUS_KM} km`
                  : "Crime, traffic & fire activity score"}
              </Text>
            </View>
            <View style={styles.insightsAction}>
              {!isPro && (
                <Ionicons name="lock-closed" size={12} color={THEME.colors.textOnPrimary} style={styles.insightsLockIcon} />
              )}
              <Text style={styles.insightsActionText}>{isPro ? "View" : "Unlock"}</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {safetyIndex && (
        <SafetyScoreSheet
          visible={safetyIndexOpen}
          onClose={() => setSafetyIndexOpen(false)}
          cityLabel={incident.location}
          score={safetyIndex.score}
          rating={safetyIndex.rating}
          color={safetyScoreColor(safetyIndex.score)}
          breakdown={safetyIndex.breakdown}
        />
      )}
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
    flex: 1,
    backgroundColor: THEME.colors.background,
    borderRadius: radius.xl,
    padding: spacing.md,
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
    backgroundColor: THEME.colors.border,
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
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
    color: THEME.colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    marginBottom: 1,
  },
  timestamp: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.xs,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    marginBottom: spacing.xs,
  },
  body: {
    flex: 1,
    justifyContent: "center",
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
    color: THEME.colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
  linkText: {
    color: THEME.colors.primary,
    fontWeight: "700",
  },
  insightsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.secondary,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  insightsIcon: {
    marginRight: spacing.sm,
  },
  insightsTextWrap: {
    flex: 1,
  },
  insightsTitle: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  insightsSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: 1,
  },
  insightsAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primary,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    marginLeft: spacing.sm,
  },
  insightsLockIcon: {
    marginRight: 4,
  },
  insightsActionText: {
    color: THEME.colors.textOnPrimary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
  },
  skeletonBlock: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.sm,
  },
  skeletonIcon: {
    width: 28,
    height: 28,
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
    height: 64,
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
});
