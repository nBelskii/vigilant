import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchIncidents } from "../api/client";
import { Incident } from "../types";
import { computeStats, groupByDay } from "../utils/digest";
import { IncidentRow } from "../components/IncidentRow";
import { StatCard } from "../components/StatCard";
import { AppHeader } from "../components/AppHeader";
import { colors, spacing, tabBarClearance, typography } from "../theme";
import { THEME } from "../theme/theme";

export function DigestScreen() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents()
      .then(setIncidents)
      .catch((err) => console.error("Failed to load incidents:", err))
      .finally(() => setLoading(false));
  }, []);

  const stats = computeStats(incidents);
  const days = groupByDay(incidents);

  const changeLabel =
    stats.changeVsLastWeek === null
      ? "N/A"
      : `${stats.changeVsLastWeek >= 0 ? "+" : ""}${stats.changeVsLastWeek.toFixed(0)}%`;

  const changeColor =
    stats.changeVsLastWeek === null
      ? THEME.colors.textSecondary
      : stats.changeVsLastWeek > 0
      ? THEME.colors.danger
      : THEME.colors.primary;

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <AppHeader title="Digest" subtitle="This week in Edmonton" />
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.statsRow}>
        <StatCard label="Total Incidents" value={String(stats.total)} />
        <StatCard label="Fires / Emergencies" value={String(stats.fires)} valueColor={colors.warning} />
        <StatCard label="vs Last Week" value={changeLabel} valueColor={changeColor} />
      </View>

      {!loading && days.length === 0 && (
        <Text style={styles.empty}>No incidents reported this week.</Text>
      )}

      {days.map((day) => (
        <View key={day.date} style={styles.daySection}>
          <Text style={styles.dayLabel}>{day.label}</Text>
          {day.incidents.map((incident) => (
            <IncidentRow key={incident.id} incident={incident} />
          ))}
        </View>
      ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: tabBarClearance,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  daySection: {
    marginBottom: spacing.lg,
  },
  dayLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    marginBottom: spacing.sm,
  },
  empty: {
    color: THEME.colors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
