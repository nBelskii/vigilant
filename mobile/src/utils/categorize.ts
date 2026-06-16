import { Incident, IncidentCategory } from "../types";

const CRIME_KEYWORDS = ["ASSAULT", "ROBBERY", "THEFT", "BREAK", "WEAPON", "DISTURBANCE", "SHOOTING"];
const TRAFFIC_KEYWORDS = ["MVC", "COLLISION", "TRAFFIC", "VEHICLE"];

export function categorizeIncident(type: string, source?: Incident["source"]): IncidentCategory {
  if (source === "police" || source === "social") {
    return "crime";
  }

  const upper = type.toUpperCase();

  if (CRIME_KEYWORDS.some((keyword) => upper.includes(keyword))) {
    return "crime";
  }

  if (TRAFFIC_KEYWORDS.some((keyword) => upper.includes(keyword))) {
    return "traffic";
  }

  if (upper.includes("FIRE") || upper.includes("ALARM") || upper.includes("MEDICAL") || upper.includes("RESCUE")) {
    return "fire";
  }

  return "other";
}
