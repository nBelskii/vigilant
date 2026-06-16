import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../components/AppHeader";
import { SettingsRow } from "../components/SettingsRow";
import { getProStatus } from "../utils/proStatus";
import { getWatchedZones } from "../utils/savedLocation";
import { radius, spacing, tabBarClearance, typography } from "../theme";
import { THEME } from "../theme/theme";

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [isPro, setIsPro] = useState(false);
  const [zoneCount, setZoneCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getProStatus().then(setIsPro);
      getWatchedZones().then((zones) => setZoneCount(zones.length));
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <AppHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color={THEME.colors.primary} />
        </View>

        <Text style={styles.guestTitle}>You're browsing as a guest</Text>
        <Text style={styles.guestSubtitle}>Sign in to save your area and get personalized alerts.</Text>

        <Pressable style={styles.signInButton}>
          <Text style={styles.signInLabel}>Sign In</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Subscription")} style={styles.proCard}>
          <View style={styles.proIconWrap}>
            <Ionicons name={isPro ? "checkmark-circle" : "shield-checkmark"} size={22} color={THEME.colors.primary} />
          </View>
          <View style={styles.proTextWrap}>
            <Text style={styles.proTitle}>{isPro ? "Nearby Pro active" : "Upgrade to Nearby Pro"}</Text>
            <Text style={styles.proSubtitle}>
              {isPro ? "Unlimited areas, instant alerts & more unlocked" : "Unlimited areas, instant alerts & more"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={THEME.colors.textSecondary} />
        </Pressable>

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
            icon="shield-checkmark-outline"
            label="Saved Areas"
            description={zoneCount === 0 ? "No watch zones yet" : `${zoneCount} watched area${zoneCount === 1 ? "" : "s"}`}
            showChevron
            onPress={() => navigation.navigate("Map")}
          />
          <SettingsRow icon="time-outline" label="Alert History" description="Past alerts in your area" showChevron />
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.section}>
          <SettingsRow icon="information-circle-outline" label="About Nearby" description="Version 1.0.0" showChevron />
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
    paddingBottom: tabBarClearance,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.full,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  guestTitle: {
    alignSelf: "center",
    color: THEME.colors.textPrimary,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
  },
  guestSubtitle: {
    alignSelf: "center",
    color: THEME.colors.textSecondary,
    fontSize: typography.body.fontSize,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  signInButton: {
    width: "100%",
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: THEME.colors.primary,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  signInLabel: {
    color: THEME.colors.textOnPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  proCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
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
  sectionLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  section: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    width: "100%",
    overflow: "hidden",
  },
});
