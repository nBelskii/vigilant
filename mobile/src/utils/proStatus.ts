import AsyncStorage from "@react-native-async-storage/async-storage";

const PRO_KEY = "nearby:pro-status";

// Local-only "Pro" flag used to preview Nearby Pro features before real
// payments are wired up. Toggled from Settings > Developer.
export async function getProStatus(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(PRO_KEY);
  return raw === "true";
}

export async function setProStatus(isPro: boolean): Promise<void> {
  await AsyncStorage.setItem(PRO_KEY, isPro ? "true" : "false");
}
