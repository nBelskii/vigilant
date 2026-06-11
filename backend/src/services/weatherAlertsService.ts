import fetch from "node-fetch";
import { Alert } from "../types";

// Environment Canada public weather alerts (warnings/watches/statements) via the
// GeoMet OGC API, filtered to a bounding box around the Edmonton region.
const WEATHER_ALERTS_URL = "https://api.weather.gc.ca/collections/weather-alerts/items";
const EDMONTON_BBOX = "-114.3,53.2,-112.6,53.9";

function severityFromAlertType(alertType?: string): string {
  switch ((alertType ?? "").toLowerCase()) {
    case "warning":
      return "Warning";
    case "watch":
      return "Watch";
    case "statement":
      return "Statement";
    default:
      return "Advisory";
  }
}

export async function fetchWeatherAlerts(): Promise<Alert[]> {
  try {
    const url = `${WEATHER_ALERTS_URL}?f=json&bbox=${EDMONTON_BBOX}&limit=20`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Environment Canada weather alerts API responded with ${res.status}`);
    }

    const data = (await res.json()) as { features?: { properties: Record<string, any> }[] };

    return (data.features ?? []).map((feature, index) => {
      const props = feature.properties ?? {};

      return {
        id: `weather-${props.id ?? index}`,
        title: props.alert_name_en ?? "Weather Alert",
        severity: severityFromAlertType(props.alert_type),
        location: "Edmonton area",
        timestamp: props.publication_datetime ?? new Date().toISOString(),
        category: "weather" as const,
      };
    });
  } catch (err) {
    console.error("fetchWeatherAlerts error:", err);
    return [];
  }
}
