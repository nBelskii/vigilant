import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
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

interface TabIconProps {
  name: string;
  isFocused: boolean;
  onPress: () => void;
}

function TabIcon({ name, isFocused, onPress }: TabIconProps) {
  const icon = ICONS[name];
  const progress = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: isFocused ? 1 : 0,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [isFocused, progress]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });

  return (
    <Pressable onPress={onPress} style={styles.item} hitSlop={6}>
      <View style={styles.pillSlot}>
        <Animated.View style={[styles.pillBase, { opacity: progress, transform: [{ scale }] }]} />
        <Ionicons
          name={isFocused ? icon.focused : icon.unfocused}
          size={22}
          color={isFocused ? "#ffffff" : colors.textMuted}
        />
      </View>
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 12 }]} pointerEvents="box-none">
      <BlurView intensity={80} tint="light" style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return <TabIcon key={route.key} name={route.name} isFocused={isFocused} onPress={onPress} />;
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
    borderColor: "rgba(255,255,255,0.8)",
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.78)",
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pillSlot: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pillBase: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.brandEnd,
  },
});
