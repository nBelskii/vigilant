import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "../components/MonoText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { fetchAlerts, fetchCrimeIncidents, fetchIncidents } from "../api/client";
import { Alert, Incident, IncidentCategory } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { distanceKm } from "../utils/geo";
import { DEFAULT_RADIUS_KM, getSavedLocation, SavedLocation } from "../utils/savedLocation";
import { AlertCard } from "../components/AlertCard";
import { AppHeader } from "../components/AppHeader";
import { IncidentRow } from "../components/IncidentRow";
import { StatCard } from "../components/StatCard";
import { IncidentDetailSheet } from "../components/IncidentDetailSheet";
import { colors, spacing, tabBarClearance, typography } from "../theme";
import { THEME } from "../theme/theme";

const EDMONTON_CENTER = { lat: 53.5461, lng: -113.4938 };

export function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [crime, setCrime] = useState<Incident[]>([]);
  const [location, setLocation] = useState<SavedLocation | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [alertsData, incidentsData, crimeData] = await Promise.allSettled([
      fetchAlerts(),
      fetchIncidents(),
      fetchCrimeIncidents(),
    ]);
    if (alertsData.status === "fulfilled") setAlerts(alertsData.value);
    if (incidentsData.status === "fulfilled") setIncidents(incidentsData.value);
    if (crimeData.status === "fulfilled") setCrime(crimeData.value);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  // Refresh whenever the tab regains focus, then keep polling for new
  // incidents/alerts every 60s while it stays in view.
  useFocusEffect(
    useCallback(() => {
      getSavedLocation().then(setLocation);
      load();
      const interval = setInterval(load, 60000);
      return () => clearInterval(interval);
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const center = location ? { lat: location.lat, lng: location.lng } : EDMONTON_CENTER;
  const radiusKm = location?.radiusKm ?? DEFAULT_RADIUS_KM;

  const nearby = [...incidents, ...crime]
    .filter((i) => i.lat !== null && i.lng !== null)
    .filter((i) => distanceKm(center, { lat: i.lat as number, lng: i.lng as number }) <= radiusKm)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const counts: Record<IncidentCategory, number> = { crime: 0, fire: 0, traffic: 0, other: 0 };
  nearby.forEach((incident) => {
    counts[categorizeIncident(incident.type, incident.source)] += 1;
  });

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <AppHeader title="Alerts" subtitle={location ? `Within ${radiusKm.toFixed(1)} km of ${location.label}` : "Edmonton, AB"} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />}
      >
        <Text style={styles.sectionLabel}>In your area</Text>
        <View style={styles.statsRow}>
          <StatCard label="Crime" value={String(counts.crime)} valueColor={THEME.colors.primary} />
          <StatCard label="Fire / Medical" value={String(counts.fire)} valueColor={colors.warning} />
          <StatCard label="Traffic" value={String(counts.traffic)} valueColor={colors.accent} />
          <StatCard label="Other" value={String(counts.other)} valueColor={THEME.colors.textSecondary} />
        </View>

        <Text style={styles.sectionLabel}>Nearby incidents</Text>
        {nearby.length === 0 && !loading ? (
          <Text style={styles.empty}>Nothing reported in your watched area recently.</Text>
        ) : (
          nearby.map((incident) => (
            <IncidentRow
              key={`${incident.source ?? "city"}-${incident.id}`}
              incident={incident}
              onPress={() => setSelectedIncidentId(incident.id)}
            />
          ))
        )}

        <Text style={styles.sectionLabel}>Road alerts (511 Alberta)</Text>
        {alerts.length === 0 && !loading ? (
          <Text style={styles.empty}>No active road alerts right now.</Text>
        ) : (
          alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        )}
      </ScrollView>

      <IncidentDetailSheet
        incidents={nearby}
        selectedId={selectedIncidentId}
        onSelectId={setSelectedIncidentId}
        center={center}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: tabBarClearance,
  },
  sectionLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  empty: {
    color: THEME.colors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: "center",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});
