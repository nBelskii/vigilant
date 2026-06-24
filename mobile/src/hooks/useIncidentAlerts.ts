import { useEffect, useRef, useState } from "react";
import { fetchAirQuality, fetchAlerts, fetchCrimeIncidents, fetchIncidents, fetchSocialIncidents } from "../api/client";
import { scheduleDailyBriefing, cancelDailyBriefing } from "../utils/dailyBriefing";
import { Incident, IncidentCategory } from "../types";
import { categorizeIncident } from "../utils/categorize";
import { distanceKm, formatDistance } from "../utils/geo";
import { getNotificationPrefs } from "../utils/notificationPrefs";
import { requestNotificationPermissions, sendLocalNotification } from "../utils/notifications";
import { getProStatus } from "../utils/proStatus";
import { getSeenIds, setSeenIds } from "../utils/seenIncidents";
import { DEFAULT_RADIUS_KM, getWatchedZones, WatchedZone } from "../utils/savedLocation";

const EDMONTON_CENTER = { lat: 53.5461, lng: -113.4938 };
// Free accounts poll every 2 minutes; Nearby Pro polls every minute for
// faster, "priority" alerts.
const FREE_POLL_INTERVAL_MS = 2 * 60 * 1000;
const PRO_POLL_INTERVAL_MS = 60 * 1000;

const RISKY_AQHI_CATEGORIES = new Set(["Moderate Risk", "High Risk", "Very High Risk"]);

// Emoji + headline per category, used to make push notifications feel urgent
// and worth tapping rather than reading like a generic data update.
const CATEGORY_HEADLINES: Record<IncidentCategory, string> = {
  crime: "🚨 Crime reported nearby",
  fire: "🔥 Fire/EMS response nearby",
  traffic: "🚧 Traffic incident nearby",
  other: "📍 New activity nearby",
};

interface IncidentNotification {
  title: string;
  body: string;
  data: Record<string, unknown>;
}

