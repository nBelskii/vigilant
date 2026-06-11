import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "nearby:seen-incident-ids";
const MAX_ENTRIES = 500;

export async function getSeenIds(): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return new Set();

  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export async function setSeenIds(ids: Iterable<string>): Promise<void> {
  const trimmed = Array.from(ids).slice(-MAX_ENTRIES);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}
