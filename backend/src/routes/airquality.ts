import { Router } from "express";
import { fetchAirQuality } from "../services/airQualityService";
import { cache, CACHE_KEYS, CACHE_TTL } from "../utils/cache";

const router = Router();

router.get("/", async (_req, res) => {
  const cached = cache.get(CACHE_KEYS.airquality);
  if (cached) {
    return res.json(cached);
  }

  const airQuality = await fetchAirQuality();
  cache.set(CACHE_KEYS.airquality, airQuality, CACHE_TTL.airquality);
  res.json(airQuality);
});

export default router;
