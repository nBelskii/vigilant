import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, radius, spacing, tabBarClearance, typography } from "../theme";

interface PlanFeature {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  free: boolean;
  pro: boolean;
}

const FEATURES: PlanFeature[] = [
  { icon: "location", label: "1 watched area", free: true, pro: true },
  { icon: "infinite", label: "Unlimited watched areas", free: false, pro: true },
  { icon: "shield-checkmark", label: "Police incident layer", free: true, pro: true },
  { icon: "notifications", label: "Real-time push alerts", free: false, pro: true },
  { icon: "map", label: "All map skins", free: false, pro: true },
  { icon: "calendar", label: "Weekly safety digest", free: true, pro: true },
  { icon: "stats-chart", label: "Crime trend insights", free: false, pro: true },
  { icon: "ban", label: "No ads", free: false, pro: true },
];

type PlanId = "monthly" | "yearly";

export function SubscriptionScreen() {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<PlanId>("yearly");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Nearby Pro</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="shield-checkmark" size={28} color={colors.brandEnd} />
          </View>
          <Text style={styles.heroTitle}>Stay ahead of what's nearby</Text>
          <Text style={styles.heroSubtitle}>Unlock unlimited watched areas, instant push alerts and more.</Text>
        </View>

        <View style={styles.plans}>
          <Pressable
            style={[styles.planCard, selected === "monthly" && styles.planCardActive]}
            onPress={() => setSelected("monthly")}
          >
            <Text style={styles.planLabel}>Monthly</Text>
            <Text style={styles.planPrice}>$6.99</Text>
            <Text style={styles.planPeriod}>per month</Text>
          </Pressable>
          <Pressable
            style={[styles.planCard, selected === "yearly" && styles.planCardActive]}
            onPress={() => setSelected("yearly")}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SAVE $34/YR</Text>
            </View>
            <Text style={styles.planLabel}>Yearly</Text>
            <Text style={styles.planPrice}>$49.99</Text>
            <Text style={styles.planPeriod}>per year</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.featureHeaderRow}>
            <Text style={[styles.featureLabel, styles.featureHeaderLabel]}>Features</Text>
            <Text style={styles.featureHeaderCol}>Free</Text>
            <Text style={[styles.featureHeaderCol, styles.proCol]}>Pro</Text>
          </View>
          {FEATURES.map((feature) => (
            <View key={feature.label} style={styles.featureRow}>
              <View style={styles.featureLabelRow}>
                <Ionicons name={feature.icon} size={18} color={colors.textMuted} style={styles.featureIcon} />
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
              <View style={styles.featureCheckCol}>
                {feature.free && <Ionicons name="checkmark" size={18} color={colors.textMuted} />}
              </View>
              <View style={styles.featureCheckCol}>
                {feature.pro && <Ionicons name="checkmark" size={18} color={colors.brandEnd} />}
              </View>
            </View>
          ))}
        </View>

        <Pressable style={styles.subscribeButton}>
          <Text style={styles.subscribeLabel}>
            {selected === "yearly" ? "Start Pro — $49.99/yr" : "Start Pro — $6.99/mo"}
          </Text>
        </Pressable>
        <Text style={styles.disclaimer}>
          This is a preview of Nearby Pro. Payments aren't enabled yet.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: tabBarClearance,
  },
  hero: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    color: colors.text,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    marginTop: spacing.md,
  },
  heroSubtitle: {
    color: colors.textMuted,
    fontSize: typography.body.fontSize,
    marginTop: spacing.xs,
  },
  plans: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  planCardActive: {
    borderColor: colors.brandEnd,
    backgroundColor: colors.surfaceRaised,
  },
  badge: {
    position: "absolute",
    top: -10,
    right: spacing.sm,
    backgroundColor: colors.brandEnd,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  planLabel: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  planPrice: {
    color: colors.text,
    fontSize: typography.title.fontSize,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  planPeriod: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  featureHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureHeaderLabel: {
    flex: 1,
    color: colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: typography.caption.fontSize,
    letterSpacing: 1,
  },
  featureHeaderCol: {
    width: 44,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
  },
  proCol: {
    color: colors.brandEnd,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  featureLabelRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    marginRight: spacing.sm,
  },
  featureLabel: {
    color: colors.text,
    fontSize: typography.body.fontSize,
  },
  featureCheckCol: {
    width: 44,
    alignItems: "center",
  },
  subscribeButton: {
    backgroundColor: colors.brandEnd,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  subscribeLabel: {
    color: "#ffffff",
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  disclaimer: {
    color: colors.textFaint,
    fontSize: typography.caption.fontSize,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
