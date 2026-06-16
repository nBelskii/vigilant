import { Router } from "express";
import { fetchSocialNews } from "../services/socialNewsService";
import { cache, CACHE_KEYS, CACHE_TTL } from "../utils/cache";

const router = Router();

router.get("/", async (_req, res) => {
  const cached = cache.get(CACHE_KEYS.social);
  if (cached) {
    return res.json(cached);
  }

  const news = await fetchSocialNews();
  cache.set(CACHE_KEYS.social, news, CACHE_TTL.social);
  res.json(news);
});

export default router;
