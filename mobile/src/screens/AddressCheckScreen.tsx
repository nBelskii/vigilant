import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert as RNAlert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text, TextInput } from "../components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchCrimeIncidents, fetchGeocode, fetchIncidents } from "../api/client";
import { computeSafetyIndex } from "../utils/safetyIndex";
import { getProStatus } from "../utils/proStatus";
import { FadeSlideIn } from "../components/FadeSlideIn";
import { radius, spacing, typography } from "../theme";
import { THEME } from "../theme/theme";

interface CheckResult {
  address: string;
  lat: number;
  lng: number;
  score: number;
  rating: string;
  breakdown: { label: string; score: number; detail: string }[];
}

function scoreColor(score: number): string {
  if (score >= 75) return THEME.colors.primary;
  if (score >= 55) return THEME.colors.warning;
  return THEME.colors.danger;
}

function scoreEmoji(score: number): string {
  if (score >= 80) return "✅";
  if (score >= 65) return "🟡";
  if (score >= 45) return "🟠";
  return "🔴";
}

export function AddressCheckScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [isPro, setIsPro] = useState(false);

  const handleCheck = useCallback(async () => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setResult(null);

    try {
      const [coords, incidents, crime, proStatus] = await Promise.all([
        fetchGeocode(q),
        fetchIncidents(),
        fetchCrimeIncidents(),
        getProStatus(),
      ]);

      setIsPro(proStatus);

      if (!coords) {
        RNAlert.alert("Address not found", "Try a more specific address or landmark in Edmonton.");
        return;
      }

      const all = [...incidents, ...crime];
      const { score, rating, breakdown } = computeSafetyIndex({ lat: coords.lat, lng: coords.lng }, 2, all);

      setResult({ address: q, lat: coords.lat, lng: coords.lng, score, rating, breakdown });
    } catch (err) {
      RNAlert.alert("Error", "Could not check this address. Try again later.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const color = result ? scoreColor(result.score) : THEME.colors.primary;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={THEME.colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Address Safety Check</Text>
        <View style={styles.backButton} />
      </View>

      <FadeSlideIn style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>
          Enter any Edmonton address to get a live safety score based on nearby incidents.
        </Text>

        <View style={styles.searchRow}>
          <View style={styles.inputWrap}>
            <Ionicons name="search-outline" size={18} color={THEME.colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 124 Street & 109 Avenue"
              placeholderTextColor={THEME.colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={handleCheck}
              autoCapitalize="words"
            />
            {query.length > 0 && (
              <Pressable onPress={() => { setQuery(""); setResult(null); }} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={THEME.colors.textSecondary} />
              </Pressable>
            )}
          </View>
          <Pressable
            style={[styles.checkButton, (!query.trim() || loading) && styles.checkButtonDisabled]}
            onPress={handleCheck}
            disabled={!query.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={THEME.colors.textOnPrimary} />
            ) : (
              <Text style={styles.checkButtonLabel}>Check</Text>
            )}
          </Pressable>
        </View>

        {result && (
          <>
            {/* Score card */}
            <View style={[styles.scoreCard, { borderColor: color }]}>
              <View style={styles.scoreHeaderRow}>
                <Text style={styles.scoreEmoji}>{scoreEmoji(result.score)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scoreAddress} numberOfLines={2}>{result.address}</Text>
                  <Text style={[styles.scoreRating, { color }]}>{result.rating}</Text>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: color }]}>
                  <Text style={styles.scoreBadgeText}>{result.score}</Text>
                  <Text style={styles.scoreBadgeSub}>/100</Text>
                </View>
              </View>
              <Text style={styles.scoreNote}>Based on incidents within 2 km over the last 5 days</Text>
            </View>

            {/* Breakdown */}
            <Text style={styles.sectionTitle}>Safety Breakdown</Text>
            {result.breakdown.map((item) => (
              <View key={item.label} style={styles.breakdownCard}>
                <View style={styles.breakdownHeaderRow}>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                  <Text style={[styles.breakdownScore, { color: scoreColor(item.score) }]}>
                    {item.score}/100
                  </Text>
                </View>
                {isPro ? (
                  <>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${item.score}%`, backgroundColor: scoreColor(item.score) },
                        ]}
                      />
                    </View>
                    <Text style={styles.breakdownDetail}>{item.detail}</Text>
                  </>
                ) : (
                  <View style={styles.proGate}>
                    <Ionicons name="lock-closed" size={14} color={THEME.colors.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.proGateText}>Full breakdown — </Text>
                    <Pressable onPress={() => navigation.navigate("Profile", { screen: "Subscription" })}>
                      <Text style={styles.proGateLink}>Upgrade to Pro</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))}

            <Pressable
              style={styles.mapButton}
              onPress={() =>
                navigation.navigate("Map", {
                  focusLat: result.lat,
                  focusLng: result.lng,
                  focusTs: Date.now(),
                })
              }
            >
              <Ionicons name="map-outline" size={16} color={THEME.colors.textOnPrimary} style={{ marginRight: spacing.xs }} />
              <Text style={styles.mapButtonLabel}>View on Map</Text>
            </Pressable>
          </>
        )}

        {!result && !loading && (
          <View style={styles.examples}>
            <Text style={styles.examplesTitle}>Try an example</Text>
            {[
              "Whyte Avenue, Edmonton",
              "Jasper Avenue & 100 Street",
              "West Edmonton Mall",
              "University of Alberta",
            ].map((example) => (
              <Pressable
                key={example}
                style={styles.exampleChip}
                onPress={() => { setQuery(example); }}
              >
                <Ionicons name="location-outline" size={14} color={THEME.colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.exampleText}>{example}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      </FadeSlideIn>
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  subtitle: {
    color: THEME.colors.textSecondary,
    fontSize: typography.body.fontSize,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  searchRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputIcon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
  },
  checkButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
  },
  checkButtonDisabled: { opacity: 0.5 },
  checkButtonLabel: {
    color: THEME.colors.textOnPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  scoreCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.xl,
    borderWidth: 2,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  scoreHeaderRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm },
  scoreEmoji: { fontSize: 28 },
  scoreAddress: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  scoreRating: { fontSize: typography.caption.fontSize, fontWeight: "700", marginTop: 2 },
  scoreBadge: {
    borderRadius: radius.lg,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreBadgeText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  scoreBadgeSub: { color: "#ffffffcc", fontSize: 10 },
  scoreNote: { color: THEME.colors.textSecondary, fontSize: typography.caption.fontSize },
  sectionTitle: {
    color: THEME.colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    marginBottom: spacing.sm,
  },
  breakdownCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  breakdownHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  breakdownLabel: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  breakdownScore: { fontSize: typography.body.fontSize, fontWeight: "800" },
  progressBar: {
    height: 6,
    backgroundColor: THEME.colors.border,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: radius.full },
  breakdownDetail: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    lineHeight: 18,
  },
  proGate: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.secondary,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  proGateText: { color: THEME.colors.textSecondary, fontSize: typography.caption.fontSize },
  proGateLink: { color: THEME.colors.primary, fontSize: typography.caption.fontSize, fontWeight: "700" },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  mapButtonLabel: { color: THEME.colors.textOnPrimary, fontSize: typography.body.fontSize, fontWeight: "700" },
  examples: { marginTop: spacing.md },
  examplesTitle: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  exampleChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  exampleText: { color: THEME.colors.textPrimary, fontSize: typography.body.fontSize },
});
