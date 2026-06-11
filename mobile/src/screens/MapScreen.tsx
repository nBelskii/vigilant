import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { fetchCrimeIncidents, fetchIncidents } from "../api/client";
import { Incident } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { categoryColors, colors } from "../theme";
import { MAP_SKINS, MapSkin } from "../utils/mapStyles";
import { getSavedLocation, SavedLocation } from "../utils/savedLocation";
import { IncidentMarker } from "../components/IncidentMarker";
import { SelectionRing } from "../components/SelectionRing";
import { PulsingDot } from "../components/PulsingDot";
import { MapLegend } from "../components/MapLegend";
import { MapStyleSwitcher } from "../components/MapStyleSwitcher";
import { IncidentDetailSheet } from "../components/IncidentDetailSheet";
import { AppHeader } from "../components/AppHeader";

const EDMONTON_REGION: Region = {
  latitude: 53.5461,
  longitude: -113.4938,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2,
};

export function MapScreen() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [crimeIncidents, setCrimeIncidents] = useState<Incident[]>([]);
  const [showCrime, setShowCrime] = useState(true);
  const [mapSkin, setMapSkin] = useState<MapSkin>(MAP_SKINS[0]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [watchedLocation, setWatchedLocation] = useState<SavedLocation | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    fetchIncidents()
      .then(setIncidents)
      .catch((err) => console.error("Failed to load incidents:", err));

    fetchCrimeIncidents()
      .then(setCrimeIncidents)
      .catch((err) => console.error("Failed to load crime incidents:", err));
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getSavedLocation().then((saved) => {
        setWatchedLocation(saved);
        if (saved) {
          const span = Math.max(0.02, (saved.radiusKm / 111) * 2.6);
          mapRef.current?.animateToRegion(
            {
              latitude: saved.lat,
              longitude: saved.lng,
              latitudeDelta: span,
              longitudeDelta: span,
            },
            500
          );
        }
      });
    }, [])
  );

  const visibleIncidents = (showCrime ? [...incidents, ...crimeIncidents] : incidents).filter(
    (incident) => incident.lat !== null && incident.lng !== null
  );

  const selectedIncident = visibleIncidents.find((incident) => incident.id === selectedIncidentId);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        mapType={Platform.OS === "ios" ? mapSkin.iosMapType : "standard"}
        initialRegion={EDMONTON_REGION}
        customMapStyle={Platform.OS === "android" ? mapSkin.androidStyle : undefined}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {selectedIncident && (
          <Marker
            coordinate={{ latitude: selectedIncident.lat as number, longitude: selectedIncident.lng as number }}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={0}
            tracksViewChanges={false}
          >
            <SelectionRing />
          </Marker>
        )}

        {visibleIncidents.map((incident) => {
          const category = categorizeIncident(incident.type, incident.source);
          const isCrime = incident.source === "police";
          return (
            <Marker
              key={`${incident.source ?? "city"}-${incident.id}`}
              coordinate={{ latitude: incident.lat as number, longitude: incident.lng as number }}
              onPress={() => setSelectedIncidentId(incident.id)}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={isCrime ? 2 : 1}
              tracksViewChanges={false}
            >
              <IncidentMarker category={category} color={categoryColors[category]} size={isCrime ? 28 : 32} />
            </Marker>
          );
        })}

        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={3}
          >
            <PulsingDot />
          </Marker>
        )}

        {watchedLocation && (
          <>
            <Circle
              center={{ latitude: watchedLocation.lat, longitude: watchedLocation.lng }}
              radius={watchedLocation.radiusKm * 1000}
              strokeColor={colors.brandEnd}
              strokeWidth={2}
              fillColor="rgba(5,150,105,0.10)"
              zIndex={0}
            />
            <Marker
              coordinate={{ latitude: watchedLocation.lat, longitude: watchedLocation.lng }}
              anchor={{ x: 0.5, y: 1 }}
              zIndex={4}
            >
              <Ionicons name="bookmark" size={28} color={colors.brandEnd} />
            </Marker>
          </>
        )}
      </MapView>

      <View style={styles.overlay} pointerEvents="box-none">
        <AppHeader title="Nearby" subtitle="Edmonton, AB" transparent />
        <View style={styles.topRow} pointerEvents="box-none">
          <MapLegend showCrime={showCrime} onToggleCrime={() => setShowCrime((prev) => !prev)} />
          <MapStyleSwitcher selected={mapSkin} onSelect={setMapSkin} />
        </View>
      </View>

      <IncidentDetailSheet
        incidents={visibleIncidents}
        selectedId={selectedIncidentId}
        onSelectId={setSelectedIncidentId}
        center={watchedLocation ? { lat: watchedLocation.lat, lng: watchedLocation.lng } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    marginTop: 8,
  },
});
