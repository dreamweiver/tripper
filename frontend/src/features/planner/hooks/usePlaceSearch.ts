import { useCallback, useState } from "react";
import type { PlaceResult } from "@tripper/shared";
import { fetchSearch } from "../api";

interface PlaceSearchState {
  results: PlaceResult[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
}

export function usePlaceSearch(): PlaceSearchState {
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setResults(await fetchSearch(query.trim()));
    } catch {
      setError("Couldn't search right now, try again");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}
