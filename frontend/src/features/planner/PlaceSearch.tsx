import { useState } from "react";
import type { PlaceResult } from "@tripper/shared";
import { usePlaceSearch } from "./hooks/usePlaceSearch";
import styles from "./planner.module.scss";

interface PlaceSearchProps {
  open: boolean;
  onClose: () => void;
  onPick: (place: PlaceResult) => void;
}

export function PlaceSearch({ open, onClose, onPick }: PlaceSearchProps) {
  const { results, loading, error, search } = usePlaceSearch();
  const [query, setQuery] = useState("");
  if (!open) return null;
  return (
    <div role="dialog" aria-label="Add a place" className={styles.search}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void search(query);
        }}
      >
        <input
          type="search"
          aria-label="Search for a place"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a place"
        />
        <button type="submit">Search</button>
        <button type="button" onClick={onClose}>Close</button>
      </form>
      {loading && <p>Searching…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && results.length === 0 && query.trim() && <p>No places found for “{query}”</p>}
      <ul>
        {results.map((r) => (
          <li key={`${r.title}-${r.lat}-${r.lon}`}>
            <button type="button" onClick={() => onPick(r)}>{r.title}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
