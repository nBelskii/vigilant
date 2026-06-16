import { Incident } from "../types";
import { categorizeIncident } from "./categorize";
import { distanceKm } from "./geo";

export interface SafetyIndexBreakdownItem {
  label: string;
  score: number;
  detail: string;
}

export interface SafetyIndexResult {
  score: number;
  rating: "Excellent" | "Good" | "Moderate" | "Caution";
  breakdown: SafetyIndexBreakdownItem[];
}

// Derives a 0-100 "NearBy Safety Index" for a point from the live incident
// feed: more nearby crime/fire/traffic activity pulls the score down.
export function computeSafetyIndex(
  center: { lat: number; lng: number },
  radiusKm: number,
  incidents: Incident[]
): SafetyIndexResult {
  const nearby = incidents.filter((incident) => {
    if (incident.lat === null || incident.lng === null) return false;
    return distanceKm(center, { lat: incident.lat, lng: incident.lng }) <= radiusKm;
  });

  const counts = { crime: 0, fire: 0, traffic: 0, other: 0 };
  nearby.forEach((incident) => {
    counts[categorizeIncident(incident.type, incident.source)] += 1;
  });

  const crimeScore = Math.max(10, 100 - counts.crime * 12);
  const trafficScore = Math.max(10, 100 - counts.traffic * 8);
  const fireScore = Math.max(10, 100 - counts.fire * 15);

  const score = Math.round(crimeScore * 0.5 + trafficScore * 0.3 + fireScore * 0.2);

  const rating: SafetyIndexResult["rating"] =
    score >= 80 ? "Excellent" : score >= 65 ? "Good" : score >= 45 ? "Moderate" : "Caution";

  return {
    score,
    rating,
    breakdown: [
      {
        label: "Crime Activity",
        score: crimeScore,
        detail: `${counts.crime} crime report${counts.crime === 1 ? "" : "s"} in the live feed within ${radiusKm.toFixed(1)} km.`,
      },
      {
        label: "Traffic Safety",
        score: trafficScore,
        detail: `${counts.traffic} traffic incident${counts.traffic === 1 ? "" : "s"} reported nearby.`,
      },
      {
        label: "Fire / EMS Activity",
        score: fireScore,
        detail: `${counts.fire} fire or medical response${counts.fire === 1 ? "" : "s"} nearby.`,
      },
    ],
  };
}
