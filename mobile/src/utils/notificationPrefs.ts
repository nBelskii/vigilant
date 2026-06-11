import AsyncStorage from "@react-native-async-storage/async-storage";

export interface NotificationPrefs {
  pushEnabled: boolean;
  crimeAlerts: boolean;
  trafficAlerts: boolean;
}

const STORAGE_KEY = "nearby:notification-prefs";

const DEFAULT_PREFS: NotificationPrefs = {
  pushEnabled: true,
  crimeAlerts: true,
  trafficAlerts: true,
};

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_PREFS;

  try {
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<NotificationPrefs>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function setNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
