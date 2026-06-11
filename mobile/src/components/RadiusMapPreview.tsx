import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";

interface RadiusMapPreviewProps {
  center: { lat: number; lng: number };
  radiusKm: number;
  interactive?: boolean;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
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

export function RadiusMapPreview({ center, radiusKm, interactive, onCenterChange }: RadiusMapPreviewProps) {
  const mapRef = useRef<MapView>(null);
  const [draftCenter, setDraftCenter] = useState(center);

  // Snap back to the saved center whenever it changes externally (e.g. address search).
  useEffect(() => {
    setDraftCenter(center);
    mapRef.current?.animateToRegion(regionForRadius(center, radiusKm), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng]);

  // Re-fit the zoom level around the current center when the radius changes.
  useEffect(() => {
    const focus = interactive ? draftCenter : center;
    mapRef.current?.animateToRegion(regionForRadius(focus, radiusKm), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKm]);

  const handleRegionChange = (region: Region) => {
    if (!interactive) return;
    const next = { lat: region.latitude, lng: region.longitude };
    setDraftCenter(next);
    onCenterChange?.(next);
  };

  const circleCenter = interactive ? draftCenter : center;

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={regionForRadius(center, radiusKm)}
        scrollEnabled={!!interactive}
        zoomEnabled={!!interactive}
        rotateEnabled={false}
        pitchEnabled={false}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
        onRegionChange={handleRegionChange}
      >
        <Circle
          center={{ latitude: circleCenter.lat, longitude: circleCenter.lng }}
          radius={radiusKm * 1000}
          strokeColor={colors.brandEnd}
          strokeWidth={2}
          fillColor="rgba(5,150,105,0.14)"
        />
        {!interactive && (
          <Marker coordinate={{ latitude: center.lat, longitude: center.lng }} anchor={{ x: 0.5, y: 1 }}>
            <Ionicons name="bookmark" size={26} color={colors.brandEnd} />
          </Marker>
        )}
      </MapView>

      {interactive && (
        <View style={styles.pin} pointerEvents="none">
          <Ionicons name="location" size={36} color={colors.brandEnd} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 200,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    flex: 1,
  },
  pin: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -18 }],
  },
});
