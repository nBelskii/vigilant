import React, { useEffect, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing, tabBarHeight, typography } from "../theme";
import { THEME } from "../theme/theme";

const AnimatedIcon = Animated.createAnimatedComponent(FontAwesome6);

const ICONS: Record<string, keyof typeof FontAwesome6.glyphMap> = {
  Dashboard: "house",
  Map: "map",
  Alerts: "bell",
  Digest: "chart-simple",
  Profile: "user",
};

const LABELS: Record<string, string> = {
  Dashboard: "Home",
  Map: "Map",
  Alerts: "Alerts",
  Digest: "Digest",
  Profile: "Profile",
};

interface TabItemProps {
  name: string;
  isFocused: boolean;
  onPress: () => void;
}

function TabItem({ name, isFocused, onPress }: TabItemProps) {
  const icon = ICONS[name];
  const label = LABELS[name];
  const progress = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: isFocused ? 1 : 0,
      friction: 8,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [isFocused, progress]);

  const iconScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const iconColor = isFocused ? THEME.colors.primary : THEME.colors.textSecondary;
  const labelOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  return (
    <Pressable onPress={onPress} style={styles.item} hitSlop={4}>
      <Animated.View style={{ transform: [{ scale: iconScale }] }}>
        <AnimatedIcon
          name={icon}
          iconStyle={isFocused ? "solid" : "regular"}
          size={22}
          color={iconColor}
        />
      </Animated.View>
      <Animated.Text
        style={[styles.label, { opacity: labelOpacity, color: iconColor }]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const count = state.routes.length;

  // Slide the indicator to the active tab column.
  useEffect(() => {
    if (barWidth === 0) return;
    const tabW = barWidth / count;
    const indicatorW = 20;
    Animated.spring(indicatorX, {
      toValue: state.index * tabW + tabW / 2 - indicatorW / 2,
      friction: 8,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [state.index, barWidth, count, indicatorX]);

  const onLayout = (e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      style={[styles.bar, { paddingBottom: insets.bottom + spacing.sm }]}
      onLayout={onLayout}
    >
      {/* Sliding dot indicator at the top of the bar */}
      {barWidth > 0 && (
        <Animated.View
          style={[styles.indicator, { transform: [{ translateX: indicatorX }] }]}
        />
      )}

      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return <TabItem key={route.key} name={route.name} isFocused={isFocused} onPress={onPress} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  indicator: {
    position: "absolute",
    top: 0,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: THEME.colors.primary,
  },
  item: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.caption.fontSize - 1,
    fontWeight: "600",
  },
});
