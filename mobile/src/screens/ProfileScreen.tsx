import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert as RNAlert, Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput } from "../components/MonoText";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../components/AppHeader";
import { SettingsRow } from "../components/SettingsRow";
import { fetchAirQuality, fetchCrimeIncidents, fetchIncidents } from "../api/client";
import { Incident } from "../types";
import { distanceKm } from "../utils/geo";
import { getEmergencyContact, setEmergencyContact as saveEmergencyContact, EmergencyContact } from "../utils/emergencyContact";
import { getProStatus } from "../utils/proStatus";
import { computeSafetyIndex } from "../utils/safetyIndex";
import { DEFAULT_RADIUS_KM, getWatchedZones, WatchedZone } from "../utils/savedLocation";
import { radius, spacing, tabBarClearance, typography } from "../theme";
import { THEME } from "../theme/theme";

const EDMONTON_CENTER = { lat: 53.5461, lng: -113.4938 };

const WALK_DURATIONS = [
  { label: "Test (1s)", ms: 1 * 1000 },
  { label: "15 min", ms: 15 * 60 * 1000 },
  { label: "30 min", ms: 30 * 60 * 1000 },
  { label: "60 min", ms: 60 * 60 * 1000 },
];

function aqhiColor(category: string): string {
  if (category === "Low Risk") return THEME.colors.primary;
  if (category === "Moderate Risk") return THEME.colors.warning;
  return THEME.colors.danger;
}

function scoreColor(score: number): string {
  if (score >= 75) return THEME.colors.primary;
  if (score >= 50) return THEME.colors.warning;
  return THEME.colors.danger;
}

function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

