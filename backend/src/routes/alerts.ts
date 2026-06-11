import { Router } from "express";
import { fetchAlerts } from "../services/alertsService";
import { cache, CACHE_KEYS } from "../utils/cache";

const router = Router();

router.get("/", async (_req, res) => {
  const cached = cache.get(CACHE_KEYS.alerts);
  if (cached) {
    return res.json(cached);
  }

  const alerts = await fetchAlerts();
  cache.set(CACHE_KEYS.alerts, alerts);
  res.json(alerts);
});

export default router;
