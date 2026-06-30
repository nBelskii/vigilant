import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius, spacing, typography } from "../theme";
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
  Dashboard: "Dashboard",
  Map: "Map",
  Alerts: "Alerts",
  Digest: "Digest",
  Profile: "Profile",
};

interface TabIconProps {
  name: string;
  isFocused: boolean;
  onPress: () => void;
}

function TabIcon({ name, isFocused, onPress }: TabIconProps) {
  const icon = ICONS[name];
  const label = LABELS[name];
  const progress = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const ripple = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: isFocused ? 1 : 0,
      friction: 7,
      tension: 90,
      useNativeDriver: false,
    }).start();
  }, [isFocused, progress]);

  const handlePress = () => {
    ripple.setValue(0);
    Animated.timing(ripple, { toValue: 1, duration: 420, useNativeDriver: false }).start();
    onPress();
  };

  const inactiveOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const activeOpacity = progress;
  const iconScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  const labelOpacity = progress;
  const labelTranslate = progress.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });
  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.8] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] });

  return (
    <Pressable onPress={handlePress} style={styles.item} hitSlop={8}>
      <View style={styles.iconSlot}>
        <Animated.View style={[styles.ripple, { opacity: rippleOpacity, transform: [{ scale: rippleScale }] }]} />
        <AnimatedIcon
          name={icon}
          iconStyle="regular"
          size={20}
          color={THEME.colors.textSecondary}
          style={{ opacity: inactiveOpacity, position: "absolute" }}
        />
        <AnimatedIcon
          name={icon}
          iconStyle="solid"
          size={20}
          color={THEME.colors.primary}
          style={{ opacity: activeOpacity, transform: [{ scale: iconScale }] }}
        />
      </View>
      <Animated.Text
        style={[styles.label, { opacity: labelOpacity, transform: [{ translateY: labelTranslate }] }]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: insets.bottom + 2 }]} pointerEvents="box-none">
      <View style={styles.bar}>
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
      </View>
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
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    backgroundColor: THEME.colors.background,
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  iconSlot: {
    width: 44,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  ripple: {
    position: "absolute",
    top: -7,
    left: 4,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: "rgba(10, 10, 10, 0.10)",
  },
  label: {
    marginTop: spacing.xs,
    fontSize: typography.caption.fontSize - 2,
    fontWeight: "700",
    color: THEME.colors.primary,
  },
});