export function ProfileScreen() {
  const navigation = useNavigation<any>();

  // Remote data
  const [isPro, setIsPro] = useState(false);
  const [zones, setZones] = useState<WatchedZone[]>([]);
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [airQualityData, setAirQualityData] = useState<
    { city: string; aqhi: number | null; category: string }[]
  >([]);

  // Safe Walk
  const [walkDurationMs, setWalkDurationMs] = useState(WALK_DURATIONS[0].ms);
  const [walkEndsAt, setWalkEndsAt] = useState<number | null>(null);
  const [walkRemaining, setWalkRemaining] = useState(0);
  const walkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Emergency contact
  const [contact, setContact] = useState<EmergencyContact | null>(null);
  const [editingContact, setEditingContact] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useFocusEffect(
    useCallback(() => {
      getProStatus().then(setIsPro);
      getWatchedZones().then(setZones);
      getEmergencyContact().then(setContact);
      Promise.allSettled([fetchIncidents(), fetchCrimeIncidents(), fetchAirQuality()]).then(
        ([incR, crimeR, aqR]) => {
          const inc = incR.status === "fulfilled" ? incR.value : [];
          const crime = crimeR.status === "fulfilled" ? crimeR.value : [];
          const aq = aqR.status === "fulfilled" ? aqR.value : [];
          setAllIncidents([...inc, ...crime]);
          setAirQualityData(aq as { city: string; aqhi: number | null; category: string }[]);
        }
      );
    }, [])
  );

  // Safe Walk countdown
  useEffect(() => {
    if (walkEndsAt === null) {
      if (walkIntervalRef.current) {
        clearInterval(walkIntervalRef.current);
        walkIntervalRef.current = null;
      }
      setWalkRemaining(0);
      return;
    }

    const tick = () => {
      const remaining = walkEndsAt - Date.now();
      if (remaining <= 0) {
        if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
        setWalkEndsAt(null);
        RNAlert.alert(
          "Safe Walk ended",
          "Time's up — are you still safe?",
          [
            { text: "✅ I'm Safe", style: "default" },
            ...(contact
              ? [{ text: `📞 Call ${contact.name}`, onPress: () => Linking.openURL(`tel:${contact.phone}`) }]
              : []),
            { text: "🆘 Call 911", style: "destructive", onPress: () => Linking.openURL("tel:911") },
          ]
        );
      } else {
        setWalkRemaining(remaining);
      }
    };

    tick();
    walkIntervalRef.current = setInterval(tick, 1000);
    return () => {
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
    };
  }, [walkEndsAt, contact]);

  const startWalk = () => setWalkEndsAt(Date.now() + walkDurationMs);
  const stopWalk = () => {
    setWalkEndsAt(null);
    setWalkRemaining(0);
  };

  const openEditContact = () => {
    setEditName(contact?.name ?? "");
    setEditPhone(contact?.phone ?? "");
    setEditingContact(true);
  };

  const handleSaveContact = async () => {
    const name = editName.trim();
    const phone = editPhone.trim();
    if (!name || !phone) return;
    const c: EmergencyContact = { name, phone };
    await saveEmergencyContact(c);
    setContact(c);
    setEditingContact(false);
  };

  // Derived stats
  const primaryZone = zones[0] ?? null;
  const center = primaryZone ? { lat: primaryZone.lat, lng: primaryZone.lng } : EDMONTON_CENTER;
  const radiusKm = primaryZone?.radiusKm ?? DEFAULT_RADIUS_KM;

  const todayCount = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return allIncidents.filter((i) => {
      if (i.lat === null || i.lng === null) return false;
      if (new Date(i.timestamp).getTime() < cutoff) return false;
      return distanceKm(center, { lat: i.lat as number, lng: i.lng as number }) <= radiusKm;
    }).length;
  }, [allIncidents, center, radiusKm]);

  const safetyIndex = useMemo(
    () => (allIncidents.length > 0 ? computeSafetyIndex(center, 2, allIncidents) : null),
    [allIncidents, center]
  );

  const cityAQ = airQualityData.find((a) => a.city === "Edmonton") ?? null;
  const walkActive = walkEndsAt !== null;

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <AppHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroAvatar}>
              <Ionicons name="person" size={30} color={THEME.colors.primary} />
            </View>
            <View style={styles.heroMeta}>
              <Text style={styles.heroName} numberOfLines={1}>
                {primaryZone?.label ?? "Edmonton, AB"}
              </Text>
              <View style={[styles.heroBadge, isPro ? styles.heroBadgePro : styles.heroBadgeFree]}>
                {isPro && (
                  <Ionicons
                    name="checkmark-circle"
                    size={11}
                    color={THEME.colors.conversion}
                    style={{ marginRight: 3 }}
                  />
                )}
                <Text
                  style={[
                    styles.heroBadgeText,
                    isPro ? styles.heroBadgeTextPro : styles.heroBadgeTextFree,
                  ]}
                >
                  {isPro ? "Nearby Pro" : "Free plan"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{zones.length}</Text>
              <Text style={styles.statLabel}>Zones</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statCell}>
              <Text style={[styles.statValue, todayCount > 0 && { color: THEME.colors.danger }]}>
                {todayCount}
              </Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statCell}>
              <Text
                style={[
                  styles.statValue,
                  cityAQ ? { color: aqhiColor(cityAQ.category) } : {},
                ]}
              >
                {cityAQ?.aqhi != null ? String(cityAQ.aqhi) : "—"}
              </Text>
              <Text style={styles.statLabel}>AQHI</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statCell}>
              <Text
                style={[
                  styles.statValue,
                  safetyIndex ? { color: scoreColor(safetyIndex.score) } : {},
                ]}
              >
                {safetyIndex ? String(safetyIndex.score) : "—"}
              </Text>
              <Text style={styles.statLabel}>Safety</Text>
            </View>
          </View>
        </View>

        {/* ── Safe Walk ── */}
        <Text style={styles.sectionLabel}>Safe Walk</Text>
        <View style={styles.card}>
          {walkActive ? (
            <View style={styles.walkActiveWrap}>
              <Ionicons name="walk" size={32} color={THEME.colors.primary} />
              <Text style={styles.walkTimerLabel}>Time remaining</Text>
              <Text style={styles.walkTimer}>{formatCountdown(walkRemaining)}</Text>
              <Pressable style={styles.walkSafeBtn} onPress={stopWalk}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={THEME.colors.textOnPrimary}
                  style={{ marginRight: spacing.sm }}
                />
                <Text style={styles.walkSafeBtnLabel}>I'm Safe — End Walk</Text>
              </Pressable>
              <Pressable onPress={stopWalk} style={styles.walkCancelLink}>
                <Text style={styles.walkCancelLinkLabel}>Cancel walk</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <View style={styles.walkIdleHeader}>
                <View style={styles.walkIdleIcon}>
                  <Ionicons name="walk" size={20} color={THEME.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.walkIdleTitle}>Safe Walk</Text>
                  <Text style={styles.walkIdleDesc}>
                    Start a timer. If you don't check in on time, you'll be prompted to call for
                    help.
                  </Text>
                </View>
              </View>
              <View style={styles.durationRow}>
                {WALK_DURATIONS.map((d) => (
                  <Pressable
                    key={d.ms}
                    style={[styles.durationChip, walkDurationMs === d.ms && styles.durationChipActive]}
                    onPress={() => setWalkDurationMs(d.ms)}
                  >
                    <Text
                      style={[
                        styles.durationLabel,
                        walkDurationMs === d.ms && styles.durationLabelActive,
                      ]}
                    >
                      {d.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable style={styles.walkStartBtn} onPress={startWalk}>
                <Ionicons
                  name="walk"
                  size={16}
                  color={THEME.colors.textOnPrimary}
                  style={{ marginRight: spacing.xs }}
                />
                <Text style={styles.walkStartBtnLabel}>Start Safe Walk</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* ── Emergency Contact ── */}
        <Text style={styles.sectionLabel}>Emergency Contact</Text>
        <View style={styles.card}>
          {editingContact ? (
            <View>
              <TextInput
                style={styles.contactInput}
                placeholder="Full name"
                placeholderTextColor={THEME.colors.textSecondary}
                value={editName}
                onChangeText={setEditName}
                returnKeyType="next"
              />
              <TextInput
                style={[styles.contactInput, { marginTop: spacing.sm }]}
                placeholder="+1 780 000 0000"
                placeholderTextColor={THEME.colors.textSecondary}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                returnKeyType="done"
              />
              <View style={styles.contactEditBtns}>
                <Pressable style={styles.contactSaveBtn} onPress={handleSaveContact}>
                  <Text style={styles.contactSaveBtnLabel}>Save</Text>
                </Pressable>
                <Pressable
                  style={styles.contactCancelBtn}
                  onPress={() => setEditingContact(false)}
                >
                  <Text style={styles.contactCancelBtnLabel}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : contact ? (
            <View style={styles.contactRow}>
              <View style={styles.contactIconBg}>
                <Ionicons name="call" size={16} color={THEME.colors.primary} />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <Pressable
                style={styles.contactCallBtn}
                onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                hitSlop={8}
              >
                <Ionicons name="call-outline" size={18} color={THEME.colors.primary} />
              </Pressable>
              <Pressable onPress={openEditContact} hitSlop={8} style={styles.contactEditBtn}>
                <Ionicons name="pencil-outline" size={18} color={THEME.colors.textSecondary} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.contactEmpty} onPress={openEditContact}>
              <View style={styles.contactIconBg}>
                <Ionicons name="person-add-outline" size={16} color={THEME.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactEmptyTitle}>Add Emergency Contact</Text>
                <Text style={styles.contactEmptyDesc}>Someone to call if Safe Walk expires</Text>
              </View>
              <Ionicons name="add-circle-outline" size={22} color={THEME.colors.primary} />
            </Pressable>
          )}
        </View>

        {/* ── Pro card ── */}
        <Pressable onPress={() => navigation.navigate("Subscription")} style={styles.proCard}>
          <View style={styles.proIconWrap}>
            <Ionicons
              name={isPro ? "checkmark-circle" : "shield-checkmark"}
              size={22}
              color={THEME.colors.conversion}
            />
          </View>
          <View style={styles.proTextWrap}>
            <Text style={styles.proTitle}>
              {isPro ? "Nearby Pro active" : "Upgrade to Nearby Pro"}
            </Text>
            <Text style={styles.proSubtitle}>
              {isPro
                ? "Unlimited areas, instant alerts & more"
                : "Unlock trends, safety index & school zone alerts"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={THEME.colors.textSecondary} />
        </Pressable>

        {/* ── Explore ── */}
        <Text style={styles.sectionLabel}>Explore</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="bar-chart-outline"
            label="Neighbourhood Trends"
            description="30-day crime & activity chart"
            showChevron
            onPress={() => navigation.navigate("Trends")}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Check Any Address"
            description="Live safety score for any location"
            showChevron
            onPress={() => navigation.navigate("AddressCheck")}
          />
        </View>

        {/* ── Preferences ── */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="settings-outline"
            label="Settings"
            description="Notifications, map style, units"
            showChevron
            onPress={() => navigation.navigate("Settings")}
          />
          <SettingsRow
            icon="location-outline"
            label="Saved Areas"
            description={
              zones.length === 0
                ? "No watch zones yet"
                : `${zones.length} watched area${zones.length === 1 ? "" : "s"}`
            }
            showChevron
            onPress={() => navigation.navigate("Map")}
          />
          <SettingsRow
            icon="time-outline"
            label="Alert History"
            description="Past alerts in your area"
            showChevron
          />
        </View>

        {/* ── About ── */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="information-circle-outline"
            label="About Nearby"
            description="Version 1.0.0"
            showChevron
          />
          <SettingsRow icon="help-circle-outline" label="Help & Support" showChevron />
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: tabBarClearance,
  },

  // ── Hero ──
  heroCard: {
    backgroundColor: THEME.colors.secondary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: THEME.colors.background,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  heroMeta: {
    flex: 1,
  },
  heroName: {
    color: THEME.colors.textPrimary,
    fontSize: typography.subheading.fontSize,
    fontWeight: typography.subheading.fontWeight,
    marginBottom: spacing.xs,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  heroBadgePro: {
    backgroundColor: "rgba(255,184,0,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,184,0,0.45)",
  },
  heroBadgeFree: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  heroBadgeTextPro: {
    color: THEME.colors.conversion,
  },
  heroBadgeTextFree: {
    color: THEME.colors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: THEME.colors.background,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  statCell: {
    flex: 1,
    alignItems: "center",
  },
  statSep: {
    width: 1,
    backgroundColor: THEME.colors.border,
  },
  statValue: {
    color: THEME.colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: "700",
    lineHeight: 26,
  },
  statLabel: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },

  // ── Section label ──
  sectionLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },

  // ── Generic card ──
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },

  // ── Safe Walk active ──
  walkActiveWrap: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  walkTimerLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: spacing.sm,
  },
  walkTimer: {
    color: THEME.colors.textPrimary,
    fontSize: 52,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  walkSafeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  walkSafeBtnLabel: {
    color: THEME.colors.textOnPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  walkCancelLink: {
    padding: spacing.xs,
  },
  walkCancelLinkLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    textDecorationLine: "underline",
  },

  // ── Safe Walk idle ──
  walkIdleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  walkIdleIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: THEME.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  walkIdleTitle: {
    color: THEME.colors.textPrimary,
    fontSize: typography.subheading.fontSize,
    fontWeight: typography.subheading.fontWeight,
    marginBottom: 2,
  },
  walkIdleDesc: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    lineHeight: 17,
  },
  durationRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  durationChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
  },
  durationChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.secondary,
  },
  durationLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "600",
  },
  durationLabelActive: {
    color: THEME.colors.primary,
  },
  walkStartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  walkStartBtnLabel: {
    color: THEME.colors.textOnPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },

  // ── Emergency contact ──
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactIconBg: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: THEME.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
  },
  contactPhone: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: 1,
  },
  contactCallBtn: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  contactEditBtn: {
    padding: spacing.xs,
  },
  contactEmpty: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactEmptyTitle: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
  },
  contactEmptyDesc: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: 1,
  },
  contactInput: {
    backgroundColor: THEME.colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
  },
  contactEditBtns: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  contactSaveBtn: {
    flex: 1,
    alignItems: "center",
    backgroundColor: THEME.colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  contactSaveBtnLabel: {
    color: THEME.colors.textOnPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  contactCancelBtn: {
    flex: 1,
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: spacing.sm,
  },
  contactCancelBtnLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
  },

  // ── Pro card ──
  proCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  proIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: THEME.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  proTextWrap: {
    flex: 1,
  },
  proTitle: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  proSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },

  // ── Row sections ──
  section: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
});
