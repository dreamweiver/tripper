import { useEffect, useState } from "react";
import { resolveDestinationImage } from "../trips/resolveDestinationImage";
import genericTrip from "../../assets/generic-trip.svg";

type ImageStatus = "cached" | "loading" | "resolved" | "fallback";

interface PlaceImage {
  src: string;
  status: ImageStatus;
}

// Resolves a place thumbnail by title. If `cachedUrl` is present it is used
// directly; otherwise a Wikipedia lookup runs once, falling back to a generic image.
export function usePlaceImage(title: string, cachedUrl?: string): PlaceImage {
  const [resolved, setResolved] = useState<{ src: string; status: ImageStatus } | null>(null);

  useEffect(() => {
    if (cachedUrl) return;
    let cancelled = false;
    void resolveDestinationImage(title).then((url) => {
      if (cancelled) return;
      setResolved(url ? { src: url, status: "resolved" } : { src: genericTrip, status: "fallback" });
    });
    return () => {
      cancelled = true;
    };
  }, [title, cachedUrl]);

  if (cachedUrl) return { src: cachedUrl, status: "cached" };
  if (resolved) return resolved;
  return { src: genericTrip, status: "loading" };
}
