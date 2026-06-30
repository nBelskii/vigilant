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
import { ProfileTile } from "../components/ProfileTile";
import { radius, spacing, typography } from "../theme";
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

// Stable fallback prices shown when RevenueCat packages haven't loaded yet.
const FALLBACK_PLANS = [
  { id: "yearly", label: "Annual", price: "$49.99 / year", savings: "Save $34/yr" },
  { id: "monthly", label: "Monthly", price: "$6.99 / month", savings: null },
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

  const priceLabel = (pkg: PurchasesPackage) =>
    pkg.product.priceString +
    (pkg.packageType === "ANNUAL" || pkg.identifier.includes("annual") ? " / year" : " / month");

  const annualSavings = (pkg: PurchasesPackage) => {
    if (pkg.packageType === "ANNUAL" || pkg.identifier.includes("annual")) {
      return "Best value";
    }
    return null;
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

      <FadeSlideIn style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="shield-checkmark" size={32} color={THEME.colors.conversion} />
        </View>
        <Text style={styles.heroTitle}>Stay ahead of what's nearby</Text>
        <Text style={styles.heroSubtitle}>Unlimited areas, instant alerts, and more.</Text>

        {/* Plan selector */}
        <View style={styles.plans}>
          {usingRealPackages
            ? packages.map((pkg) => {
                const isSelected = selectedPkg?.identifier === pkg.identifier;
                const savings = annualSavings(pkg);
                return (
                  <Pressable
                    key={pkg.identifier}
                    style={[styles.planCard, isSelected && styles.planCardActive]}
                    onPress={() => setSelectedPkg(pkg)}
                  >
                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={22}
                      color={isSelected ? THEME.colors.conversion : THEME.colors.textSecondary}
                    />
                    <View style={styles.planTextWrap}>
                      <Text style={styles.planLabel}>{pkg.product.title || pkg.identifier}</Text>
                      <Text style={styles.planPeriod}>{priceLabel(pkg)}</Text>
                    </View>
                    {savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsBadgeText}>{savings}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })
            : FALLBACK_PLANS.map((plan) => {
                const isSelected = selectedFallback === plan.id;
                return (
                  <Pressable
                    key={plan.id}
                    style={[styles.planCard, isSelected && styles.planCardActive]}
                    onPress={() => setSelectedFallback(plan.id)}
                  >
                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={22}
                      color={isSelected ? THEME.colors.conversion : THEME.colors.textSecondary}
                    />
                    <View style={styles.planTextWrap}>
                      <Text style={styles.planLabel}>{plan.label}</Text>
                      <Text style={styles.planPeriod}>{plan.price}</Text>
                    </View>
                    {plan.savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsBadgeText}>{plan.savings}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
        </View>

        {/* Feature list */}
        <View style={styles.tileGrid}>
          {FEATURES.map((feature) => (
            <ProfileTile key={feature.label} icon={feature.icon} label={feature.label} />
          ))}
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
                <Text style={styles.subscribeLabel}>
                  {usingRealPackages
                    ? `Start Pro — ${selectedPkg ? priceLabel(selectedPkg) : ""}`
                    : selectedFallback === "yearly"
                    ? "Start Pro — $49.99/yr"
                    : "Start Pro — $6.99/mo"}
                </Text>
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
  plans: { width: "100%", gap: spacing.sm, marginBottom: spacing.lg },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: spacing.md,
  },
  planCardActive: { borderColor: THEME.colors.conversion, backgroundColor: THEME.colors.secondary },
  planTextWrap: { flex: 1, marginLeft: spacing.md },
  planLabel: { color: THEME.colors.textPrimary, fontSize: typography.body.fontSize, fontWeight: "700" },
  planPeriod: { color: THEME.colors.textSecondary, fontSize: typography.caption.fontSize, marginTop: 2 },
  savingsBadge: {
    backgroundColor: THEME.colors.secondary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  savingsBadgeText: { color: THEME.colors.conversion, fontSize: 11, fontWeight: "700" },
  tileGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
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
