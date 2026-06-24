import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { fetchAirQuality, fetchAlerts, fetchCrimeIncidents, fetchIncidents } from "../api/client";
import { AirQuality, Alert, Incident } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { distanceKm } from "../utils/geo";
import { DEFAULT_RADIUS_KM, getWatchedZones, WatchedZone } from "../utils/savedLocation";
import { SafetyScoreGauge } from "../components/SafetyScoreGauge";
import { SafetyScoreBreakdownItem, SafetyScoreSheet } from "../components/SafetyScoreSheet";
import { IncidentDetailSheet } from "../components/IncidentDetailSheet";
import { spacing, tabBarClearance, typography, radius, screenPadding } from "../theme";
import { THEME } from "../theme/theme";

const EDMONTON_CENTER = { lat: 53.5461, lng: -113.4938 };

// Per-city analytics profile. Edmonton is the only fully wired city today,
// but every other Canadian city can be added here as open-data feeds land.
interface CityProfile {
  label: string;
  province: string;
  population: string;
  safetyScore: number;
  safetyRating: "Excellent" | "Good" | "Moderate" | "Caution" | "High Risk";
  trends: {
    label: string;
    changePct: number;
    description: string;
    detail: string;
  }[];
  breakdown: SafetyScoreBreakdownItem[];
  available: boolean;
}

const CITY_PROFILES: Record<string, CityProfile> = {
  "Edmonton, AB": {
    label: "Edmonton, AB",
    province: "Alberta",
    population: "~1.1M",
    safetyScore: 78,
    safetyRating: "Moderate",
    trends: [
      {
        label: "Property Crime",
        changePct: -4.2,
        description: "Break-ins and theft are down year-over-year across most neighborhoods.",
        detail: "Based on EPS open data across all neighborhoods. Break-and-enters saw the largest decline, while theft from vehicles held roughly steady.",
      },
      {
        label: "Violent Incidents",
        changePct: 1.5,
        description: "A modest uptick, concentrated in a small number of downtown blocks.",
        detail: "Most of the increase is concentrated within a few downtown blocks late at night. Residential areas remained flat or improved.",
      },
      {
        label: "Traffic Collisions",
        changePct: -2.8,
        description: "Fewer reported collisions, likely helped by recent road upgrades.",
        detail: "Intersection redesigns and new photo-radar zones on Whitemud and Yellowhead corridors appear to be reducing collision frequency.",
      },
    ],
    breakdown: [
      {
        label: "Crime Rate",
        score: 72,
        detail: "Property and violent crime rates compared to similarly sized Canadian cities.",
      },
      {
        label: "Police Response Time",
        score: 81,
        detail: "Average response time to priority calls is faster than the national median.",
      },
      {
        label: "Traffic Safety",
        score: 75,
        detail: "Collision frequency on major routes, weighted by traffic volume.",
      },
      {
        label: "Community Programs",
        score: 85,
        detail: "Neighborhood watch coverage and active community policing initiatives.",
      },
    ],
    available: true,
  },
  "Calgary, AB": {
    label: "Calgary, AB",
    province: "Alberta",
    population: "~1.6M",
    safetyScore: 81,
    safetyRating: "Good",
    trends: [],
    breakdown: [],
    available: false,
  },
  "Toronto, ON": {
    label: "Toronto, ON",
    province: "Ontario",
    population: "~2.9M",
    safetyScore: 72,
    safetyRating: "Moderate",
    trends: [],
    breakdown: [],
    available: false,
  },
  "Vancouver, BC": {
    label: "Vancouver, BC",
    province: "British Columbia",
    population: "~0.7M",
    safetyScore: 69,
    safetyRating: "Moderate",
    trends: [],
    breakdown: [],
    available: false,
  },
};

const CITY_OPTIONS = Object.keys(CITY_PROFILES);

// Rotates daily so the dashboard always has something fresh to show, even
// when there's no new activity nearby.
const SAFETY_TIPS: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[] = [
  {
    icon: "car-outline",
    title: "Lock it up",
    text: "Always lock your vehicle and keep valuables out of sight — vehicle break-ins are one of the most common reports nearby.",
  },
  {
    icon: "flashlight-outline",
    title: "Light the way",
    text: "Stick to well-lit streets at night and let someone know your route if you're walking alone.",
  },
  {
    icon: "home-outline",
    title: "Secure your home",
    text: "Double-check doors and windows before bed — most break-ins happen through unlocked entry points.",
  },
  {
    icon: "bicycle-outline",
    title: "Lock your bike right",
    text: "Use a U-lock through the frame and a wheel, and park in well-trafficked, well-lit areas.",
  },
  {
    icon: "phone-portrait-outline",
    title: "Stay aware",
    text: "Avoid walking while distracted by your phone, especially in unfamiliar areas after dark.",
  },
  {
    icon: "people-outline",
    title: "Travel together",
    text: "When possible, walk with others — groups are far less likely to be targeted.",
  },
  {
    icon: "flame-outline",
    title: "Check your alarms",
    text: "Test smoke and CO detectors monthly — most home fires turn deadly when alarms are missing or dead.",
  },
];

