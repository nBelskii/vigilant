import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AddressSearch } from "./AddressSearch";
import { GlassButton } from "./GlassButton";
import { ZoneRadiusSlider } from "./ZoneRadiusSlider";
import { GeocodeResult } from "../utils/geo";
import { radius, spacing, typography } from "../theme";
import { THEME } from "../theme/theme";

interface WatchZonePanelProps {
  bottomOffset: number;
  locationLabel: string | null;
  radiusM: number;
  onRadiusChange: (radiusM: number) => void;
  onSelectAddress: (result: GeocodeResult) => void;
  onPickOnMap: () => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  hasSelection: boolean;
}

export function WatchZonePanel({
  bottomOffset,
  locationLabel,
  radiusM,
  onRadiusChange,
  onSelectAddress,
  onPickOnMap,
  onSave,
  onClose,
  saving,
  hasSelection,
}: WatchZonePanelProps) {
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 9, tension: 70 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [translateY, opacity]);

  return (
    <Animated.View
      style={[styles.wrapper, { bottom: bottomOffset, opacity, transform: [{ translateY }] }]}
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <Ionicons name="locate" size={18} color={THEME.colors.primary} style={styles.titleIcon} />
            <Text style={styles.title}>Watch Zone</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
            <Ionicons name="close" size={20} color={THEME.colors.textSecondary} />
          </Pressable>
        </View>

        <Text style={styles.subtitle}>Search an address or drop a mark on the map.</Text>

        <AddressSearch onSelect={onSelectAddress} />

        <Pressable style={styles.pickButton} onPress={onPickOnMap}>
          <Ionicons name="add-circle" size={18} color={THEME.colors.primary} style={styles.pickIcon} />
          <Text style={styles.pickLabel}>Tap Map to Set Center</Text>
        </Pressable>
        <Text style={styles.pickHint}>Drag the green pin on the map to fine-tune your center.</Text>

        {hasSelection && locationLabel && (
          <View style={styles.selectionRow}>
            <Ionicons name="checkmark-circle" size={14} color={THEME.colors.primary} style={styles.selectionIcon} />
            <Text style={styles.selectionLabel} numberOfLines={2}>
              {locationLabel}
            </Text>
          </View>
        )}

        <ZoneRadiusSlider radiusM={radiusM} onChange={onRadiusChange} />

        <View style={styles.saveWrap}>
          <GlassButton
            label={saving ? "Saving..." : "Save Watch Zone"}
            icon="checkmark-circle"
            variant="primary"
            disabled={saving || !hasSelection}
            onPress={onSave}
            style={styles.saveButton}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
  },
  card: {
    backgroundColor: THEME.colors.background,
    borderRadius: radius.xl,
    padding: spacing.md,
    shadowColor: "#0f2a20",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleIcon: {
    marginRight: spacing.xs,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
  },
  closeButton: {
    padding: spacing.xs,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.sm,
  },
  pickButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.secondary,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  pickIcon: {
    marginRight: spacing.xs,
  },
  pickLabel: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
  },
  pickHint: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  selectionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.sm,
  },
  selectionIcon: {
    marginRight: spacing.xs,
    marginTop: 2,
  },
  selectionLabel: {
    flex: 1,
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
  },
  saveWrap: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  saveButton: {
    width: "100%",
    alignItems: "center",
  },
});
