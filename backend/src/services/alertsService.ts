import fetch from "node-fetch";
import { Alert } from "../types";

const ALBERTA_511_ALERTS_URL = "https://511.alberta.ca/api/v2/get/alerts";

export async function fetchAlerts(): Promise<Alert[]> {
  try {
    const res = await fetch(ALBERTA_511_ALERTS_URL);

    if (!res.ok) {
      throw new Error(`511 Alberta API responded with ${res.status}`);
    }

    const data = (await res.json()) as Record<string, any>[];

    return data.map((row, index) => ({
      id: String(row.Id ?? row.id ?? index),
      title: row.HeaderText ?? row.Description ?? row.EventType ?? "Alert",
      severity: row.Severity ?? row.Priority ?? "Unknown",
      location: row.RoadwayName ?? row.LocationDescription ?? row.Location ?? "Alberta",
      timestamp: row.LastUpdated ?? row.StartDate ?? new Date().toISOString(),
      category: "traffic" as const,
    }));
  } catch (err) {
    console.error("fetchAlerts error:", err);
    return [];
  }
}
