import { Router } from "express";
import { fetchIncidents } from "../services/incidentsService";
import { cache, CACHE_KEYS } from "../utils/cache";

const router = Router();

router.get("/", async (_req, res) => {
  const cached = cache.get(CACHE_KEYS.incidents);
  if (cached) {
    return res.json(cached);
  }

  const incidents = await fetchIncidents();
  cache.set(CACHE_KEYS.incidents, incidents);
  res.json(incidents);
});

export default router;
