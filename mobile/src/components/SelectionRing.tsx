import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

const SIZE = 46;

export function SelectionRing() {
  return <View style={styles.ring} />;
}

const styles = StyleSheet.create({
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 3,
    borderColor: colors.selectionRing,
    backgroundColor: "rgba(139,92,246,0.12)",
  },
});
