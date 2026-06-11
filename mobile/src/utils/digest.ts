import { Incident } from "../types";
import { categorizeIncident } from "./categorize";

export interface DayGroup {
  date: string;
  label: string;
  incidents: Incident[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

export interface DigestStats {
  total: number;
  fires: number;
  changeVsLastWeek: number | null;
}

export function computeStats(incidents: Incident[]): DigestStats {
  const now = Date.now();
  const oneWeekAgo = now - 7 * DAY_MS;
  const twoWeeksAgo = now - 14 * DAY_MS;

  const thisWeek = incidents.filter((incident) => {
    const t = new Date(incident.timestamp).getTime();
    return t >= oneWeekAgo && t <= now;
  });

  const lastWeek = incidents.filter((incident) => {
    const t = new Date(incident.timestamp).getTime();
    return t >= twoWeeksAgo && t < oneWeekAgo;
  });

  const fires = thisWeek.filter((incident) => categorizeIncident(incident.type) === "fire").length;

  let changeVsLastWeek: number | null = null;
  if (lastWeek.length > 0) {
    changeVsLastWeek = ((thisWeek.length - lastWeek.length) / lastWeek.length) * 100;
  }

  return {
    total: thisWeek.length,
    fires,
    changeVsLastWeek,
  };
}

export function groupByDay(incidents: Incident[]): DayGroup[] {
  const now = Date.now();
  const oneWeekAgo = now - 7 * DAY_MS;

  const thisWeek = incidents.filter((incident) => {
    const t = new Date(incident.timestamp).getTime();
    return t >= oneWeekAgo && t <= now;
  });

  const groups = new Map<string, Incident[]>();

  for (const incident of thisWeek) {
    const date = new Date(incident.timestamp);
    const key = date.toISOString().slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(incident);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, dayIncidents]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-CA", {
        weekday: "long",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      incidents: dayIncidents,
    }));
}
