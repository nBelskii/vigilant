import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { fetchCrimeIncidents, fetchIncidents } from "../api/client";
import { Incident } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { categoryColors, colors } from "../theme";
import { MarkerDot } from "../components/MarkerDot";
import { PulsingDot } from "../components/PulsingDot";
import { MapLegend } from "../components/MapLegend";
import { IncidentDetailSheet } from "../components/IncidentDetailSheet";

const EDMONTON_REGION: Region = {
  latitude: 53.5461,
  longitude: -113.4938,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2,
};

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#16161f" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9a9ab8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0f" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a45" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1c1c2e" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#33335a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d1729" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#181826" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#102018" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#2a2a45" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
];

export function MapScreen() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [crimeIncidents, setCrimeIncidents] = useState<Incident[]>([]);
  const [showCrime, setShowCrime] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

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

  const visibleIncidents = showCrime ? [...incidents, ...crimeIncidents] : incidents;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={EDMONTON_REGION}
        customMapStyle={Platform.OS === "android" ? DARK_MAP_STYLE : undefined}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {visibleIncidents
          .filter((incident) => incident.lat !== null && incident.lng !== null)
          .map((incident) => {
            const category = categorizeIncident(incident.type, incident.source);
            const isCrime = incident.source === "police";
            return (
              <Marker
                key={`${incident.source ?? "city"}-${incident.id}`}
                coordinate={{ latitude: incident.lat as number, longitude: incident.lng as number }}
                onPress={() => setSelectedIncident(incident)}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={isCrime ? 2 : 1}
              >
                <MarkerDot color={categoryColors[category]} size={isCrime ? 18 : 22} />
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
      </MapView>

      <MapLegend showCrime={showCrime} onToggleCrime={() => setShowCrime((prev) => !prev)} />

      <IncidentDetailSheet incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
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
});
