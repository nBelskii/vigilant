import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AppHeader } from "../components/AppHeader";
import { SettingsRow } from "../components/SettingsRow";
import { colors, gradients, radius, spacing, typography } from "../theme";

export function ProfileScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <AppHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <Ionicons name="person" size={36} color={colors.text} />
        </LinearGradient>

        <Text style={styles.guestTitle}>You're browsing as a guest</Text>
        <Text style={styles.guestSubtitle}>Sign in to save your area and get personalized alerts.</Text>

        <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.signInButton}>
          <Text style={styles.signInLabel}>Sign In</Text>
        </LinearGradient>

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
    paddingBottom: spacing.xxl,
    alignItems: "center",
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.full,
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
    width: "85%",
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  signInLabel: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
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
