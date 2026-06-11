import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

interface MarkerDotProps {
  color: string;
}

export function MarkerDot({ color }: MarkerDotProps) {
  return (
    <View style={[styles.dot, { backgroundColor: color }]}>
      <View style={styles.inner} />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.text,
  },
  inner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text,
  },
});
