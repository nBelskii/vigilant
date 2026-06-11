import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { fetchIncidents } from "../api/client";
import { Incident } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { categoryColors, colors } from "../theme";
import { MarkerDot } from "../components/MarkerDot";
import { PulsingDot } from "../components/PulsingDot";
import { IncidentDetailSheet } from "../components/IncidentDetailSheet";

const EDMONTON_REGION: Region = {
  latitude: 53.5461,
  longitude: -113.4938,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2,
};

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1c1c2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9a9ab8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0a0f" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a45" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1a30" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#16162c" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#2a2a45" }] },
];

export function MapScreen() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    fetchIncidents()
      .then(setIncidents)
      .catch((err) => console.error("Failed to load incidents:", err));
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={EDMONTON_REGION}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {incidents
          .filter((incident) => incident.lat !== null && incident.lng !== null)
          .map((incident) => {
            const category = categorizeIncident(incident.type);
            return (
              <Marker
                key={incident.id}
                coordinate={{ latitude: incident.lat as number, longitude: incident.lng as number }}
                onPress={() => setSelectedIncident(incident)}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <MarkerDot color={categoryColors[category]} />
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
          >
            <PulsingDot />
          </Marker>
        )}
      </MapView>

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
