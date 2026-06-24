import { Router } from "express";
import { fetchTrends } from "../services/trendsService";
import { cache, CACHE_KEYS, CACHE_TTL } from "../utils/cache";

const router = Router();

router.get("/", async (_req, res) => {
  const cached = cache.get(CACHE_KEYS.trends);
  if (cached) return res.json(cached);

  const data = await fetchTrends();
  cache.set(CACHE_KEYS.trends, data, CACHE_TTL.trends);
  res.json(data);
});

export default router;
