import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { colors } from "../theme";

interface MarkerDotProps {
  color: string;
  size?: number;
}

export function MarkerDot({ color, size = 22 }: MarkerDotProps) {
  const inner = Math.max(6, Math.round(size * 0.36));

  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
        },
      ]}
    >
      <View style={[styles.inner, { width: inner, height: inner, borderRadius: inner / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.text,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.6,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 0 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inner: {
    backgroundColor: colors.text,
  },
});
