import { useEffect, useState } from "react";
import type { Trip } from "@tripper/shared";
import { useTripStore } from "../../stores/tripStore";
import { resolveDestinationImage } from "./resolveDestinationImage";
import genericTrip from "../../assets/generic-trip.svg";

type ImageStatus = "cached" | "loading" | "resolved" | "fallback";

interface DestinationImage {
  src: string;
  status: ImageStatus;
}

/**
 * Returns the trip's thumbnail, using the cached URL when present and otherwise
 * resolving it once (lazily, on mount) and caching the result on the trip.
 * Falls back to a bundled generic image when no match is found.
 */
export function useDestinationImage(trip: Trip): DestinationImage {
  const setTripImage = useTripStore((s) => s.setTripImage);
  // Only the async lookup outcome is stateful; the cached URL is read directly.
  const [resolved, setResolved] = useState<{ src: string; status: ImageStatus } | null>(null);

  useEffect(() => {
    if (trip.imageUrl) return;

    let cancelled = false;
    void resolveDestinationImage(trip.destination).then((url) => {
      if (cancelled) return;
      if (url) {
        setTripImage(trip.id, url);
        setResolved({ src: url, status: "resolved" });
      } else {
        setResolved({ src: genericTrip, status: "fallback" });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [trip.id, trip.destination, trip.imageUrl, setTripImage]);

  if (trip.imageUrl) return { src: trip.imageUrl, status: "cached" };
  if (resolved) return resolved;
  return { src: genericTrip, status: "loading" };
}
