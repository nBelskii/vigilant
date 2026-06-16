import NodeCache from "node-cache";

export const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const CACHE_KEYS = {
  incidents: "incidents",
  crime: "crime",
  alerts: "alerts",
  airquality: "airquality",
  social: "social",
} as const;

// Per-source cache lifetimes, tuned to how often each upstream source actually
// changes so the app gets the freshest data without hammering the upstream APIs.
export const CACHE_TTL = {
  incidents: 120, // Edmonton fire/EMS dispatch feed - updates frequently
  crime: 600, // EPS occurrences - reported with a 24-48h delay, updates a few times a day
  alerts: 90, // 511 traffic + weather alerts - near real-time
  airquality: 600, // Environment Canada AQHI - updates hourly
  social: 1800, // EPS media releases RSS - new posts a few times a day
} as const;
