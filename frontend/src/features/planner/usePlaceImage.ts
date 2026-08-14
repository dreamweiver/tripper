import { useEffect, useState } from "react";
import { resolveDestinationImage } from "../trips/resolveDestinationImage";
import { categoryImage } from "./categoryImage";

type ImageStatus = "cached" | "loading" | "resolved" | "fallback";

interface PlaceImage {
  src: string;
  status: ImageStatus;
}

// Resolves a place thumbnail by title. If `cachedUrl` is present it is used
// directly; otherwise a Wikipedia lookup runs once, falling back to a
// category-specific generic image (so a restaurant and a station differ).
export function usePlaceImage(title: string, cachedUrl?: string, category?: string): PlaceImage {
  const [resolved, setResolved] = useState<{ src: string; status: ImageStatus } | null>(null);
  const fallback = categoryImage(category);

  useEffect(() => {
    if (cachedUrl) return;
    let cancelled = false;
    void resolveDestinationImage(title).then((url) => {
      if (cancelled) return;
      setResolved(url ? { src: url, status: "resolved" } : { src: fallback, status: "fallback" });
    });
    return () => {
      cancelled = true;
    };
  }, [title, cachedUrl, fallback]);

  if (cachedUrl) return { src: cachedUrl, status: "cached" };
  if (resolved) return resolved;
  return { src: fallback, status: "loading" };
}
