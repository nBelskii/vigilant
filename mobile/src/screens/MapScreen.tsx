import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchCrimeIncidents, fetchIncidents } from "../api/client";
import { Incident } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { categoryColors, radius, spacing, tabBarBottomMargin, tabBarHeight, typography } from "../theme";
import { THEME } from "../theme/theme";
import { MAP_SKINS, MapSkin } from "../utils/mapStyles";
import { GeocodeResult, reverseGeocode } from "../utils/geo";
import { DEFAULT_RADIUS_KM, getSavedLocation, SavedLocation, setSavedLocation } from "../utils/savedLocation";
import { IncidentMarker } from "../components/IncidentMarker";
import { SelectionRing } from "../components/SelectionRing";
import { MapLegend } from "../components/MapLegend";
import { MapStyleSwitcher } from "../components/MapStyleSwitcher";
import { IncidentDetailSheet } from "../components/IncidentDetailSheet";
import { WatchZonePanel } from "../components/WatchZonePanel";
import { AppHeader } from "../components/AppHeader";
import { clampZoneRadius, formatZoneArea, formatZoneRadius } from "../components/ZoneRadiusSlider";

// Fallback region used while location permission is loading, denied, or
// unavailable.
const EDMONTON_REGION: Region = {
  latitude: 53.5461,
  longitude: -113.4938,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2,
};

const USER_LOCATION_DELTA = 0.05;

