import { useCallback, useRef, useState } from "react";
import type { PlaceResult } from "@tripper/shared";
import { fetchSearch } from "../api";

interface PlaceSearchState {
  results: PlaceResult[];
  loading: boolean;
  error: string | null;
  searched: boolean; // true once a query has run or seed results were provided
  search: (query: string) => Promise<void>;
}

export function usePlaceSearch(
  initialResults?: PlaceResult[],
  bias?: { lat: number; lon: number },
): PlaceSearchState {
  const seeded = initialResults && initialResults.length > 0;
  const [results, setResults] = useState<PlaceResult[]>(initialResults ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(Boolean(seeded));
  // Once the user runs a manual query we stop accepting late-arriving seed
  // results so we don't clobber their search with background eatery results.
  const [manualSearchRun, setManualSearchRun] = useState(false);

  // The eatery modal opens before its nearby fetch resolves, so `initialResults`
  // can arrive after mount. Reflect it (until the user searches manually) using
  // the render-time "adjust state when a prop changes" pattern — no effect, so
  // no cascading-render lint violation.
  const [prevSeed, setPrevSeed] = useState(initialResults);
  if (initialResults !== prevSeed) {
    setPrevSeed(initialResults);
    if (!manualSearchRun && initialResults && initialResults.length > 0) {
      setResults(initialResults);
      setSearched(true);
    }
  }

  // Monotonic request id: type-ahead can fire several searches in flight at
  // once, so we only apply the response of the latest and drop stale ones.
  const reqId = useRef(0);
  // Last query we actually ran, so the debounced effect and the Enter/submit
  // path don't refetch the same term. Reset on error so a retry can re-run it.
  const lastQuery = useRef<string | null>(null);

  const biasLat = bias?.lat;
  const biasLon = bias?.lon;
  const search = useCallback(
    async (query: string) => {
      const q = query.trim();
      if (!q || q === lastQuery.current) return;
      lastQuery.current = q;
      const id = ++reqId.current;
      setManualSearchRun(true);
      setLoading(true);
      setError(null);
      setSearched(true);
      try {
        const bias =
          biasLat !== undefined && biasLon !== undefined
            ? { lat: biasLat, lon: biasLon }
            : undefined;
        const found = await fetchSearch(q, bias);
        if (id === reqId.current) setResults(found);
      } catch {
        if (id === reqId.current) {
          setError("Couldn't search right now, try again");
          setResults([]);
          lastQuery.current = null; // allow the same term to be retried
        }
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    [biasLat, biasLon],
  );

  return { results, loading, error, searched, search };
}
