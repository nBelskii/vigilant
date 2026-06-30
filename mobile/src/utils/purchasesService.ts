import Purchases, { LOG_LEVEL, PurchasesPackage, CustomerInfo } from "react-native-purchases";
import { Platform } from "react-native";

export const ENTITLEMENT_PRO = "pro";

let initialized = false;

export function initializePurchases(): void {
  const apiKey =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

  if (!apiKey) return; // No key — stay in local preview mode

  try {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    Purchases.configure({ apiKey });
    initialized = true;
  } catch (e) {
    console.warn("RevenueCat init failed:", e);
  }
}

export async function getRCCustomerInfo(): Promise<CustomerInfo | null> {
  if (!initialized) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

export async function isProEntitlementActive(): Promise<boolean> {
  const info = await getRCCustomerInfo();
  return info?.entitlements.active[ENTITLEMENT_PRO] !== undefined;
}

export async function getAvailablePackages(): Promise<PurchasesPackage[]> {
  if (!initialized) return [];
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages ?? [];
  } catch {
    return [];
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo.entitlements.active[ENTITLEMENT_PRO] !== undefined;
}

export async function restorePurchases(): Promise<boolean> {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo.entitlements.active[ENTITLEMENT_PRO] !== undefined;
}
