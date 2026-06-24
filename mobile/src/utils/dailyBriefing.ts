import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const BRIEFING_ID_KEY = "nearby:morning-briefing-id";

export async function scheduleDailyBriefing(
  overnightCount: number,
  aqhiCategory: string
): Promise<void> {
  // Cancel the previous scheduled briefing before rescheduling.
  const prevId = await AsyncStorage.getItem(BRIEFING_ID_KEY);
  if (prevId) {
    await Notifications.cancelScheduledNotificationAsync(prevId).catch(() => {});
  }

  let body: string;
  if (overnightCount === 0) {
    body = "Quiet night in your area. ✅ Stay safe today!";
  } else if (overnightCount <= 3) {
    body = `${overnightCount} incident${overnightCount > 1 ? "s" : ""} overnight near you. Air: ${aqhiCategory}.`;
  } else {
    body = `Active night: ${overnightCount} incidents nearby. Stay aware today. Air: ${aqhiCategory}.`;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🌅 Morning Safety Brief",
      body,
      data: { type: "morning-briefing" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 7,
      minute: 0,
    },
  });

  await AsyncStorage.setItem(BRIEFING_ID_KEY, id);
}

export async function cancelDailyBriefing(): Promise<void> {
  const id = await AsyncStorage.getItem(BRIEFING_ID_KEY);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    await AsyncStorage.removeItem(BRIEFING_ID_KEY);
  }
}
