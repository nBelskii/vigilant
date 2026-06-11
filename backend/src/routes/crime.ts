import { Router } from "express";
import { fetchCrimeIncidents } from "../services/crimeService";
import { cache, CACHE_KEYS, CACHE_TTL } from "../utils/cache";

const router = Router();

router.get("/", async (_req, res) => {
  const cached = cache.get(CACHE_KEYS.crime);
  if (cached) {
    return res.json(cached);
  }

  const crime = await fetchCrimeIncidents();
  cache.set(CACHE_KEYS.crime, crime, CACHE_TTL.crime);
  res.json(crime);
});

export default router;
