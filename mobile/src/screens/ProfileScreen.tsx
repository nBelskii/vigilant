import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AppHeader } from "../components/AppHeader";
import { SettingsRow } from "../components/SettingsRow";
import { colors, radius, spacing, tabBarClearance, typography } from "../theme";

export function ProfileScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <AppHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color={colors.brandEnd} />
        </View>

        <Text style={styles.guestTitle}>You're browsing as a guest</Text>
        <Text style={styles.guestSubtitle}>Sign in to save your area and get personalized alerts.</Text>

        <Pressable style={styles.signInButton}>
          <Text style={styles.signInLabel}>Sign In</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Subscription")} style={styles.proCard}>
          <View style={styles.proIconWrap}>
            <Ionicons name="shield-checkmark" size={22} color={colors.brandEnd} />
          </View>
          <View style={styles.proTextWrap}>
            <Text style={styles.proTitle}>Upgrade to Nearby Pro</Text>
            <Text style={styles.proSubtitle}>Unlimited areas, instant alerts & more</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
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
          <SettingsRow icon="shield-checkmark-outline" label="Saved Areas" description="Manage watched neighbourhoods" showChevron />
          <SettingsRow icon="time-outline" label="Alert History" description="Past alerts in your area" showChevron />
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.section}>
          <SettingsRow icon="information-circle-outline" label="About Nearby" description="Version 1.0.0" showChevron />
          <SettingsRow icon="help-circle-outline" label="Help & Support" showChevron />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: tabBarClearance,
    alignItems: "center",
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  guestTitle: {
    color: colors.text,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
  },
  guestSubtitle: {
    color: colors.textMuted,
    fontSize: typography.body.fontSize,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  signInButton: {
    width: "92%",
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.brandEnd,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  signInLabel: {
    color: "#ffffff",
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  proCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "92%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  proIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  proTextWrap: {
    flex: 1,
  },
  proTitle: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  proSubtitle: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  sectionLabel: {
    alignSelf: "flex-start",
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    width: "92%",
    overflow: "hidden",
  },
});
