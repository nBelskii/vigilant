import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { LoadingScreen } from "./src/components/LoadingScreen";
import { useIncidentAlerts } from "./src/hooks/useIncidentAlerts";
import { navigateToIncident } from "./src/navigation/navigationRef";
import { initializePurchases } from "./src/utils/purchasesService";

initializePurchases();

export default function App() {
  const { loading: incidentsLoading, error: incidentsError } = useIncidentAlerts();

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });
  const [appReady, setAppReady] = useState(false);
  const appOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(1)).current;

  const ready = fontsLoaded && !incidentsLoading;

  const triggerReady = useCallback(() => {
    setAppReady((prev) => {
      if (prev) return prev;
      Animated.timing(appOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      Animated.timing(loadingOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      return true;
    });
  }, [appOpacity, loadingOpacity]);

  const onLayout = useCallback(() => {
    if (!ready) return;
    triggerReady();
  }, [ready, triggerReady]);

  useEffect(() => {
    if (ready) triggerReady();
  }, [ready, triggerReady]);

  // Tapping an incident push notification jumps straight to its location on
  // the Map tab, so the alert feels actionable instead of just informational.
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | { incidentId?: string; lat?: number; lng?: number; source?: string }
        | undefined;

      if (data?.incidentId && typeof data.lat === "number" && typeof data.lng === "number") {
        navigateToIncident({ id: data.incidentId, lat: data.lat, lng: data.lng, source: data.source });
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {fontsLoaded && (
        <Animated.View style={{ flex: 1, opacity: appOpacity }} onLayout={onLayout}>
          <RootNavigator />
        </Animated.View>
      )}
      {!appReady && (
        <Animated.View style={[styles.overlay, { opacity: loadingOpacity }]} pointerEvents="none">
          <LoadingScreen message={incidentsError ?? undefined} />
        </Animated.View>
      )}
    </SafeAreaProvider>
  );
}

const styles = {
  overlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};
