import { Alert, AirQuality, Incident } from "../types";

// Production: set EXPO_PUBLIC_API_URL to your full server URL (e.g. https://vigilant-api.onrender.com)
// Development: set EXPO_PUBLIC_API_HOST to your LAN IP (ipconfig getifaddr en0)
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  `http://${process.env.EXPO_PUBLIC_API_HOST ?? "localhost"}:3001`;

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchIncidents(): Promise<Incident[]> {
  return getJson<Incident[]>("/api/incidents");
}

export function fetchCrimeIncidents(): Promise<Incident[]> {
  return getJson<Incident[]>("/api/crime");
}

export function fetchAlerts(): Promise<Alert[]> {
  return getJson<Alert[]>("/api/alerts");
}

export function fetchAirQuality(): Promise<AirQuality[]> {
  return getJson<AirQuality[]>("/api/airquality");
}

export function fetchSocialIncidents(): Promise<Incident[]> {
  return getJson<Incident[]>("/api/social");
}

export interface TrendBucket {
  weekLabel: string;
  weekStart: string;
  crime: number;
  fire: number;
  traffic: number;
}

export interface TrendsData {
  weeks: TrendBucket[];
  hourly: number[];
  peakHour: number;
  totalCrime: number;
  totalFire: number;
  totalTraffic: number;
  dataSource: string;
}

export function fetchTrends(): Promise<TrendsData> {
  return getJson<TrendsData>("/api/trends");
}

export function fetchGeocode(query: string): Promise<{ lat: number; lng: number } | null> {
  return getJson<{ lat: number; lng: number } | null>(`/api/geocode?q=${encodeURIComponent(query)}`);
}
