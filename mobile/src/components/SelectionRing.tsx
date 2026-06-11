import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

const SIZE = 64;

export function SelectionRing() {
  return <View style={styles.ring} />;
}

const styles = StyleSheet.create({
  ring: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 4,
    borderColor: colors.selectionRing,
    backgroundColor: "transparent",
  },
});
