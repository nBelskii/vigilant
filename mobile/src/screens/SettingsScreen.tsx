import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "../components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SettingsRow } from "../components/SettingsRow";
import { getNotificationPrefs, setNotificationPrefs } from "../utils/notificationPrefs";
import { requestNotificationPermissions } from "../utils/notifications";
import { getProStatus, setProStatus } from "../utils/proStatus";
import { radius, spacing, tabBarClearance, typography } from "../theme";
import { THEME } from "../theme/theme";

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [crimeAlerts, setCrimeAlerts] = useState(true);
  const [trafficAlerts, setTrafficAlerts] = useState(true);
  const [morningBriefing, setMorningBriefing] = useState(true);
  const [schoolZoneAlerts, setSchoolZoneAlerts] = useState(true);
  const [metric, setMetric] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    getNotificationPrefs().then((prefs) => {
      setPushEnabled(prefs.pushEnabled);
      setCrimeAlerts(prefs.crimeAlerts);
      setTrafficAlerts(prefs.trafficAlerts);
      setMorningBriefing(prefs.morningBriefing);
      setSchoolZoneAlerts(prefs.schoolZoneAlerts);
    });
    getProStatus().then(setIsPro);
  }, []);

  const handleProToggle = async (next: boolean) => {
    setIsPro(next);
    await setProStatus(next);
  };

  const updatePrefs = (next: Partial<{ pushEnabled: boolean; crimeAlerts: boolean; trafficAlerts: boolean; morningBriefing: boolean; schoolZoneAlerts: boolean }>) => {
    setNotificationPrefs({
      pushEnabled,
      crimeAlerts,
      trafficAlerts,
      morningBriefing,
      schoolZoneAlerts,
      ...next,
    });
  };

  const handlePushToggle = async (next: boolean) => {
    if (next) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        setPushEnabled(false);
        updatePrefs({ pushEnabled: false });
        return;
      }
    }
    setPushEnabled(next);
    updatePrefs({ pushEnabled: next });
  };

  const handleCrimeToggle = (next: boolean) => {
    setCrimeAlerts(next);
    updatePrefs({ crimeAlerts: next });
  };

  const handleTrafficToggle = (next: boolean) => {
    setTrafficAlerts(next);
    updatePrefs({ trafficAlerts: next });
  };

  const handleMorningBriefingToggle = (next: boolean) => {
    setMorningBriefing(next);
    updatePrefs({ morningBriefing: next });
  };

  const handleSchoolZoneToggle = (next: boolean) => {
    setSchoolZoneAlerts(next);
    updatePrefs({ schoolZoneAlerts: next });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={THEME.colors.textPrimary} />
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
            description="Get notified about new alerts in your radius"
            value={pushEnabled}
            onValueChange={handlePushToggle}
          />
          <SettingsRow
            icon="alert-circle-outline"
            label="Crime Alerts"
            description="Police-reported incidents nearby"
            value={crimeAlerts}
            onValueChange={handleCrimeToggle}
          />
          <SettingsRow
            icon="car-outline"
            label="Traffic Alerts"
            description="Road closures & collisions"
            value={trafficAlerts}
            onValueChange={handleTrafficToggle}
          />
          <SettingsRow
            icon="sunny-outline"
            label="Morning Safety Brief"
            description="Daily 7am summary of overnight activity"
            value={morningBriefing}
            onValueChange={handleMorningBriefingToggle}
          />
          <SettingsRow
            icon="school-outline"
            label="School Zone Alerts"
            description="Incidents near schools (weekdays 7am–5pm)"
            value={schoolZoneAlerts}
            onValueChange={handleSchoolZoneToggle}
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

        <Text style={styles.sectionLabel}>Developer</Text>
        <View style={styles.section}>
          <SettingsRow
            icon="flask-outline"
            label="Simulate Nearby Pro"
            description="Preview Pro features before payments are enabled"
            value={isPro}
            onValueChange={handleProToggle}
          />
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
    paddingVertical: spacing.lg,
    paddingBottom: tabBarClearance,
  },
  sectionLabel: {
    color: THEME.colors.textSecondary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  section: {
    backgroundColor: THEME.colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    overflow: "hidden",
  },
});