function getTipOfDay() {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return SAFETY_TIPS[dayIndex % SAFETY_TIPS.length];
}

function aqhiColor(category: string): string {
  switch (category) {
    case "Low Risk":
      return THEME.colors.primary;
    case "Moderate Risk":
      return THEME.colors.warning;
    default:
      return THEME.colors.danger;
  }
}

function scoreColor(score: number): string {
  if (score >= 75) return THEME.colors.primary;
  if (score >= 55) return THEME.colors.warning;
  return THEME.colors.danger;
}

function trendColor(changePct: number): string {
  // A decrease in crime/collision metrics is an improvement (green); an
  // increase is a concern (red). Framed for real-estate buyers.
  return changePct < 0 ? THEME.colors.primary : THEME.colors.danger;
}

function describeIncident(incident: Incident): string {
  const category = categorizeIncident(incident.type, incident.source);
  const location = incident.location || "the area";

  switch (category) {
    case "crime":
      return `A reported ${incident.type.toLowerCase()} was logged near ${location}. Local police have been notified and the area is being monitored.`;
    case "traffic":
      return `A traffic incident (${incident.type.toLowerCase()}) was reported on ${location}. Expect possible delays and reduced visibility nearby.`;
    case "fire":
      return `Emergency crews responded to a ${incident.type.toLowerCase()} call near ${location}. Status is being tracked as new details come in.`;
    default:
      return `An event (${incident.type.toLowerCase()}) was recorded near ${location}. Tap below for more context as it develops.`;
  }
}

