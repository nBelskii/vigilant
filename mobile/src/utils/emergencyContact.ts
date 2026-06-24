import AsyncStorage from "@react-native-async-storage/async-storage";

export interface EmergencyContact {
  name: string;
  phone: string;
}

const KEY = "nearby:emergency-contact";

export async function getEmergencyContact(): Promise<EmergencyContact | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EmergencyContact;
  } catch {
    return null;
  }
}

export async function setEmergencyContact(contact: EmergencyContact): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(contact));
}

export async function clearEmergencyContact(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
