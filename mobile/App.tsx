import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { LoadingScreen } from "./src/components/LoadingScreen";
import { useIncidentAlerts } from "./src/hooks/useIncidentAlerts";

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