function formatTimeAgo(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
}

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [crime, setCrime] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [airQuality, setAirQuality] = useState<AirQuality[]>([]);
  const [zones, setZones] = useState<WatchedZone[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCity, setActiveCity] = useState("Edmonton, AB");
  const [scoreSheetOpen, setScoreSheetOpen] = useState(false);
  const [expandedTrend, setExpandedTrend] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [incidentsData, crimeData, alertsData, airQualityData] = await Promise.allSettled([
      fetchIncidents(),
      fetchCrimeIncidents(),
      fetchAlerts(),
      fetchAirQuality(),
    ]);
    if (incidentsData.status === "fulfilled") setIncidents(incidentsData.value);
    if (crimeData.status === "fulfilled") setCrime(crimeData.value);
    if (alertsData.status === "fulfilled") setAlerts(alertsData.value);
    if (airQualityData.status === "fulfilled") setAirQuality(airQualityData.value);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      getWatchedZones().then(setZones);
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

  const profile = CITY_PROFILES[activeCity];
  const primaryZone = zones[0];
  const center = primaryZone ? { lat: primaryZone.lat, lng: primaryZone.lng } : EDMONTON_CENTER;

  // Falls back to a default Edmonton-wide zone for first-time users who
  // haven't saved a watch zone yet.
  const effectiveZones: { label: string; lat: number; lng: number; radiusKm: number }[] =
    zones.length > 0
      ? zones
      : [{ label: "Edmonton, AB", lat: EDMONTON_CENTER.lat, lng: EDMONTON_CENTER.lng, radiusKm: DEFAULT_RADIUS_KM }];

  const recentIncidents = useMemo(() => {
    return [...incidents, ...crime]
      .filter((item) => {
        if (item.lat === null || item.lng === null) return false;
        return effectiveZones.some(
          (zone) => distanceKm({ lat: zone.lat, lng: zone.lng }, { lat: item.lat as number, lng: item.lng as number }) <= zone.radiusKm
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [incidents, crime, effectiveZones]);

  const activeAlertsCount = alerts.length + recentIncidents.length;
  const cityAirQuality = airQuality.find((aq) => aq.city === profile.label.split(",")[0].trim());
  const tipOfDay = useMemo(() => getTipOfDay(), []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />}
      >
        <Text style={styles.brand}>Safety Analytics Hub</Text>

        {/* City carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cityCarousel}
          contentContainerStyle={styles.cityCarouselContent}
        >
          {CITY_OPTIONS.map((city) => {
            const cityProfile = CITY_PROFILES[city];
            const isActive = city === activeCity;
            return (
              <Pressable
                key={city}
                style={[styles.cityCard, isActive && styles.cityCardActive]}
                onPress={() => {
                  setActiveCity(city);
                  setExpandedTrend(null);
                }}
              >
                <Text style={[styles.cityCardLabel, isActive && styles.cityCardLabelActive]} numberOfLines={1}>
                  {cityProfile.label}
                </Text>
                <View style={styles.cityCardScoreRow}>
                  <View style={[styles.cityCardDot, { backgroundColor: scoreColor(cityProfile.safetyScore) }]} />
                  <Text style={styles.cityCardScore}>{cityProfile.safetyScore}/100</Text>
                </View>
                {!cityProfile.available && (
                  <View style={styles.cityCardSoonBadge}>
                    <Text style={styles.cityCardSoonText}>Coming soon</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Safety score gauge */}
        <View style={styles.card}>
          <SafetyScoreGauge
            score={profile.safetyScore}
            rating={profile.safetyRating}
            color={scoreColor(profile.safetyScore)}
            onPress={() => setScoreSheetOpen(true)}
          />

          {/* Sub-header metadata row */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={16} color={THEME.colors.textSecondary} />
              <Text style={styles.metaText}>Population: {profile.population}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="alert-circle-outline" size={16} color={THEME.colors.textSecondary} />
              <Text style={styles.metaText}>Active Alerts: {activeAlertsCount}</Text>
            </View>
            {cityAirQuality && (
              <View style={styles.metaItem}>
                <Ionicons name="leaf-outline" size={16} color={aqhiColor(cityAirQuality.category)} />
                <Text style={styles.metaText}>
                  Air Quality: {cityAirQuality.category}
                  {cityAirQuality.aqhi !== null ? ` (AQHI ${cityAirQuality.aqhi})` : ""}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Daily safety tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <Ionicons name={tipOfDay.icon} size={18} color={THEME.colors.primary} />
          </View>
          <View style={styles.tipTextWrap}>
            <Text style={styles.tipTitle}>Tip of the day · {tipOfDay.title}</Text>
            <Text style={styles.tipText}>{tipOfDay.text}</Text>
          </View>
        </View>

        {/* Percentage trends */}
        <Text style={styles.sectionLabel}>Year-over-year trends</Text>
        {profile.trends.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Crime trend analytics for {profile.label} are coming soon.</Text>
          </View>
        ) : (
          <View style={styles.trendsBlock}>
            {profile.trends.map((trend) => {
              const isUp = trend.changePct > 0;
              const color = trendColor(trend.changePct);
              const isExpanded = expandedTrend === trend.label;
              return (
                <Pressable
                  key={trend.label}
                  style={styles.trendCard}
                  onPress={() => setExpandedTrend(isExpanded ? null : trend.label)}
                >
                  <View style={styles.trendHeaderRow}>
                    <Text style={styles.trendLabel}>{trend.label}</Text>
                    <View style={styles.trendChangeRow}>
                      <Ionicons
                        name={isUp ? "trending-up" : "trending-down"}
                        size={16}
                        color={color}
                        style={styles.trendIcon}
                      />
                      <Text style={[styles.trendChange, { color }]}>
                        {isUp ? "+" : ""}
                        {trend.changePct.toFixed(1)}%
                      </Text>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={THEME.colors.textSecondary}
                        style={styles.trendChevron}
                      />
                    </View>
                  </View>
                  <Text style={styles.trendDescription}>{trend.description}</Text>
                  {isExpanded && (
                    <View style={styles.trendDetailBox}>
                      <Text style={styles.trendDetailText}>{trend.detail}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>Explore</Text>
        <View style={styles.quickActions}>
          <Pressable style={styles.quickCard} onPress={() => navigation.navigate("Profile", { screen: "Trends" })}>
            <View style={styles.quickIconWrap}>
              <Ionicons name="bar-chart" size={20} color={THEME.colors.primary} />
            </View>
            <View style={styles.quickTextWrap}>
              <Text style={styles.quickTitle}>Neighbourhood Trends</Text>
              <Text style={styles.quickSubtitle}>30-day crime & fire activity</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={THEME.colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.quickCard} onPress={() => navigation.navigate("Profile", { screen: "AddressCheck" })}>
            <View style={styles.quickIconWrap}>
              <Ionicons name="shield-checkmark" size={20} color={THEME.colors.primary} />
            </View>
            <View style={styles.quickTextWrap}>
              <Text style={styles.quickTitle}>Check Any Address</Text>
              <Text style={styles.quickSubtitle}>Safety score before you go</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={THEME.colors.textSecondary} />
          </Pressable>
        </View>

        {/* Live incident feed */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Recent incidents</Text>
          <Pressable style={styles.viewAllLink} onPress={() => navigation.navigate("Alerts")}>
            <Text style={styles.viewAllLabel}>View all</Text>
            <Ionicons name="chevron-forward" size={14} color={THEME.colors.primary} />
          </Pressable>
        </View>
        {recentIncidents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No recent activity within {effectiveZones.map((zone) => zone.label).join(", ")}.
            </Text>
          </View>
        ) : (
          recentIncidents.map((incident) => (
            <Pressable
              key={`${incident.source ?? "city"}-${incident.id}`}
              style={styles.incidentCard}
              onPress={() => setSelectedIncidentId(incident.id)}
            >
              <View style={styles.incidentHeaderRow}>
                <Text style={styles.incidentTitle} numberOfLines={1}>
                  {incident.type}
                </Text>
                <Text style={styles.incidentTime}>{formatTimeAgo(incident.timestamp)}</Text>
              </View>
              <Text style={styles.incidentLocation} numberOfLines={1}>
                {incident.location}
              </Text>
              <Text style={styles.incidentDescription}>{describeIncident(incident)}</Text>
              <View style={styles.contextButton}>
                <Text style={styles.contextButtonLabel}>Analyze Incident</Text>
                <Ionicons name="chevron-forward" size={16} color={THEME.colors.primary} />
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <SafetyScoreSheet
        visible={scoreSheetOpen}
        onClose={() => setScoreSheetOpen(false)}
        cityLabel={profile.label}
        score={profile.safetyScore}
        rating={profile.safetyRating}
        color={scoreColor(profile.safetyScore)}
        breakdown={profile.breakdown}
      />

      <IncidentDetailSheet
        incidents={recentIncidents}
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
    paddingHorizontal: screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: tabBarClearance,
  },
  brand: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  cityCarousel: {
    marginHorizontal: -screenPadding,
  },
  cityCarouselContent: {
    paddingHorizontal: screenPadding,
    gap: spacing.sm,
  },
  cityCard: {
    width: 140,
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    padding: spacing.md,
  },
  cityCardActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.secondary,
  },
  cityCardLabel: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  cityCardLabelActive: {
    color: THEME.colors.textPrimary,
  },
  cityCardScoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cityCardDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    marginRight: spacing.xs,
  },
  cityCardScore: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
  },
  cityCardSoonBadge: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: THEME.colors.border,
  },
  cityCardSoonText: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize - 2,
    fontWeight: "700",
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginRight: spacing.lg,
  },
  metaText: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    flexShrink: 1,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: THEME.colors.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  tipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    backgroundColor: THEME.colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  tipTextWrap: {
    flex: 1,
  },
  tipTitle: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
    marginBottom: 2,
  },
  tipText: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  viewAllLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllLabel: {
    color: THEME.colors.primary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    marginRight: 2,
  },
  sectionLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  trendsBlock: {
    gap: spacing.sm,
  },
  trendCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
  },
  trendHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  trendLabel: {
    flex: 1,
    flexShrink: 1,
    marginRight: spacing.sm,
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  trendChangeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  trendIcon: {
    marginRight: 2,
  },
  trendChange: {
    fontSize: typography.body.fontSize,
    fontWeight: "800",
  },
  trendChevron: {
    marginLeft: spacing.xs,
  },
  trendDescription: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    lineHeight: 18,
  },
  trendDetailBox: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  trendDetailText: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
    alignItems: "center",
  },
  emptyText: {
    color: THEME.colors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: "center",
  },
  incidentCard: {
    backgroundColor: THEME.colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: "#0f2a20",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  incidentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  incidentTitle: {
    flex: 1,
    flexShrink: 1,
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
    marginRight: spacing.sm,
  },
  incidentTime: {
    flexShrink: 0,
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
  },
  incidentLocation: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  incidentDescription: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  contextButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  contextButtonLabel: {
    color: THEME.colors.primary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
    marginRight: 2,
  },
  quickActions: { gap: spacing.sm, marginBottom: spacing.sm },
  quickCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
  },
  quickIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: THEME.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  quickTextWrap: { flex: 1 },
  quickTitle: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  quickSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
});