// Marker size scales with zoom level so pins stay visible when zoomed out
// and don't overwhelm the map when zoomed in.
function markerSizeForDelta(latitudeDelta: number): number {
  if (latitudeDelta >= 0.4) return 16;
  if (latitudeDelta >= 0.15) return 24;
  if (latitudeDelta >= 0.05) return 30;
  return 38;
}

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [crimeIncidents, setCrimeIncidents] = useState<Incident[]>([]);
  const [showCrime, setShowCrime] = useState(true);
  const [mapSkin, setMapSkin] = useState<MapSkin>(MAP_SKINS[0]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [watchedLocation, setWatchedLocation] = useState<SavedLocation | null>(null);
  const [markerSize, setMarkerSize] = useState(() => markerSizeForDelta(EDMONTON_REGION.latitudeDelta));
  const [trackChanges, setTrackChanges] = useState(true);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [watchZoneOpen, setWatchZoneOpen] = useState(false);
  const [pickingOnMap, setPickingOnMap] = useState(false);
  const [draftCenter, setDraftCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [draftLabel, setDraftLabel] = useState<string | null>(null);
  const [draftRadiusM, setDraftRadiusM] = useState(1000);
  const [savingZone, setSavingZone] = useState(false);
  const mapRef = useRef<MapView>(null);
  const watchedLocationRef = useRef<SavedLocation | null>(null);
  const mapCenterRef = useRef({ lat: EDMONTON_REGION.latitude, lng: EDMONTON_REGION.longitude });

  const handleRegionChangeComplete = useCallback((region: Region) => {
    mapCenterRef.current = { lat: region.latitude, lng: region.longitude };
    const nextSize = markerSizeForDelta(region.latitudeDelta);
    setMarkerSize((prevSize) => {
      if (prevSize === nextSize) return prevSize;
      setTrackChanges(true);
      return nextSize;
    });
  }, []);

  useEffect(() => {
    if (!trackChanges) return;
    const id = requestAnimationFrame(() => setTrackChanges(false));
    return () => cancelAnimationFrame(id);
  }, [trackChanges, markerSize]);

  useEffect(() => {
    Promise.allSettled([
      fetchIncidents()
        .then(setIncidents)
        .catch((err) => console.error("Failed to load incidents:", err)),
      fetchCrimeIncidents()
        .then(setCrimeIncidents)
        .catch((err) => console.error("Failed to load crime incidents:", err)),
    ]).finally(() => setIncidentsLoading(false));
  }, []);

  // Center the map on the user's current location once permission is
  // granted, unless a saved watched location takes precedence.
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});

      if (!watchedLocationRef.current) {
        mapRef.current?.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: USER_LOCATION_DELTA,
            longitudeDelta: USER_LOCATION_DELTA,
          },
          500
        );
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getSavedLocation().then((saved) => {
        watchedLocationRef.current = saved;
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

  const handleOpenWatchZone = () => {
    const base = watchedLocationRef.current;
    setDraftCenter(base ? { lat: base.lat, lng: base.lng } : { ...mapCenterRef.current });
    setDraftLabel(base?.label ?? null);
    setDraftRadiusM(clampZoneRadius((base?.radiusKm ?? DEFAULT_RADIUS_KM) * 1000));
    setPickingOnMap(false);
    setSelectedIncidentId(null);
    setWatchZoneOpen(true);
  };

  const handleCloseWatchZone = () => {
    setWatchZoneOpen(false);
    setPickingOnMap(false);
  };

  const handleSelectZoneAddress = (result: GeocodeResult) => {
    setDraftCenter({ lat: result.lat, lng: result.lng });
    setDraftLabel(result.label);
    setPickingOnMap(false);
    const span = Math.max(0.02, (draftRadiusM / 111000) * 2.6);
    mapRef.current?.animateToRegion(
      { latitude: result.lat, longitude: result.lng, latitudeDelta: span, longitudeDelta: span },
      400
    );
  };

  const handleMapPress = (e: { nativeEvent: { action?: string; coordinate: { latitude: number; longitude: number } } }) => {
    // react-native-maps bubbles marker taps up to the MapView's onPress
    // too; only react to taps on the bare map itself.
    if (e.nativeEvent.action === "marker-press") return;

    if (pickingOnMap) {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setDraftCenter({ lat: latitude, lng: longitude });
      setDraftLabel(null);
      setPickingOnMap(false);
      return;
    }

    setSelectedIncidentId(null);
  };

  const handleSaveWatchZone = async () => {
    if (!draftCenter) return;
    setSavingZone(true);
    try {
      const label = draftLabel ?? (await reverseGeocode(draftCenter.lat, draftCenter.lng).catch(() => "Custom location"));
      const next: SavedLocation = { label, lat: draftCenter.lat, lng: draftCenter.lng, radiusKm: draftRadiusM / 1000 };
      await setSavedLocation(next);
      watchedLocationRef.current = next;
      setWatchedLocation(next);
      setWatchZoneOpen(false);
      setPickingOnMap(false);
      const span = Math.max(0.02, (next.radiusKm / 111) * 2.6);
      mapRef.current?.animateToRegion(
        { latitude: next.lat, longitude: next.lng, latitudeDelta: span, longitudeDelta: span },
        500
      );
    } finally {
      setSavingZone(false);
    }
  };

  const fabBottomOffset = insets.bottom + tabBarHeight + tabBarBottomMargin + spacing.sm;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        mapType={Platform.OS === "ios" ? mapSkin.iosMapType : "standard"}
        initialRegion={EDMONTON_REGION}
        customMapStyle={Platform.OS === "android" ? mapSkin.androidStyle : undefined}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
      >
        {selectedIncident && (
          <Marker
            coordinate={{ latitude: selectedIncident.lat as number, longitude: selectedIncident.lng as number }}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={999}
            tracksViewChanges={trackChanges}
          >
            <SelectionRing size={markerSize * 2} />
          </Marker>
        )}

        {visibleIncidents.map((incident) => {
          const category = categorizeIncident(incident.type, incident.source);
          const isCrime = incident.source === "police";
          const size = isCrime ? Math.max(14, markerSize - 4) : markerSize;
          return (
            <Marker
              key={`${incident.source ?? "city"}-${incident.id}`}
              coordinate={{ latitude: incident.lat as number, longitude: incident.lng as number }}
              onPress={() => setSelectedIncidentId(incident.id)}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={isCrime ? 2 : 1}
              tracksViewChanges={trackChanges}
            >
              <IncidentMarker category={category} color={categoryColors[category]} size={size} />
            </Marker>
          );
        })}

        {watchedLocation && !watchZoneOpen && (
          <>
            <Circle
              center={{ latitude: watchedLocation.lat, longitude: watchedLocation.lng }}
              radius={watchedLocation.radiusKm * 1000}
              strokeColor={THEME.colors.primary}
              strokeWidth={2}
              fillColor="rgba(0, 198, 83, 0.15)"
              zIndex={0}
            />
            <Marker
              coordinate={{ latitude: watchedLocation.lat, longitude: watchedLocation.lng }}
              anchor={{ x: 0.5, y: 1 }}
              zIndex={4}
            >
              <Ionicons name="bookmark" size={28} color={THEME.colors.primary} />
            </Marker>
          </>
        )}

        {watchZoneOpen && draftCenter && (
          <>
            <Circle
              center={{ latitude: draftCenter.lat, longitude: draftCenter.lng }}
              radius={draftRadiusM}
              strokeColor={THEME.colors.primary}
              strokeWidth={2}
              fillColor="rgba(0, 198, 83, 0.15)"
              zIndex={3}
            />
            <Marker
              coordinate={{ latitude: draftCenter.lat, longitude: draftCenter.lng }}
              anchor={{ x: 0.5, y: 1 }}
              zIndex={5}
              draggable
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setDraftCenter({ lat: latitude, lng: longitude });
                setDraftLabel(null);
              }}
              tracksViewChanges={watchZoneOpen}
            >
              <View style={styles.draftMarker}>
                <View style={styles.draftBadge}>
                  <Text style={styles.draftBadgeText}>
                    {formatZoneRadius(draftRadiusM)} · {formatZoneArea(draftRadiusM)}
                  </Text>
                </View>
                <Ionicons name="location" size={32} color={THEME.colors.primary} />
              </View>
            </Marker>
          </>
        )}
      </MapView>

      <View style={styles.overlay} pointerEvents="box-none">
        <AppHeader title="Nearby" transparent />
        <View style={styles.topRow} pointerEvents="box-none">
          <MapLegend showCrime={showCrime} onToggleCrime={() => setShowCrime((prev) => !prev)} />
          <MapStyleSwitcher selected={mapSkin} onSelect={setMapSkin} />
        </View>

        {pickingOnMap && (
          <View style={styles.pickBanner}>
            <Ionicons name="hand-left-outline" size={16} color={THEME.colors.primary} style={styles.pickBannerIcon} />
            <Text style={styles.pickBannerText}>Tap the map to drop your mark</Text>
            <Pressable onPress={() => setPickingOnMap(false)} hitSlop={8}>
              <Text style={styles.pickBannerCancel}>Cancel</Text>
            </Pressable>
          </View>
        )}
      </View>

      <IncidentDetailSheet
        incidents={visibleIncidents}
        selectedId={selectedIncidentId}
        onSelectId={setSelectedIncidentId}
        center={watchedLocation ? { lat: watchedLocation.lat, lng: watchedLocation.lng } : undefined}
        loading={incidentsLoading}
      />

      {!watchZoneOpen && (
        <Pressable
          style={[styles.fab, { bottom: fabBottomOffset }]}
          onPress={handleOpenWatchZone}
          hitSlop={8}
        >
          <Ionicons name="locate" size={26} color={THEME.colors.primary} />
        </Pressable>
      )}

      {watchZoneOpen && !pickingOnMap && (
        <WatchZonePanel
          bottomOffset={fabBottomOffset}
          locationLabel={draftLabel ?? (draftCenter ? "Custom location on map" : null)}
          radiusM={draftRadiusM}
          onRadiusChange={setDraftRadiusM}
          onSelectAddress={handleSelectZoneAddress}
          onPickOnMap={() => setPickingOnMap(true)}
          onSave={handleSaveWatchZone}
          onClose={handleCloseWatchZone}
          saving={savingZone}
          hasSelection={!!draftCenter}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
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
  fab: {
    position: "absolute",
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: THEME.colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: "#0f2a20",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  pickBanner: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: THEME.colors.background,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    shadowColor: "#0f2a20",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pickBannerIcon: {
    marginRight: spacing.xs,
  },
  pickBannerText: {
    color: THEME.colors.textPrimary,
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    marginRight: spacing.md,
  },
  pickBannerCancel: {
    color: THEME.colors.danger,
    fontSize: typography.body.fontSize,
    fontWeight: "700",
  },
  draftMarker: {
    alignItems: "center",
  },
  draftBadge: {
    backgroundColor: THEME.colors.background,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.xs,
    shadowColor: "#0f2a20",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  draftBadgeText: {
    color: THEME.colors.textPrimary,
    fontSize: typography.caption.fontSize,
    fontWeight: "700",
  },
});
