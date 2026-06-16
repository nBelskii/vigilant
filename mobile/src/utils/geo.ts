export interface GeocodeResult {
  label: string;
  lat: number;
  lng: number;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

interface NominatimAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  postcode?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

// Build a short, disambiguated label from the structured address instead of
// Nominatim's full display_name (which is long and makes near-duplicate
// streets in different neighbourhoods look identical).
function formatLabel(query: string, address: NominatimAddress | undefined, fallback: string): string {
  if (!address) return fallback;

  const parts: string[] = [];

  if (address.road) {
    // Edmonton's open data often lacks a housenumber for residential
    // addresses, so fall back to the number the user typed.
    const queryHouseNumber = query.trim().match(/^\d+[A-Za-z]?/)?.[0];
    const houseNumber = address.house_number ?? queryHouseNumber;
    parts.push(houseNumber ? `${houseNumber} ${address.road}` : address.road);
  }

  const area = address.neighbourhood ?? address.suburb;
  if (area) parts.push(area);

  const city = address.city ?? address.town;
  if (city) parts.push(city);

  if (address.postcode) parts.push(address.postcode);

  return parts.length > 0 ? parts.join(", ") : fallback;
}

export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return [];

  const url =
    `${NOMINATIM_URL}?format=json&addressdetails=1&limit=8&countrycodes=ca&` +
    `q=${encodeURIComponent(`${query}, Edmonton, Alberta`)}&viewbox=-114.3,53.8,-113.0,53.2&bounded=0`;

  const res = await fetch(url, {
    headers: { "User-Agent": "NearbyApp/1.0 (Edmonton safety alerts)" },
  });

  if (!res.ok) {
    throw new Error(`Geocoding failed with status ${res.status}`);
  }

  const data = (await res.json()) as NominatimResult[];

  const results = data.map((item) => ({
    label: formatLabel(query, item.address, item.display_name),
    lat: Number(item.lat),
    lng: Number(item.lon),
  }));

  // Drop entries that collapse to the same label (e.g. duplicate street
  // segments in the same neighbourhood) so the list isn't full of
  // indistinguishable choices.
  const seen = new Set<string>();
  return results.filter((item) => {
    if (seen.has(item.label)) return false;
    seen.add(item.label);
    return true;
  });
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`;

  const res = await fetch(url, {
    headers: { "User-Agent": "NearbyApp/1.0 (Edmonton safety alerts)" },
  });

  if (!res.ok) {
    throw new Error(`Reverse geocoding failed with status ${res.status}`);
  }

  const data = (await res.json()) as { display_name?: string };
  return data.display_name ?? "Custom location";
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

// Human-friendly distance for notification copy: meters under 1km, otherwise
// km with one decimal (e.g. "450 m", "2.3 km").
export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.round((km * 1000) / 10) * 10;
    return `${Math.max(meters, 10)} m`;
  }
  return `${km.toFixed(1)} km`;
}
