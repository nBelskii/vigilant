import { MapType } from "react-native-maps";

// Custom JSON styles for the Google Maps provider (Android). iOS uses Apple
// Maps, which doesn't support JSON styling, so it cycles `mapType` instead.
export interface MapSkin {
  id: string;
  label: string;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  androidStyle: any[];
  iosMapType: MapType;
}

const NIGHT_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#16161f" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9a9ab0" }] },
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

const MIDNIGHT_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0b0b14" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7d7d9a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f1f33" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2d2d4a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050811" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#23233a" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
];

const RETRO_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4e6d9e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
];

export const MAP_SKINS: MapSkin[] = [
  { id: "night", label: "Night", icon: "moon", androidStyle: NIGHT_STYLE, iosMapType: "standard" },
  { id: "midnight", label: "Midnight", icon: "contrast", androidStyle: MIDNIGHT_STYLE, iosMapType: "mutedStandard" },
  { id: "retro", label: "Retro", icon: "color-palette", androidStyle: RETRO_STYLE, iosMapType: "standard" },
  { id: "satellite", label: "Satellite", icon: "globe", androidStyle: [], iosMapType: "satellite" },
  { id: "standard", label: "Standard", icon: "map", androidStyle: [], iosMapType: "standard" },
];
