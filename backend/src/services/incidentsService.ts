import fetch from "node-fetch";
import { Incident } from "../types";
import { edmontonLocalToUTCISO } from "../utils/time";

// Edmonton's crime occurrence dataset (xd4d-c7be) was retired from the open data
// portal. "Fire Response - Current and Historical" (7hsn-idqi) is the closest
// active dataset with per-incident lat/lng and is used as the incident feed instead.
const EDMONTON_INCIDENTS_URL = "https://data.edmonton.ca/resource/7hsn-idqi.json";

export async function fetchIncidents(): Promise<Incident[]> {
  try {
    const res = await fetch(
      `${EDMONTON_INCIDENTS_URL}?$limit=200&$order=dispatch_date_date DESC, dispatch_time DESC`
    );

    if (!res.ok) {
      throw new Error(`Edmonton Open Data API responded with ${res.status}`);
    }

    const data = (await res.json()) as Record<string, any>[];

    return data.map((row, index) => {
      const lat = row.latitude ?? null;
      const lng = row.longitude ?? null;

      let timestamp = new Date().toISOString();
      if (row.dispatch_datetime) {
        timestamp = edmontonLocalToUTCISO(row.dispatch_datetime);
      } else if (row.dispatch_date_date && row.dispatch_time) {
        const datePart = String(row.dispatch_date_date).split("T")[0];
        timestamp = edmontonLocalToUTCISO(`${datePart}T${row.dispatch_time}`);
      }

      return {
        id: row.event_number ?? String(index),
        type: row.event_description ?? row.event_type_group ?? "Unknown",
        location: row.approximate_location ?? row.neighbourhood_name ?? "Unknown",
        lat: lat !== null ? Number(lat) : null,
        lng: lng !== null ? Number(lng) : null,
        timestamp,
      };
    });
  } catch (err) {
    console.error("fetchIncidents error:", err);
    return [];
  }
}
