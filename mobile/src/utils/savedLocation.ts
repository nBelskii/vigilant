import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedLocation {
  label: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

export interface WatchedZone extends SavedLocation {
  id: string;
}

const LEGACY_KEY = "nearby:watched-location";
const ZONES_KEY = "nearby:watched-zones";

export const DEFAULT_RADIUS_KM = 3;

// Free accounts can watch a single area; Nearby Pro unlocks more.
export const FREE_ZONE_LIMIT = 1;

function makeZoneId(): string {
  return `zone-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

export async function getWatchedZones(): Promise<WatchedZone[]> {
  const raw = await AsyncStorage.getItem(ZONES_KEY);
  if (raw) {
    try {
      const zones = JSON.parse(raw) as WatchedZone[];
      if (Array.isArray(zones)) return zones;
    } catch {
      // fall through to legacy migration
    }
  }

  // Migrate a pre-multi-zone single saved location into the new list.
  const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
  if (legacyRaw) {
    try {
      const legacy = JSON.parse(legacyRaw) as SavedLocation;
      const zones: WatchedZone[] = [{ ...legacy, id: makeZoneId() }];
      await AsyncStorage.setItem(ZONES_KEY, JSON.stringify(zones));
      return zones;
    } catch {
      // ignore corrupt legacy data
    }
  }

  return [];
}

export async function setWatchedZones(zones: WatchedZone[]): Promise<void> {
  await AsyncStorage.setItem(ZONES_KEY, JSON.stringify(zones));
}

export async function addWatchedZone(location: SavedLocation): Promise<WatchedZone> {
  const zones = await getWatchedZones();
  const zone: WatchedZone = { ...location, id: makeZoneId() };
  await setWatchedZones([...zones, zone]);
  return zone;
}

export async function updateWatchedZone(id: string, location: SavedLocation): Promise<void> {
  const zones = await getWatchedZones();
  await setWatchedZones(zones.map((zone) => (zone.id === id ? { ...location, id } : zone)));
}

export async function removeWatchedZone(id: string): Promise<void> {
  const zones = await getWatchedZones();
  await setWatchedZones(zones.filter((zone) => zone.id !== id));
}

// Legacy single-location API. Operates on the first ("primary") zone so
// existing screens keep working while multi-zone UI rolls out.
export async function getSavedLocation(): Promise<SavedLocation | null> {
  const zones = await getWatchedZones();
  return zones[0] ?? null;
}

export async function setSavedLocation(location: SavedLocation): Promise<void> {
  const zones = await getWatchedZones();
  if (zones.length === 0) {
    await setWatchedZones([{ ...location, id: makeZoneId() }]);
    return;
  }
  await setWatchedZones([{ ...location, id: zones[0].id }, ...zones.slice(1)]);
}

export async function clearSavedLocation(): Promise<void> {
  await AsyncStorage.removeItem(LEGACY_KEY);
  await AsyncStorage.removeItem(ZONES_KEY);
}
