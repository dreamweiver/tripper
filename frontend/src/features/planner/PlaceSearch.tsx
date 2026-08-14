import { useEffect, useState } from "react";
import type { PlaceResult } from "@tripper/shared";
import { usePlaceSearch } from "./hooks/usePlaceSearch";
import { Spinner } from "./Spinner";
import styles from "./planner.module.scss";

interface PlaceSearchProps {
  onClose: () => void;
  onPick: (place: PlaceResult) => void;
  title?: string; // dialog heading, e.g. "Add a place" or "Add an eatery"
  initialResults?: PlaceResult[]; // prefilled results (e.g. nearby eateries)
  initialLoading?: boolean; // seed results are still being fetched in the bg
  bias?: { lat: number; lon: number }; // location bias for manual searches
}

// Rendered only while open, and remounted per open (parent supplies a `key`),
// so all state starts fresh each time — no results persist across opens.
export function PlaceSearch({
  onClose,
  onPick,
  title = "Add a place",
  initialResults,
  initialLoading = false,
  bias,
}: PlaceSearchProps) {
  const { results, loading, error, searched, search } = usePlaceSearch(initialResults, bias);
  const [query, setQuery] = useState("");
  // Seed fetch still running and the user hasn't searched or received any seed
  // results yet — show a spinner in place of the (empty) result list.
  const seeding = initialLoading && !searched && results.length === 0;

  // Lock page scroll while the modal is open so scrolling inside the dialog
  // (or over the backdrop) doesn't bleed through to the timeline behind it.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className={styles.searchOverlay} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={styles.searchDialog}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.searchHeader}>
          <h2 className={styles.searchTitle}>{title}</h2>
          <button type="button" aria-label="Close" className={styles.searchClose} onClick={onClose}>
            ×
          </button>
        </div>

        <form
          className={styles.searchForm}
          onSubmit={(e) => {
            e.preventDefault();
            void search(query);
          }}
        >
          <input
            type="search"
            aria-label="Search for a place"
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a place"
            autoFocus
          />
          <button type="submit" className={styles.searchSubmit}>
            Search
          </button>
        </form>

        {loading && <Spinner label="Searching…" />}
        {seeding && <Spinner label="Finding eateries…" />}
        {error && (
          <p className={styles.searchStatus} role="alert">
            {error}
          </p>
        )}
        {!loading && !seeding && !error && searched && results.length === 0 && (
          <p className={styles.searchStatus}>
            No places found{query.trim() ? ` for “${query}”` : ""}
          </p>
        )}

        {!seeding && (
          <ul className={styles.resultList}>
            {results.map((r) => (
              <li key={`${r.name}-${r.lat}-${r.lon}`}>
                <button type="button" className={styles.resultRow} onClick={() => onPick(r)}>
                  <span className={styles.resultName}>{r.name}</span>
                  {r.address && <span className={styles.resultAddress}>{r.address}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
