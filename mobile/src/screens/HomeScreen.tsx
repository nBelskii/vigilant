import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "../components/AppHeader";
import { AddressSearch } from "../components/AddressSearch";
import { RadiusSlider } from "../components/RadiusSlider";
import { RadiusMapPreview } from "../components/RadiusMapPreview";
import { QuickActionCard } from "../components/QuickActionCard";
import { GlassButton } from "../components/GlassButton";
import { StatCard } from "../components/StatCard";
import { fetchAirQuality, fetchCrimeIncidents, fetchIncidents } from "../api/client";
import { Incident } from "../types";
import { distanceKm, GeocodeResult, reverseGeocode } from "../utils/geo";
import { DEFAULT_RADIUS_KM, getSavedLocation, setSavedLocation, SavedLocation } from "../utils/savedLocation";
import { colors, radius, spacing, tabBarClearance, typography } from "../theme";

const EDMONTON_CENTER = { lat: 53.5461, lng: -113.4938 };

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [location, setLocation] = useState<SavedLocation | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [crime, setCrime] = useState<Incident[]>([]);
  const [aqhi, setAqhi] = useState<number | null>(null);
  const [draftCenter, setDraftCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getSavedLocation().then(setLocation);
    }, [])
  );

  useEffect(() => {
    fetchIncidents().then(setIncidents).catch(() => {});
    fetchCrimeIncidents().then(setCrime).catch(() => {});
    fetchAirQuality()
      .then((data) => {
        const edmonton = data.find((d) => d.city.toLowerCase().includes("edmonton"));
        setAqhi(edmonton?.aqhi ?? null);
      })
      .catch(() => {});
  }, []);

  const center = location ? { lat: location.lat, lng: location.lng } : EDMONTON_CENTER;
  const radiusKm = location?.radiusKm ?? DEFAULT_RADIUS_KM;

  const all = [...incidents, ...crime].filter((i) => i.lat !== null && i.lng !== null);
  const nearby = all.filter((i) => distanceKm(center, { lat: i.lat as number, lng: i.lng as number }) <= radiusKm);
  const nearbyCrime = nearby.filter((i) => i.source === "police");

  const handleSelectAddress = async (result: GeocodeResult) => {
    const next: SavedLocation = {
      label: result.label,
      lat: result.lat,
      lng: result.lng,
      radiusKm: location?.radiusKm ?? DEFAULT_RADIUS_KM,
    };
    setLocation(next);
    await setSavedLocation(next);
  };

  const handleUseDraftCenter = async () => {
    if (!draftCenter) return;
    setSavingLocation(true);
    try {
      const label = await reverseGeocode(draftCenter.lat, draftCenter.lng).catch(() => "Custom location");
      const next: SavedLocation = { label, lat: draftCenter.lat, lng: draftCenter.lng, radiusKm };
      setLocation(next);
      await setSavedLocation(next);
      setDraftCenter(null);
    } finally {
      setSavingLocation(false);
    }
  };

  const handleRadiusChange = async (value: number) => {
    const base: SavedLocation = location ?? {
      label: "Edmonton, AB",
      lat: EDMONTON_CENTER.lat,
      lng: EDMONTON_CENTER.lng,
      radiusKm: DEFAULT_RADIUS_KM,
    };
    const next = { ...base, radiusKm: value };
    setLocation(next);
    await setSavedLocation(next);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Nearby" subtitle="Edmonton, AB" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Watch an area</Text>
        <AddressSearch onSelect={handleSelectAddress} />

        {location && (
          <View style={styles.watchingCard}>
            <Ionicons name="locate" size={16} color={colors.brandEnd} style={styles.watchingIcon} />
            <Text style={styles.watchingLabel} numberOfLines={2}>
              {location.label}
            </Text>
          </View>
        )}

        <Text style={styles.hint}>Drag the map to fine-tune the centre of your alert area.</Text>
        <View style={styles.mapPreview}>
          <RadiusMapPreview center={center} radiusKm={radiusKm} interactive onCenterChange={setDraftCenter} />
        </View>

        {draftCenter && distanceKm(center, draftCenter) > 0.05 && (
          <View style={styles.useLocationWrap}>
            <GlassButton
              label={savingLocation ? "Saving..." : "Use this location"}
              icon="checkmark-circle"
              variant="primary"
              disabled={savingLocation}
              onPress={handleUseDraftCenter}
            />
          </View>
        )}

        <RadiusSlider value={radiusKm} onChange={handleRadiusChange} />

        <Text style={styles.sectionLabel}>Right now</Text>
        <View style={styles.statsRow}>
          <StatCard label="Nearby (24h)" value={String(nearby.length)} valueColor={colors.accent} />
          <StatCard label="Police Reports" value={String(nearbyCrime.length)} valueColor={colors.brandEnd} />
          <StatCard label="Air Quality (AQHI)" value={aqhi !== null ? String(aqhi) : "—"} valueColor={colors.success} />
        </View>

        <Text style={styles.sectionLabel}>Quick actions</Text>
        <View style={styles.grid}>
          <QuickActionCard icon="map" label="Live Map" accent={colors.accent} onPress={() => navigation.navigate("Map")} />
          <QuickActionCard icon="warning" label="Alerts" accent={colors.warning} onPress={() => navigation.navigate("Alerts")} />
          <QuickActionCard icon="calendar" label="Weekly Digest" accent={colors.success} onPress={() => navigation.navigate("Digest")} />
          <QuickActionCard
            icon="settings"
            label="Settings"
            accent={colors.brandEnd}
            onPress={() => navigation.navigate("Profile", { screen: "Settings" })}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: tabBarClearance,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  watchingCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  watchingIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  watchingLabel: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body.fontSize,
  },
  hint: {
    color: colors.textFaint,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.sm,
  },
  mapPreview: {
    marginTop: spacing.sm,
  },
  useLocationWrap: {
    alignItems: "center",
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
