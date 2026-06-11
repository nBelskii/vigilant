import NodeCache from "node-cache";

export const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const CACHE_KEYS = {
  incidents: "incidents",
  crime: "crime",
  alerts: "alerts",
  airquality: "airquality",
} as const;
