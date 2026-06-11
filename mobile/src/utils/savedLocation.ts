import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SavedLocation {
  label: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

const STORAGE_KEY = "nearby:watched-location";

export const DEFAULT_RADIUS_KM = 3;

export async function getSavedLocation(): Promise<SavedLocation | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SavedLocation;
  } catch {
    return null;
  }
}

export async function setSavedLocation(location: SavedLocation): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

export async function clearSavedLocation(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
