import React, { useCallback, useState } from "react";
import { Alert as RNAlert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProStatus, setProStatus } from "../utils/proStatus";
import { radius, spacing, tabBarClearance, typography } from "../theme";
import { THEME } from "../theme/theme";

interface PlanFeature {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const FEATURES: PlanFeature[] = [
  { icon: "infinite", label: "Unlimited watched areas (home, work, family)" },
  { icon: "flash", label: "Priority real-time alerts" },
  { icon: "shield-checkmark", label: "NearBy Safety Index for any address" },
  { icon: "leaf", label: "Air quality & weather alerts for your areas" },
  { icon: "time", label: "Full incident history & search" },
  { icon: "map", label: "All map skins" },
  { icon: "ban", label: "No ads" },
];

type PlanId = "monthly" | "yearly";

export function SubscriptionScreen() {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<PlanId>("yearly");
  const [isPro, setIsPro] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getProStatus().then(setIsPro);
    }, [])
  );

  const handleSubscribe = async () => {
    await setProStatus(true);
    setIsPro(true);
    RNAlert.alert(
      "Welcome to Nearby Pro",
      "Unlimited watch areas, the NearBy Safety Index, air quality alerts, and priority push are now unlocked."
    );
  };

  const handleManage = () => {
    RNAlert.alert("Manage subscription", "Turn off this preview of Nearby Pro?", [
      { text: "Keep Pro", style: "cancel" },
      {
        text: "Turn off",
        style: "destructive",
        onPress: async () => {
          await setProStatus(false);
          setIsPro(false);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={THEME.colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Nearby Pro</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="shield-checkmark" size={32} color={THEME.colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Stay ahead of what's nearby</Text>
        <Text style={styles.heroSubtitle}>Unlimited areas, instant alerts, and more.</Text>

        <View style={styles.plans}>
          <Pressable
            style={[styles.planCard, selected === "yearly" && styles.planCardActive]}
            onPress={() => setSelected("yearly")}
          >
            <Ionicons
              name={selected === "yearly" ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={selected === "yearly" ? THEME.colors.primary : THEME.colors.textSecondary}
            />
            <View style={styles.planTextWrap}>
              <Text style={styles.planLabel}>Annual</Text>
              <Text style={styles.planPeriod}>$49.99 / year</Text>
            </View>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsBadgeText}>Save $34/yr</Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.planCard, selected === "monthly" && styles.planCardActive]}
            onPress={() => setSelected("monthly")}
          >
            <Ionicons
              name={selected === "monthly" ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={selected === "monthly" ? THEME.colors.primary : THEME.colors.textSecondary}
            />
            <View style={styles.planTextWrap}>
              <Text style={styles.planLabel}>Monthly</Text>
              <Text style={styles.planPeriod}>$6.99 / month</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          {FEATURES.map((feature) => (
            <View key={feature.label} style={styles.featureRow}>
              <Ionicons name={feature.icon} size={18} color={THEME.colors.primary} style={styles.featureIcon} />
              <Text style={styles.featureLabel}>{feature.label}</Text>
            </View>
          ))}
        </View>

        {isPro ? (
          <>
            <View style={[styles.subscribeButton, styles.subscribeButtonActive]}>
              <Ionicons name="checkmark-circle" size={18} color={THEME.colors.primary} style={styles.activeIcon} />
              <Text style={[styles.subscribeLabel, styles.subscribeLabelActive]}>You're on Nearby Pro</Text>
            </View>
            <Pressable onPress={handleManage}>
              <Text style={styles.manageLink}>Manage subscription</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={styles.subscribeButton} onPress={handleSubscribe}>
              <Text style={styles.subscribeLabel}>
                {selected === "yearly" ? "Start Pro — $49.99/yr" : "Start Pro — $6.99/mo"}
              </Text>
            </Pressable>
            <Text style={styles.disclaimer}>
              This is a preview of Nearby Pro. No real payment will be charged yet.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: THEME.colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: tabBarClearance,
    alignItems: "center",
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: THEME.colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: THEME.colors.textPrimary,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    textAlign: "center",
  },
  heroSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  plans: {
    width: "100%",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
  },
  planCardActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.secondary,
  },
  planTextWrap: {
    flex: 1,
    marginLeft: spacing.md,
  },
  planLabel: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  planPeriod: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  savingsBadge: {
    backgroundColor: THEME.colors.secondary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  savingsBadgeText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  section: {
    width: "100%",
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    marginRight: spacing.sm,
  },
  featureLabel: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
  },
  subscribeButton: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: THEME.colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeButtonActive: {
    backgroundColor: THEME.colors.secondary,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
  },
  activeIcon: {
    marginRight: spacing.xs,
  },
  subscribeLabel: {
    color: THEME.colors.textOnPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  subscribeLabelActive: {
    color: THEME.colors.primary,
  },
  manageLink: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textAlign: "center",
    marginTop: spacing.md,
  },
  disclaimer: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
