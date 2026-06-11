import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, IncidentCategory } from "../theme";
import { SelectedPinIndicator } from "./SelectedPinIndicator";

interface IncidentMarkerProps {
  category: IncidentCategory;
  color: string;
  size?: number;
  selected?: boolean;
}

export const CATEGORY_ICONS: Record<IncidentCategory, keyof typeof Ionicons.glyphMap> = {
  crime: "shield",
  fire: "flame",
  traffic: "car-sport",
  other: "alert-circle",
};

// Reserved space above the pin for the "selected" indicator. Kept constant
// (and always part of layout) so the marker's bounding box never resizes
// when toggling selection - resizing causes react-native-maps to shift or
// drop the marker on some platforms.
export const INDICATOR_SPACE = 26;

export function markerAnchor(size: number) {
  const total = size + INDICATOR_SPACE;
  return { x: 0.5, y: (INDICATOR_SPACE + size / 2) / total };
}

export function IncidentMarker({ category, color, size = 30, selected }: IncidentMarkerProps) {
  const iconSize = Math.round(size * 0.55);

  return (
    <View style={[styles.outerWrap, { width: size, height: size + INDICATOR_SPACE }]}>
      <View style={[styles.indicatorSlot, { height: INDICATOR_SPACE }]}>
        {selected && <SelectedPinIndicator color={color} />}
      </View>
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
        <Ionicons name={CATEGORY_ICONS[category]} size={iconSize} color="#ffffff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  indicatorSlot: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
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
