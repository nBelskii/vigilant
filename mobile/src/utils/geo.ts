export interface GeocodeResult {
  label: string;
  lat: number;
  lng: number;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return [];

  const url =
    `${NOMINATIM_URL}?format=json&limit=5&countrycodes=ca&` +
    `q=${encodeURIComponent(query)}&viewbox=-114.3,53.8,-113.0,53.2&bounded=0`;

  const res = await fetch(url, {
    headers: { "User-Agent": "NearbyApp/1.0 (Edmonton safety alerts)" },
  });

  if (!res.ok) {
    throw new Error(`Geocoding failed with status ${res.status}`);
  }

  const data = (await res.json()) as { display_name: string; lat: string; lon: string }[];

  return data.map((item) => ({
    label: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  }));
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * R * Math.asin(Math.sqrt(h));
}
