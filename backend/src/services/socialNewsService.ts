import fetch from "node-fetch";
import { Incident } from "../types";
import { cache } from "../utils/cache";

// EPS publishes media releases as an RSS feed. These are press-release style
// posts (investigations, public appeals, graduations) rather than live
// dispatch data, but they surface official updates well before they'd show
// up in the 24-48h-delayed crime open-data feed.
const EPS_RSS_URL = "https://www.edmontonpolice.ca/home/news/mediareleases.aspx?RSS=1";

const MAX_ITEMS = 8;
const MAX_AGE_DAYS = 14;
const GEOCODE_CACHE_TTL = 60 * 60 * 24 * 7; // geocoded locations don't change, cache for a week

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

function parseItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "";
    const description = block.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? "";
    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "";

    items.push({
      title: decodeEntities(title).trim(),
      link: link.trim(),
      description: stripHtml(description),
      pubDate: pubDate.trim(),
    });
  }

  return items;
}

// Most releases mention either "in the X neighbourhood" or a street
// intersection ("78 Street near 173 Ave"). Either is enough to geocode an
// approximate location for the map.
function extractLocation(text: string): string | null {
  const neighbourhood = text.match(/in the ([A-Za-z0-9'.\- ]+?) neighbourhood/i);
  if (neighbourhood) return neighbourhood[1].trim();

  const intersection = text.match(
    /(\d+\s?(?:Street|St|Avenue|Ave|Road|Rd)\b[^.,;]{0,30}\b(?:and|near|&)\b[^.,;]{0,30}\b(?:Street|St|Avenue|Ave|Road|Rd))/i
  );
  if (intersection) return intersection[1].trim();

  return null;
}

async function geocode(location: string): Promise<{ lat: number; lng: number } | null> {
  const cacheKey = `geocode:${location.toLowerCase()}`;
  const cached = cache.get<{ lat: number; lng: number } | null>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    // Nominatim matches street intersections written with "&" but not "and".
    const normalized = location.replace(/\b(and|near)\b/gi, "&");
    const query = encodeURIComponent(`${normalized}, Edmonton, AB, Canada`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`, {
      headers: { "User-Agent": "NearbyApp/1.0 (community safety app)" },
    });

    if (!res.ok) {
      throw new Error(`Nominatim responded with ${res.status}`);
    }

    const data = (await res.json()) as { lat: string; lon: string }[];
    const result = data.length > 0 ? { lat: Number(data[0].lat), lng: Number(data[0].lon) } : null;
    cache.set(cacheKey, result, GEOCODE_CACHE_TTL);
    return result;
  } catch (err) {
    console.error("socialNewsService geocode error:", err);
    cache.set(cacheKey, null, GEOCODE_CACHE_TTL);
    return null;
  }
}

export async function fetchSocialNews(): Promise<Incident[]> {
  try {
    const res = await fetch(EPS_RSS_URL);
    if (!res.ok) {
      throw new Error(`EPS RSS responded with ${res.status}`);
    }

    const xml = await res.text();
    const items = parseItems(xml).slice(0, MAX_ITEMS);
    const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    // Geocode sequentially with a small delay between requests to respect
    // Nominatim's 1-request-per-second usage policy.
    const incidents: Incident[] = [];
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const timestamp = item.pubDate ? new Date(item.pubDate.replace(" UT", " UTC")) : new Date();
      if (Number.isNaN(timestamp.getTime()) || timestamp.getTime() < cutoff) continue;

      const locationText = extractLocation(item.description) ?? extractLocation(item.title);
      const coords = locationText ? await geocode(locationText) : null;
      if (locationText && index < items.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }

      incidents.push({
        id: `eps-${item.link.split("/").filter(Boolean).pop() ?? index}`,
        type: item.title,
        location: locationText ?? "Edmonton, AB",
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        timestamp: timestamp.toISOString(),
        source: "social",
        url: item.link || undefined,
      });
    }

    return incidents;
  } catch (err) {
    console.error("fetchSocialNews error:", err);
    return [];
  }
}
