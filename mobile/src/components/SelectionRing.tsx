import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

interface SelectionRingProps {
  size?: number;
}

export function SelectionRing({ size = 64 }: SelectionRingProps) {
  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 4,
    borderColor: colors.selectionRing,
    backgroundColor: "transparent",
  },
});
