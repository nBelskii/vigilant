import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "../components/MonoText";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchTrends, TrendsData } from "../api/client";
import { radius, spacing, tabBarClearance, typography } from "../theme";
import { THEME } from "../theme/theme";

const MAX_BAR_HEIGHT = 120;

function formatHour(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function heatColor(value: number, max: number): string {
  if (max === 0 || value === 0) return THEME.colors.surface;
  const ratio = value / max;
  if (ratio >= 0.7) return THEME.colors.danger;
  if (ratio >= 0.4) return THEME.colors.warning;
  return `${THEME.colors.primary}80`;
}

export function TrendsScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"weekly" | "hourly">("weekly");

  useEffect(() => {
    fetchTrends()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const maxWeekly = data ? Math.max(...data.weeks.map((w) => w.crime + w.fire + w.traffic), 1) : 1;
  const maxHourly = data ? Math.max(...data.hourly, 1) : 1;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={THEME.colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Neighbourhood Trends</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.tabs}>
        {(["weekly", "hourly"] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === "weekly" ? "Weekly" : "By Hour"}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Loading 30 days of data…</Text>
        </View>
      ) : !data ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Could not load trends. Check your connection.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {activeTab === "weekly" ? (
            <>
              <Text style={styles.sectionTitle}>Activity — Last 30 Days</Text>
              <Text style={styles.sectionSubtitle}>
                {data.totalCrime} crime · {data.totalFire} fire/EMS · {data.totalTraffic} traffic
              </Text>

              {/* Bar chart */}
              <View style={styles.chartCard}>
                <View style={styles.chart}>
                  {data.weeks.map((week, i) => {
                    const total = week.crime + week.fire + week.traffic;
                    const barH = Math.max(4, Math.round((total / maxWeekly) * MAX_BAR_HEIGHT));
                    const crimeH = Math.round((week.crime / Math.max(total, 1)) * barH);
                    const fireH = Math.round((week.fire / Math.max(total, 1)) * barH);
                    const trafficH = barH - crimeH - fireH;
                    return (
                      <View key={i} style={styles.barColumn}>
                        <Text style={styles.barCount}>{total}</Text>
                        <View style={[styles.bar, { height: barH }]}>
                          <View style={[styles.barSegment, { height: crimeH, backgroundColor: THEME.colors.danger }]} />
                          <View style={[styles.barSegment, { height: fireH, backgroundColor: THEME.colors.warning }]} />
                          <View style={[styles.barSegment, { height: Math.max(trafficH, 0), backgroundColor: THEME.colors.primary }]} />
                        </View>
                        <Text style={styles.barLabel}>{week.weekLabel}</Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.legend}>
                  {[
                    { color: THEME.colors.danger, label: "Crime" },
                    { color: THEME.colors.warning, label: "Fire/EMS" },
                    { color: THEME.colors.primary, label: "Traffic" },
                  ].map(({ color, label }) => (
                    <View key={label} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: color }]} />
                      <Text style={styles.legendLabel}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Weekly breakdown cards */}
              <Text style={styles.sectionTitle}>Week-by-week</Text>
              {[...data.weeks].reverse().map((week, i) => (
                <View key={i} style={styles.weekCard}>
                  <Text style={styles.weekCardLabel}>Week of {week.weekLabel}</Text>
                  <View style={styles.weekCardStats}>
                    <View style={styles.weekStat}>
                      <Text style={[styles.weekStatNum, { color: THEME.colors.danger }]}>{week.crime}</Text>
                      <Text style={styles.weekStatLabel}>Crime</Text>
                    </View>
                    <View style={styles.weekStat}>
                      <Text style={[styles.weekStatNum, { color: THEME.colors.warning }]}>{week.fire}</Text>
                      <Text style={styles.weekStatLabel}>Fire/EMS</Text>
                    </View>
                    <View style={styles.weekStat}>
                      <Text style={[styles.weekStatNum, { color: THEME.colors.primary }]}>{week.traffic}</Text>
                      <Text style={styles.weekStatLabel}>Traffic</Text>
                    </View>
                    <View style={styles.weekStat}>
                      <Text style={styles.weekStatNum}>{week.crime + week.fire + week.traffic}</Text>
                      <Text style={styles.weekStatLabel}>Total</Text>
                    </View>
                  </View>
                </View>
              ))}

              <Text style={styles.dataSource}>Source: {data.dataSource}</Text>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Busiest Hours</Text>
              <Text style={styles.sectionSubtitle}>
                Peak activity: {formatHour(data.peakHour)} Edmonton time
              </Text>

              <View style={styles.chartCard}>
                <View style={styles.heatGrid}>
                  {data.hourly.map((count, hour) => (
                    <View key={hour} style={styles.heatCell}>
                      <View
                        style={[
                          styles.heatBlock,
                          { backgroundColor: heatColor(count, maxHourly) },
                        ]}
                      />
                      {hour % 6 === 0 && (
                        <Text style={styles.heatLabel}>{formatHour(hour)}</Text>
                      )}
                    </View>
                  ))}
                </View>

                <View style={styles.heatLegend}>
                  <Text style={styles.heatLegendLabel}>Low</Text>
                  <View style={styles.heatGradient}>
                    {["#e8f5ee", `${THEME.colors.primary}80`, THEME.colors.warning, THEME.colors.danger].map((c, i) => (
                      <View key={i} style={[styles.heatGradientBlock, { backgroundColor: c }]} />
                    ))}
                  </View>
                  <Text style={styles.heatLegendLabel}>High</Text>
                </View>
              </View>

              {/* Top 5 hours */}
              <Text style={styles.sectionTitle}>Highest activity windows</Text>
              {data.hourly
                .map((count, hour) => ({ hour, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(({ hour, count }, i) => (
                  <View key={i} style={styles.weekCard}>
                    <View style={styles.weekCardStats}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.weekCardLabel}>{formatHour(hour)} – {formatHour((hour + 1) % 24)}</Text>
                      </View>
                      <Text style={[styles.weekStatNum, { color: i === 0 ? THEME.colors.danger : THEME.colors.textPrimary }]}>
                        {count} incidents
                      </Text>
                    </View>
                  </View>
                ))}

              <Text style={styles.dataSource}>Source: {data.dataSource} · Edmonton local time</Text>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    color: THEME.colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  tabActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  tabLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  tabLabelActive: { color: THEME.colors.textOnPrimary },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  loadingText: { color: THEME.colors.textSecondary, fontSize: typography.body.fontSize },
  content: { padding: spacing.lg, paddingBottom: tabBarClearance },
  sectionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.md,
  },
  chartCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: MAX_BAR_HEIGHT + 48,
    paddingTop: spacing.lg,
  },
  barColumn: { flex: 1, alignItems: "center", gap: spacing.xs },
  barCount: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  bar: {
    width: 36,
    borderRadius: radius.sm,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barSegment: { width: "100%" },
  barLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    textAlign: "center",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: radius.full },
  legendLabel: { color: THEME.colors.textSecondary, fontSize: typography.caption.fontSize },
  weekCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  weekCardLabel: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  weekCardStats: { flexDirection: "row", gap: spacing.md },
  weekStat: { flex: 1, alignItems: "center" },
  weekStatNum: {
    color: THEME.colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: "800",
  },
  weekStatLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  heatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  heatCell: { width: "12.5%", alignItems: "center", marginBottom: spacing.xs },
  heatBlock: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  heatLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 9,
    marginTop: 2,
  },
  heatLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  heatLegendLabel: { color: THEME.colors.textSecondary, fontSize: typography.caption.fontSize },
  heatGradient: { flexDirection: "row", gap: 4 },
  heatGradientBlock: { width: 20, height: 12, borderRadius: 2 },
  dataSource: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
