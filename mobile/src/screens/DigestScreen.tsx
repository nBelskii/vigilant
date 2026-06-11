import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { fetchIncidents } from "../api/client";
import { Incident } from "../types";
import { computeStats, groupByDay } from "../utils/digest";
import { IncidentRow } from "../components/IncidentRow";
import { StatCard } from "../components/StatCard";
import { colors, spacing, typography } from "../theme";

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
      ? colors.textMuted
      : stats.changeVsLastWeek > 0
      ? colors.danger
      : colors.success;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Weekly Digest</Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    color: colors.text,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginBottom: spacing.lg,
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
    color: colors.textMuted,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    marginBottom: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    fontSize: typography.body.fontSize,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
