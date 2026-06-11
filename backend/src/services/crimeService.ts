import fetch from "node-fetch";
import { Incident } from "../types";

// Edmonton Police Service "Occurrences CSDP" feed (powers the official Edmonton
// Community Safety Map). Data is refreshed daily with a ~24-48h reporting delay,
// so we only request the most recent days to keep the feed current and avoid
// surfacing stale incidents.
const EPS_OCCURRENCES_URL =
  "https://services9.arcgis.com/pkzvt2xlZJnPgk1Z/arcgis/rest/services/EPS_OCC_30DAY/FeatureServer/0/query";

const RECENCY_WINDOW_DAYS = 5;

function recentCutoff(): string {
  const cutoff = new Date(Date.now() - RECENCY_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  return cutoff.toISOString().slice(0, 19).replace("T", " ");
}

export async function fetchCrimeIncidents(): Promise<Incident[]> {
  try {
    const where = encodeURIComponent(`Reported_Date >= TIMESTAMP '${recentCutoff()}'`);
    const url =
      `${EPS_OCCURRENCES_URL}?where=${where}` +
      `&outFields=*&outSR=4326&f=json&resultRecordCount=150&orderByFields=Reported_Date DESC`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`EPS occurrences API responded with ${res.status}`);
    }

    const data = (await res.json()) as { features?: { attributes: Record<string, any>; geometry?: { x: number; y: number } }[] };

    return (data.features ?? [])
      .filter((feature) => feature.geometry)
      .map((feature) => {
        const { attributes, geometry } = feature;

        return {
          id: `eps-${attributes.OBJECTID}`,
          type: attributes.Occurrence_Type_Group ?? attributes.Occurrence_Group ?? "Occurrence",
          location: attributes.Intersection ?? "Edmonton",
          lat: geometry?.y ?? null,
          lng: geometry?.x ?? null,
          timestamp: new Date(attributes.Reported_Date).toISOString(),
          source: "police",
        };
      });
  } catch (err) {
    console.error("fetchCrimeIncidents error:", err);
    return [];
  }
}
