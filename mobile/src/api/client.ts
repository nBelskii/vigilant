import { Alert, AirQuality, Incident } from "../types";

// Set this to your computer's LAN IP so a phone running Expo Go (on the same
// Wi-Fi) can reach the backend. Find it with `ipconfig getifaddr en0` on Mac.
const HOST = "172.20.10.2";
export const API_BASE_URL = `http://${HOST}:3001`;

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
