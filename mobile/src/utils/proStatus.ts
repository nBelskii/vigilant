import AsyncStorage from "@react-native-async-storage/async-storage";
import { isProEntitlementActive } from "./purchasesService";

const PRO_CACHE_KEY = "nearby:pro-status-cache";

export async function getProStatus(): Promise<boolean> {
  // Real entitlement check via RevenueCat
  const rcPro = await isProEntitlementActive();
  if (rcPro) {
    await AsyncStorage.setItem(PRO_CACHE_KEY, "true");
    return true;
  }
  // Fall back to local cache for offline access or dev preview
  const raw = await AsyncStorage.getItem(PRO_CACHE_KEY);
  return raw === "true";
}

// Used only for the dev preview toggle (Settings → Developer)
export async function setProStatus(isPro: boolean): Promise<void> {
  await AsyncStorage.setItem(PRO_CACHE_KEY, isPro ? "true" : "false");
}
