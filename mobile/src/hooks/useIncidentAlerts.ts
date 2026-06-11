import { useEffect, useRef } from "react";
import { fetchAlerts, fetchCrimeIncidents, fetchIncidents } from "../api/client";
import { IncidentCategory } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { distanceKm } from "../utils/geo";
import { getNotificationPrefs } from "../utils/notificationPrefs";
import { requestNotificationPermissions, sendLocalNotification } from "../utils/notifications";
import { getSeenIds, setSeenIds } from "../utils/seenIncidents";
import { DEFAULT_RADIUS_KM, getSavedLocation } from "../utils/savedLocation";

const EDMONTON_CENTER = { lat: 53.5461, lng: -113.4938 };
const POLL_INTERVAL_MS = 2 * 60 * 1000;

const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  crime: "Crime alert",
  fire: "Fire / medical alert",
  traffic: "Traffic alert",
  other: "New incident",
};

// Polls nearby incidents/alerts and fires a local notification for anything
// new inside the user's watched radius. Runs once on mount and on an
// interval so it keeps working while the app is open in the background tab.
export function useIncidentAlerts() {
  const initialized = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const prefs = await getNotificationPrefs();
      if (!prefs.pushEnabled) return;

      const granted = await requestNotificationPermissions();
      if (!granted) return;

      const location = await getSavedLocation();
      const center = location ? { lat: location.lat, lng: location.lng } : EDMONTON_CENTER;
      const radiusKm = location?.radiusKm ?? DEFAULT_RADIUS_KM;

      const [incidentsResult, crimeResult, alertsResult] = await Promise.allSettled([
        fetchIncidents(),
        fetchCrimeIncidents(),
        fetchAlerts(),
      ]);

      if (cancelled) return;

      const incidents = incidentsResult.status === "fulfilled" ? incidentsResult.value : [];
      const crime = crimeResult.status === "fulfilled" ? crimeResult.value : [];
      const alerts = alertsResult.status === "fulfilled" ? alertsResult.value : [];

      const nearbyIncidents = [...incidents, ...crime]
        .filter((i) => i.lat !== null && i.lng !== null)
        .filter((i) => distanceKm(center, { lat: i.lat as number, lng: i.lng as number }) <= radiusKm);

      const seen = await getSeenIds();
      const currentIds = new Set<string>();
      const newNotifications: { title: string; body: string }[] = [];

      nearbyIncidents.forEach((incident) => {
        const key = `incident-${incident.source ?? "city"}-${incident.id}`;
        currentIds.add(key);
        if (seen.has(key)) return;

        const category = categorizeIncident(incident.type, incident.source);
        if (category === "crime" && !prefs.crimeAlerts) return;
        if (category === "traffic" && !prefs.trafficAlerts) return;

        newNotifications.push({
          title: CATEGORY_LABELS[category],
          body: `${incident.type} — ${incident.location}`,
        });
      });

      alerts.forEach((alert) => {
        const key = `alert-${alert.id}`;
        currentIds.add(key);
        if (seen.has(key)) return;
        if (alert.category === "traffic" && !prefs.trafficAlerts) return;

        newNotifications.push({
          title: alert.title,
          body: `${alert.severity} — ${alert.location}`,
        });
      });

      // Don't notify on the very first check — that would fire one
      // notification per existing incident as soon as the app opens.
      if (initialized.current) {
        for (const notification of newNotifications) {
          await sendLocalNotification(notification.title, notification.body);
        }
      }

      await setSeenIds(new Set([...seen, ...currentIds]));
      initialized.current = true;
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);
}
