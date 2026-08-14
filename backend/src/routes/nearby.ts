import { Router } from "express";
import type { NearbyResult } from "@tripper/shared";
import { nearbyPlaces } from "../providers/overpass.js";
import { TtlCache } from "../cache.js";

const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new TtlCache<NearbyResult[]>();

export function nearbyRouter(): Router {
  const router = Router();
  router.get("/", async (req, res) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const eateries = req.query.eateries === "1";
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      res.status(400).json({ error: "lat and lon must be numbers" });
      return;
    }
    const key = `${eateries ? "e:" : ""}${lat.toFixed(3)},${lon.toFixed(3)}`;
    const cached = cache.get(key);
    if (cached) {
      res.json(cached);
      return;
    }
    try {
      const results = await nearbyPlaces(lat, lon, { eateries });
      cache.set(key, results, CACHE_TTL_MS);
      res.json(results);
    } catch {
      res.status(503).json({ error: "Suggestions are unavailable right now" });
    }
  });
  return router;
}
