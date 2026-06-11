import { Router } from "express";
import { fetchCrimeIncidents } from "../services/crimeService";
import { cache, CACHE_KEYS } from "../utils/cache";

const router = Router();

router.get("/", async (_req, res) => {
  const cached = cache.get(CACHE_KEYS.crime);
  if (cached) {
    return res.json(cached);
  }

  const crime = await fetchCrimeIncidents();
  cache.set(CACHE_KEYS.crime, crime);
  res.json(crime);
});

export default router;
