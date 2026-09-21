import { useCallback, useEffect, useState } from "react";
import type { NearbyResult } from "@tripper/shared";
import { fetchNearby, fetchSearch } from "../api";
import type { SuggestionItem } from "../SuggestionCard";

export interface SuggestionAnchor {
  lat: number;
  lon: number;
  destination: string;
}

interface NearbyState {
  items: SuggestionItem[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useNearbySuggestions(anchor: SuggestionAnchor | null): NearbyState {
  const [items, setItems] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  useEffect(() => {
    if (!anchor) return;
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const nearby: NearbyResult[] = await fetchNearby(anchor.lat, anchor.lon);
        if (cancelled) return;
        if (nearby.length > 0) {
          setItems(
            nearby.map((n) => ({
              title: n.title,
              ...(n.nameEn ? { nameEn: n.nameEn } : {}),
              category: n.category,
              distance: n.distance,
              ...(n.address ? { address: n.address } : {}),
              lat: n.lat,
              lon: n.lon,
            })),
          );
        } else {
          const popular = await fetchSearch(anchor.destination);
          if (cancelled) return;
          setItems(
            popular.map((p) => ({
              title: p.title,
              ...(p.nameEn ? { nameEn: p.nameEn } : {}),
              category: p.category,
              ...(p.address ? { address: p.address } : {}),
              lat: p.lat,
              lon: p.lon,
            })),
          );
        }
      } catch {
        if (!cancelled) setError("Couldn't load suggestions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [anchor, attempt]);

  return { items, loading, error, retry };
}
