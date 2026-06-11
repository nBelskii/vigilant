import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius } from "../theme";

const ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Home: { focused: "home", unfocused: "home-outline" },
  Map: { focused: "map", unfocused: "map-outline" },
  Digest: { focused: "calendar", unfocused: "calendar-outline" },
  Alerts: { focused: "warning", unfocused: "warning-outline" },
  Profile: { focused: "person-circle", unfocused: "person-circle-outline" },
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 12 }]} pointerEvents="box-none">
      <BlurView intensity={60} tint="light" style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const icon = ICONS[route.name];

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.item} hitSlop={6}>
              {isFocused ? (
                <View style={styles.activePill}>
                  <Ionicons name={icon.focused} size={22} color="#ffffff" />
                </View>
              ) : (
                <View style={styles.inactivePill}>
                  <Ionicons name={icon.unfocused} size={22} color={colors.textFaint} />
                </View>
              )}
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 24,
    right: 24,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    width: "100%",
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activePill: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.brandEnd,
    alignItems: "center",
    justifyContent: "center",
  },
  inactivePill: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
