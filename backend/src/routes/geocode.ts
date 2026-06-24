import { Router } from "express";
import fetch from "node-fetch";
import { cache } from "../utils/cache";

const router = Router();
const GEOCODE_TTL = 60 * 60 * 24;

router.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : null;
  if (!q) return res.status(400).json(null);

  const cacheKey = `geocode-api:${q.toLowerCase()}`;
  const cached = cache.get<{ lat: number; lng: number } | null>(cacheKey);
  if (cached !== undefined) return res.json(cached);

  try {
    const query = encodeURIComponent(`${q}, Edmonton, AB, Canada`);
    const nominatimRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`,
      { headers: { "User-Agent": "NearbyApp/1.0 (belskii.nikolay@gmail.com)" } }
    );
    if (!nominatimRes.ok) throw new Error(`Nominatim ${nominatimRes.status}`);
    const data = (await nominatimRes.json()) as { lat: string; lon: string }[];
    const result = data.length > 0 ? { lat: Number(data[0].lat), lng: Number(data[0].lon) } : null;
    cache.set(cacheKey, result, GEOCODE_TTL);
    res.json(result);
  } catch (err) {
    console.error("geocode route error:", err);
    res.status(500).json(null);
  }
});

export default router;
