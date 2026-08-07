import { Router } from "express";
import type { PlaceResult } from "@tripper/shared";
import { searchPlaces } from "../providers/nominatim.js";
import { TtlCache } from "../cache.js";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new TtlCache<PlaceResult[]>();

export function searchRouter(): Router {
  const router = Router();
  router.get("/", async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!q) {
      res.status(400).json({ error: "Missing query parameter q" });
      return;
    }
    const key = q.toLowerCase();
    const cached = cache.get(key);
    if (cached) {
      res.json(cached);
      return;
    }
    try {
      const results = await searchPlaces(q);
      cache.set(key, results, CACHE_TTL_MS);
      res.json(results);
    } catch {
      res.status(503).json({ error: "Search is unavailable right now" });
    }
  });
  return router;
}
