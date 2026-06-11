import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors, radius, spacing, tabBarClearance, typography } from "../theme";

interface PlanFeature {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const FEATURES: PlanFeature[] = [
  { icon: "infinite", label: "Unlimited watched areas" },
  { icon: "notifications", label: "Real-time push alerts" },
  { icon: "map", label: "All map skins" },
  { icon: "stats-chart", label: "Crime trend insights" },
  { icon: "ban", label: "No ads" },
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
        <View style={styles.heroIconWrap}>
          <Ionicons name="shield-checkmark" size={32} color={colors.brandEnd} />
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
              color={selected === "yearly" ? colors.brandEnd : colors.textFaint}
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
              color={selected === "monthly" ? colors.brandEnd : colors.textFaint}
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
              <Ionicons name={feature.icon} size={18} color={colors.brandEnd} style={styles.featureIcon} />
              <Text style={styles.featureLabel}>{feature.label}</Text>
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
    alignItems: "center",
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: colors.text,
    fontSize: typography.title.fontSize,
    fontWeight: typography.title.fontWeight,
    textAlign: "center",
  },
  heroSubtitle: {
    color: colors.textMuted,
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
  planTextWrap: {
    flex: 1,
    marginLeft: spacing.md,
  },
  planLabel: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  planPeriod: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  savingsBadge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  savingsBadgeText: {
    color: colors.brandEnd,
    fontSize: 11,
    fontWeight: "700",
  },
  section: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    fontSize: typography.body.fontSize,
  },
  subscribeButton: {
    width: "100%",
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
