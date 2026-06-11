import React, { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";

interface RadiusMapPreviewProps {
  center: { lat: number; lng: number };
  radiusKm: number;
}

function regionForRadius(center: { lat: number; lng: number }, radiusKm: number): Region {
  const span = Math.max(0.02, (radiusKm / 111) * 2.6);
  return {
    latitude: center.lat,
    longitude: center.lng,
    latitudeDelta: span,
    longitudeDelta: span,
  };
}

export function RadiusMapPreview({ center, radiusKm }: RadiusMapPreviewProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    mapRef.current?.animateToRegion(regionForRadius(center, radiusKm), 300);
  }, [center.lat, center.lng, radiusKm]);

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={regionForRadius(center, radiusKm)}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
        pointerEvents="none"
      >
        <Circle
          center={{ latitude: center.lat, longitude: center.lng }}
          radius={radiusKm * 1000}
          strokeColor={colors.brandEnd}
          strokeWidth={2}
          fillColor="rgba(255,45,85,0.12)"
        />
        <Marker coordinate={{ latitude: center.lat, longitude: center.lng }} anchor={{ x: 0.5, y: 1 }}>
          <Ionicons name="bookmark" size={26} color={colors.brandEnd} />
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 180,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    flex: 1,
  },
});
