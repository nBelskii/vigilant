import fetch from "node-fetch";
import { AirQuality } from "../types";

// Environment Canada's AQHI realtime feed via the GeoMet OGC API (GeoJSON).
const AQHI_URL = "https://api.weather.gc.ca/collections/aqhi-observations-realtime/items";

const ALBERTA_CITIES = [
  "Edmonton",
  "Calgary",
  "Red Deer",
  "Lethbridge",
  "Grande Prairie",
  "Fort McMurray",
  "Medicine Hat",
];

function categorizeAqhi(aqhi: number | null): string {
  if (aqhi === null) return "Unknown";
  if (aqhi <= 3) return "Low Risk";
  if (aqhi <= 6) return "Moderate Risk";
  if (aqhi <= 10) return "High Risk";
  return "Very High Risk";
}

export async function fetchAirQuality(): Promise<AirQuality[]> {
  try {
    const results = await Promise.all(
      ALBERTA_CITIES.map(async (city) => {
        const url = `${AQHI_URL}?f=json&limit=1&latest=true&location_name_en=${encodeURIComponent(
          city
        )}`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Environment Canada AQHI API responded with ${res.status}`);
        }

        const data = (await res.json()) as { features: Record<string, any>[] };
        const feature = data.features?.[0];
        if (!feature) return null;

        const props = feature.properties ?? {};
        const aqhiValue = props.aqhi ?? null;
        const aqhi = aqhiValue !== null ? Number(aqhiValue) : null;

        return {
          city: props.location_name_en ?? city,
          aqhi,
          category: categorizeAqhi(aqhi),
          timestamp: props.observation_datetime ?? new Date().toISOString(),
        };
      })
    );

    return results.filter((r): r is AirQuality => r !== null);
  } catch (err) {
    console.error("fetchAirQuality error:", err);
    return [];
  }
}