// Polls nearby incidents/alerts and fires a local notification for anything
// new inside the user's watched radius. Runs once on mount and on an
// interval so it keeps working while the app is open in the background tab.
export function useIncidentAlerts() {
  const initialized = useRef(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const check = async () => {
      const prefs = await getNotificationPrefs();
      const isPro = await getProStatus();

      const savedZones = await getWatchedZones();
      const zones: WatchedZone[] =
        savedZones.length > 0
          ? savedZones
          : [{ id: "default", label: "Edmonton, AB", lat: EDMONTON_CENTER.lat, lng: EDMONTON_CENTER.lng, radiusKm: DEFAULT_RADIUS_KM }];

      const [incidentsResult, crimeResult, socialResult, alertsResult, airQualityResult] = await Promise.allSettled([
        fetchIncidents(),
        fetchCrimeIncidents(),
        fetchSocialIncidents(),
        fetchAlerts(),
        fetchAirQuality(),
      ]);

      if (cancelled) return;

      if (incidentsResult.status === "fulfilled") {
        setIncidents(incidentsResult.value);
        setError(null);
      } else {
        setError("Unable to load nearby incidents");
      }
      setLoading(false);

      const incidents = incidentsResult.status === "fulfilled" ? incidentsResult.value : [];
      const crime = crimeResult.status === "fulfilled" ? crimeResult.value : [];
      const social = socialResult.status === "fulfilled" ? socialResult.value : [];
      const alerts = alertsResult.status === "fulfilled" ? alertsResult.value : [];
      const airQuality = airQualityResult.status === "fulfilled" ? airQualityResult.value : [];

      // Schedule (or cancel) the 7am daily briefing based on current pref and fresh data.
      if (prefs.morningBriefing && prefs.pushEnabled) {
        const overnight = [...incidents, ...crime].filter((i) => {
          const age = Date.now() - new Date(i.timestamp).getTime();
          return age < 12 * 60 * 60 * 1000;
        });
        const aqhiLabel = airQuality[0]?.category ?? "Good";
        scheduleDailyBriefing(overnight.length, aqhiLabel).catch(() => {});
      } else {
        cancelDailyBriefing().catch(() => {});
      }

      if (!prefs.pushEnabled) {
        const interval = isPro ? PRO_POLL_INTERVAL_MS : FREE_POLL_INTERVAL_MS;
        if (!cancelled) timeoutId = setTimeout(check, interval);
        return;
      }

      const granted = await requestNotificationPermissions();
      if (!granted) {
        const interval = isPro ? PRO_POLL_INTERVAL_MS : FREE_POLL_INTERVAL_MS;
        if (!cancelled) timeoutId = setTimeout(check, interval);
        return;
      }

      // Match each incident against the closest watch zone it falls inside,
      // so the notification can say "X away from <area>".
      const nearbyIncidents = [...incidents, ...crime, ...social]
        .filter((i) => i.lat !== null && i.lng !== null)
        .map((incident) => {
          let nearest: { zone: WatchedZone; distanceKm: number } | null = null;
          for (const zone of zones) {
            const d = distanceKm({ lat: zone.lat, lng: zone.lng }, { lat: incident.lat as number, lng: incident.lng as number });
            if (d <= zone.radiusKm && (!nearest || d < nearest.distanceKm)) {
              nearest = { zone, distanceKm: d };
            }
          }
          return nearest ? { incident, match: nearest } : null;
        })
        .filter((entry): entry is { incident: Incident; match: { zone: WatchedZone; distanceKm: number } } => entry !== null);

      const seen = await getSeenIds();
      const currentIds = new Set<string>();
      const newNotifications: IncidentNotification[] = [];

      nearbyIncidents.forEach(({ incident, match }) => {
        const key = `incident-${incident.source ?? "city"}-${incident.id}`;
        currentIds.add(key);
        if (seen.has(key)) return;

        const category = categorizeIncident(incident.type, incident.source);
        if (category === "crime" && !prefs.crimeAlerts) return;
        if (category === "traffic" && !prefs.trafficAlerts) return;

        // School zones only alert on weekdays 7am–5pm.
        if (match.zone.type === "school") {
          if (!prefs.schoolZoneAlerts) return;
          const now = new Date();
          const day = now.getDay();
          const hour = now.getHours();
          if (day === 0 || day === 6 || hour < 7 || hour >= 17) return;
        }

        const distance = formatDistance(match.distanceKm);
        const headline = incident.source === "social" ? "📰 Official EPS update nearby" : CATEGORY_HEADLINES[category];

        newNotifications.push({
          title: `${headline} — ${distance} away`,
          body: `${incident.type} near ${incident.location}. Tap to see it on the map.`,
          data: {
            incidentId: incident.id,
            source: incident.source ?? "city",
            lat: incident.lat,
            lng: incident.lng,
          },
        });
      });

      alerts.forEach((alert) => {
        const key = `alert-${alert.id}`;
        currentIds.add(key);
        if (seen.has(key)) return;
        if (alert.category === "traffic" && !prefs.trafficAlerts) return;

        newNotifications.push({
          title: `📢 ${alert.title}`,
          body: `${alert.severity} — ${alert.location}`,
          data: { alertId: alert.id },
        });
      });

      // Air quality alerts for watched zones are a Nearby Pro perk — they
      // re-fire once per day per city while the AQHI stays elevated.
      if (isPro) {
        const today = new Date().toISOString().slice(0, 10);
        const cityNames = new Set(zones.map((zone) => zone.label.split(",")[0].trim()));

        airQuality
          .filter((aq) => cityNames.has(aq.city) && RISKY_AQHI_CATEGORIES.has(aq.category))
          .forEach((aq) => {
            const key = `aqhi-${aq.city}-${today}`;
            currentIds.add(key);
            if (seen.has(key)) return;

            newNotifications.push({
              title: `🌫️ Air quality alert — ${aq.city}`,
              body: `Air quality is "${aq.category}"${aq.aqhi !== null ? ` (AQHI ${aq.aqhi})` : ""} in your watched area today.`,
              data: {},
            });
          });
      }

      // Don't notify on the very first check — that would fire one
      // notification per existing incident as soon as the app opens.
      if (initialized.current) {
        for (const notification of newNotifications) {
          await sendLocalNotification(notification.title, notification.body, notification.data);
        }
      }

      await setSeenIds(new Set([...seen, ...currentIds]));
      initialized.current = true;

      const interval = isPro ? PRO_POLL_INTERVAL_MS : FREE_POLL_INTERVAL_MS;
      if (!cancelled) timeoutId = setTimeout(check, interval);
    };

    check();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return { incidents, loading, error };
}
