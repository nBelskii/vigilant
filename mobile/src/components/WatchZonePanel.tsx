import React, { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import { AddressSearch } from "./AddressSearch";
import { GlassButton } from "./GlassButton";
import { ZoneRadiusSlider } from "./ZoneRadiusSlider";
import { GeocodeResult } from "../utils/geo";
import { WatchedZone } from "../utils/savedLocation";
import { radius, spacing, typography } from "../theme";
import { THEME } from "../theme/theme";

type ZoneType = "home" | "work" | "school";

const ZONE_TYPE_OPTIONS: { type: ZoneType; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { type: "home", icon: "home-outline", label: "Home" },
  { type: "work", icon: "briefcase-outline", label: "Work" },
  { type: "school", icon: "school-outline", label: "School" },
];

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
  zones: WatchedZone[];
  activeZoneId: string | null;
  onSelectZone: (zone: WatchedZone) => void;
  onDeleteZone: (id: string) => void;
  onNewZone: () => void;
  canAddZone: boolean;
  draftType?: ZoneType;
  onTypeChange?: (type: ZoneType) => void;
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
  zones,
  activeZoneId,
  onSelectZone,
  onDeleteZone,
  onNewZone,
  canAddZone,
  draftType = "home",
  onTypeChange,
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

        {zones.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.zoneChips}
            contentContainerStyle={styles.zoneChipsContent}
          >
            {zones.map((zone) => {
              const isActive = zone.id === activeZoneId;
              return (
                <Pressable
                  key={zone.id}
                  style={[styles.zoneChip, isActive && styles.zoneChipActive]}
                  onPress={() => onSelectZone(zone)}
                >
                  <Ionicons
                    name="bookmark"
                    size={12}
                    color={isActive ? THEME.colors.primary : THEME.colors.textSecondary}
                    style={styles.zoneChipIcon}
                  />
                  <Text style={[styles.zoneChipLabel, isActive && styles.zoneChipLabelActive]} numberOfLines={1}>
                    {zone.label}
                  </Text>
                  <Pressable hitSlop={8} onPress={() => onDeleteZone(zone.id)} style={styles.zoneChipDelete}>
                    <Ionicons name="close-circle" size={14} color={THEME.colors.textSecondary} />
                  </Pressable>
                </Pressable>
              );
            })}
            <Pressable
              style={[styles.zoneChip, styles.zoneChipAdd, !canAddZone && styles.zoneChipLocked]}
              onPress={onNewZone}
            >
              <Ionicons
                name={canAddZone ? "add" : "lock-closed"}
                size={14}
                color={canAddZone ? THEME.colors.primary : THEME.colors.textSecondary}
              />
              <Text style={[styles.zoneChipLabel, canAddZone && styles.zoneChipLabelActive]}>
                {canAddZone ? "Add area" : "Pro only"}
              </Text>
            </Pressable>
          </ScrollView>
        )}

        {/* Zone type selector */}
        {onTypeChange && (
          <View style={styles.typeRow}>
            {ZONE_TYPE_OPTIONS.map(({ type, icon, label }) => (
              <Pressable
                key={type}
                style={[styles.typeChip, draftType === type && styles.typeChipActive]}
                onPress={() => onTypeChange(type)}
              >
                <Ionicons
                  name={icon}
                  size={13}
                  color={draftType === type ? THEME.colors.primary : THEME.colors.textSecondary}
                  style={styles.typeChipIcon}
                />
                <Text style={[styles.typeChipLabel, draftType === type && styles.typeChipLabelActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.subtitle}>
          {activeZoneId ? "Edit this watch zone or save changes." : "Search an address or drop a mark on the map."}
        </Text>

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
  zoneChips: {
    marginHorizontal: -spacing.md,
    marginBottom: spacing.sm,
  },
  zoneChipsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  zoneChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    maxWidth: 160,
  },
  zoneChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.secondary,
  },
  zoneChipAdd: {
    maxWidth: 110,
  },
  zoneChipLocked: {
    opacity: 0.6,
  },
  zoneChipIcon: {
    marginRight: 4,
  },
  zoneChipLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "600",
    flexShrink: 1,
  },
  zoneChipLabelActive: {
    color: THEME.colors.textPrimary,
  },
  zoneChipDelete: {
    marginLeft: 4,
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
  typeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  typeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  typeChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.secondary,
  },
  typeChipIcon: { marginRight: 4 },
  typeChipLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "600",
  },
  typeChipLabelActive: { color: THEME.colors.primary },
});
