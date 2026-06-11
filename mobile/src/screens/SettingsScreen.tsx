import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SettingsRow } from "../components/SettingsRow";
import { colors, radius, spacing, typography } from "../theme";

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [crimeAlerts, setCrimeAlerts] = useState(true);
  const [trafficAlerts, setTrafficAlerts] = useState(false);
  const [metric, setMetric] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="notifications-outline"
            label="Push Notifications"
            description="Get notified about new alerts"
            value={pushEnabled}
            onValueChange={setPushEnabled}
          />
          <SettingsRow
            icon="alert-circle-outline"
            label="Crime Alerts"
            description="Police-reported incidents nearby"
            value={crimeAlerts}
            onValueChange={setCrimeAlerts}
          />
          <SettingsRow
            icon="car-outline"
            label="Traffic Alerts"
            description="Road closures & collisions"
            value={trafficAlerts}
            onValueChange={setTrafficAlerts}
          />
        </View>

        <Text style={styles.sectionLabel}>Map</Text>
        <View style={styles.section}>
          <SettingsRow icon="map-outline" label="Default Map Style" description="Choose from the map screen" showChevron />
          <SettingsRow icon="locate-outline" label="Default Location" description="Edmonton, AB" showChevron />
        </View>

        <Text style={styles.sectionLabel}>Units</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="speedometer-outline"
            label="Use Metric Units"
            description="km, °C"
            value={metric}
            onValueChange={setMetric}
          />
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.section}>
          <SettingsRow icon="log-out-outline" label="Sign Out" danger />
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
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionLabel: {
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
    marginHorizontal: spacing.lg,
    overflow: "hidden",
  },
});
