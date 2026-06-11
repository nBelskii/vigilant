import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, IncidentCategory } from "../theme";

interface IncidentMarkerProps {
  category: IncidentCategory;
  color: string;
  size?: number;
}

const CATEGORY_ICONS: Record<IncidentCategory, keyof typeof Ionicons.glyphMap> = {
  crime: "shield",
  fire: "flame",
  traffic: "car-sport",
  other: "alert-circle",
};

export function IncidentMarker({ category, color, size = 30 }: IncidentMarkerProps) {
  const iconSize = Math.round(size * 0.55);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
        },
      ]}
    >
      <Ionicons name={CATEGORY_ICONS[category]} size={iconSize} color={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
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
});
