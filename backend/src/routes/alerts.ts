import { Router } from "express";
import { fetchAlerts } from "../services/alertsService";
import { fetchWeatherAlerts } from "../services/weatherAlertsService";
import { cache, CACHE_KEYS, CACHE_TTL } from "../utils/cache";

const router = Router();

router.get("/", async (_req, res) => {
  const cached = cache.get(CACHE_KEYS.alerts);
  if (cached) {
    return res.json(cached);
  }

  const [traffic, weather] = await Promise.all([fetchAlerts(), fetchWeatherAlerts()]);
  const alerts = [...weather, ...traffic].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  cache.set(CACHE_KEYS.alerts, alerts, CACHE_TTL.alerts);
  res.json(alerts);
});

export default router;
