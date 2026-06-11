import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

export function SelectedPinIndicator({ color }: { color?: string }) {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 500, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [bounce]);

  const translateY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY }] }]}>
      <Ionicons name="chevron-down" size={22} color={color ?? colors.brandEnd} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
