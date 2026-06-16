import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function navigateToIncident(incident: { id: string; lat: number; lng: number; source?: string }) {
  if (!navigationRef.isReady()) return;
  (navigationRef.navigate as (name: string, params: object) => void)("Map", {
    focusIncidentId: incident.id,
    focusLat: incident.lat,
    focusLng: incident.lng,
    focusSource: incident.source ?? null,
    focusTs: Date.now(),
  });
}
