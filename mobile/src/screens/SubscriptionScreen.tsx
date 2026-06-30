import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert as RNAlert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "../components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PurchasesPackage } from "react-native-purchases";
import { getAvailablePackages, purchasePackage, restorePurchases } from "../utils/purchasesService";
import { getProStatus, setProStatus } from "../utils/proStatus";
import { FadeSlideIn } from "../components/FadeSlideIn";
import { radius, spacing, typography } from "../theme";
import { THEME } from "../theme/theme";

interface PlanFeature {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const FEATURES: PlanFeature[] = [
  { icon: "infinite", label: "Unlimited watched areas" },
  { icon: "flash", label: "Priority real-time alerts" },
  { icon: "shield-checkmark", label: "Safety Index for any address" },
  { icon: "leaf", label: "Air quality & weather alerts" },
  { icon: "time", label: "Full incident history & search" },
  { icon: "map", label: "All map skins" },
  { icon: "ban", label: "No ads" },
];

// Stable fallback prices shown when RevenueCat packages haven't loaded yet.
const FALLBACK_PLANS = [
  { id: "yearly", label: "Annual", price: "$49.99", period: "/ year", savings: "Save 40%" },
  { id: "monthly", label: "Monthly", price: "$6.99", period: "/ month", savings: null },
];

export function SubscriptionScreen() {
  const navigation = useNavigation<any>();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
  const [selectedFallback, setSelectedFallback] = useState<string>("yearly");
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getProStatus().then(setIsPro);
      getAvailablePackages().then((pkgs) => {
        setPackages(pkgs);
        // Default to the annual package if available
        const annual = pkgs.find((p) => p.packageType === "ANNUAL" || p.identifier.includes("annual"));
        setSelectedPkg(annual ?? pkgs[0] ?? null);
      });
    }, [])
  );

  const handleSubscribe = async () => {
    if (loading) return;

    // Real purchase via RevenueCat
    if (selectedPkg) {
      setLoading(true);
      try {
        const granted = await purchasePackage(selectedPkg);
        if (granted) {
          setIsPro(true);
          RNAlert.alert(
            "Welcome to Nearby Pro",
            "Unlimited watch areas, the NearBy Safety Index, air quality alerts, and priority push are now unlocked."
          );
        }
      } catch (e: any) {
        if (!e?.userCancelled) {
          RNAlert.alert("Purchase failed", e?.message ?? "Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Dev preview fallback (no RevenueCat keys configured)
    await setProStatus(true);
    setIsPro(true);
    RNAlert.alert(
      "Preview mode",
      "No RevenueCat keys detected — Pro unlocked locally for testing only."
    );
  };

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const granted = await restorePurchases();
      if (granted) {
        setIsPro(true);
        RNAlert.alert("Restored", "Your Nearby Pro subscription has been restored.");
      } else {
        RNAlert.alert("Nothing to restore", "No active Pro subscription found for this Apple ID.");
      }
    } catch (e: any) {
      RNAlert.alert("Restore failed", e?.message ?? "Something went wrong.");
    } finally {
      setRestoring(false);
    }
  };

  const handleManage = () => {
    RNAlert.alert("Manage subscription", "Manage or cancel your subscription in the App Store.", [
      { text: "OK" },
    ]);
  };

  // Build display list: use real packages if available, else fallback UI
  const usingRealPackages = packages.length > 0;

  const isAnnual = (pkg: PurchasesPackage) => pkg.packageType === "ANNUAL" || pkg.identifier.includes("annual");

  const priceParts = (pkg: PurchasesPackage): { price: string; period: string } => ({
    price: pkg.product.priceString,
    period: isAnnual(pkg) ? "/ year" : "/ month",
  });

  type DisplayPlan = { key: string; label: string; price: string; period: string; savings: string | null; selected: boolean; onSelect: () => void };

  const displayPlans: DisplayPlan[] = usingRealPackages
    ? packages.map((pkg) => {
        const { price, period } = priceParts(pkg);
        return {
          key: pkg.identifier,
          label: pkg.product.title || pkg.identifier,
          price,
          period,
          savings: isAnnual(pkg) ? "Best value" : null,
          selected: selectedPkg?.identifier === pkg.identifier,
          onSelect: () => setSelectedPkg(pkg),
        };
      })
    : FALLBACK_PLANS.map((plan) => ({
        key: plan.id,
        label: plan.label,
        price: plan.price,
        period: plan.period,
        savings: plan.savings,
        selected: selectedFallback === plan.id,
        onSelect: () => setSelectedFallback(plan.id),
      }));

  const subscribeLabel = usingRealPackages
    ? `Start Pro — ${selectedPkg ? priceParts(selectedPkg).price + " " + priceParts(selectedPkg).period : ""}`
    : selectedFallback === "yearly"
    ? "Start Pro — $49.99/yr"
    : "Start Pro — $6.99/mo";

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={THEME.colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Nearby Pro</Text>
        <View style={styles.backButton} />
      </View>

      <FadeSlideIn style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heroTitle}>Stay ahead of what's nearby</Text>
        <Text style={styles.heroSubtitle}>Unlimited areas, instant alerts, and more.</Text>

        {/* Plan cards — each a full pricing card, the best-value plan featured */}
        <View style={styles.plans}>
          {displayPlans.map((plan) => {
            const featured = plan.savings !== null;
            return (
              <Pressable
                key={plan.key}
                style={[styles.planCard, featured && styles.planCardFeatured, plan.selected && !featured && styles.planCardSelected]}
                onPress={plan.onSelect}
              >
                {featured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>{plan.savings}</Text>
                  </View>
                )}
                <View style={styles.planHeaderRow}>
                  <Text style={[styles.planLabel, featured && styles.planLabelFeatured]}>{plan.label}</Text>
                  <Ionicons
                    name={plan.selected ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={featured ? THEME.colors.conversion : plan.selected ? THEME.colors.primary : THEME.colors.textSecondary}
                  />
                </View>
                <View style={styles.priceRow}>
                  <Text style={[styles.planPrice, featured && styles.planPriceFeatured]}>{plan.price}</Text>
                  <Text style={[styles.planPeriod, featured && styles.planPeriodFeatured]}>{plan.period}</Text>
                </View>

                <View style={[styles.planDivider, featured && styles.planDividerFeatured]} />

                {FEATURES.map((feature) => (
                  <View key={feature.label} style={styles.checklistRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color={featured ? THEME.colors.conversion : THEME.colors.primary}
                      style={styles.checklistIcon}
                    />
                    <Text style={[styles.checklistLabel, featured && styles.checklistLabelFeatured]}>{feature.label}</Text>
                  </View>
                ))}
              </Pressable>
            );
          })}
        </View>

        {isPro ? (
          <>
            <View style={[styles.subscribeButton, styles.subscribeButtonActive]}>
              <Ionicons name="checkmark-circle" size={18} color={THEME.colors.conversion} style={styles.activeIcon} />
              <Text style={[styles.subscribeLabel, styles.subscribeLabelActive]}>You're on Nearby Pro</Text>
            </View>
            <Pressable onPress={handleManage}>
              <Text style={styles.secondaryLink}>Manage subscription</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]} onPress={handleSubscribe}>
              {loading ? (
                <ActivityIndicator color={THEME.colors.textOnPrimary} />
              ) : (
                <Text style={styles.subscribeLabel}>{subscribeLabel}</Text>
              )}
            </Pressable>

            <Pressable onPress={handleRestore} disabled={restoring} style={styles.restoreWrap}>
              {restoring ? (
                <ActivityIndicator size="small" color={THEME.colors.textSecondary} />
              ) : (
                <Text style={styles.secondaryLink}>Restore purchases</Text>
              )}
            </Pressable>

            <Text style={styles.disclaimer}>
              {usingRealPackages
                ? "Payment charged to your Apple ID. Cancel anytime in the App Store."
                : "No RevenueCat keys — running in preview mode. No real payment charged."}
            </Text>
          </>
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
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, alignItems: "center" },
  heroTitle: {
    color: THEME.colors.textPrimary,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  heroSubtitle: {
    color: THEME.colors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  plans: { width: "100%", gap: spacing.md, marginBottom: spacing.lg },
  planCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.lg,
  },
  planCardSelected: {
    borderColor: THEME.colors.primary,
  },
  planCardFeatured: {
    backgroundColor: THEME.colors.background,
    borderColor: THEME.colors.conversion,
    borderWidth: 1.5,
  },
  featuredBadge: {
    position: "absolute",
    top: -10,
    right: spacing.lg,
    backgroundColor: THEME.colors.conversion,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  featuredBadgeText: { color: THEME.colors.textOnPrimary, fontSize: 11, fontWeight: "800" },
  planHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planLabel: { color: THEME.colors.textPrimary, fontSize: typography.heading.fontSize, fontWeight: "700" },
  planLabelFeatured: { color: THEME.colors.conversion },
  priceRow: { flexDirection: "row", alignItems: "flex-end", marginTop: spacing.sm },
  planPrice: { color: THEME.colors.textPrimary, fontSize: 32, fontWeight: "800", lineHeight: 36 },
  planPriceFeatured: { color: THEME.colors.textPrimary },
  planPeriod: { color: THEME.colors.textSecondary, fontSize: typography.caption.fontSize, marginLeft: 6, marginBottom: 6 },
  planPeriodFeatured: { color: THEME.colors.textSecondary },
  planDivider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: spacing.md,
  },
  planDividerFeatured: { backgroundColor: "rgba(255,184,0,0.25)" },
  checklistRow: { flexDirection: "row", alignItems: "center", paddingVertical: 5 },
  checklistIcon: { marginRight: spacing.sm },
  checklistLabel: { color: THEME.colors.textPrimary, fontSize: typography.caption.fontSize },
  checklistLabelFeatured: { color: THEME.colors.textPrimary },
  subscribeButton: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: THEME.colors.conversion,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeButtonActive: {
    backgroundColor: THEME.colors.secondary,
    borderWidth: 1.5,
    borderColor: THEME.colors.conversion,
  },
  subscribeButtonDisabled: { opacity: 0.6 },
  activeIcon: { marginRight: spacing.xs },
  subscribeLabel: { color: THEME.colors.textOnPrimary, fontSize: typography.body.fontSize, fontWeight: "700" },
  subscribeLabelActive: { color: THEME.colors.conversion },
  restoreWrap: { marginTop: spacing.md },
  secondaryLink: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textAlign: "center",
  },
  disclaimer: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
