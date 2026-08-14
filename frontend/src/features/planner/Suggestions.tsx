import { useState } from "react";
import { SuggestionCard, type SuggestionItem } from "./SuggestionCard";
import styles from "./planner.module.scss";

type Placement = "day-end";

interface SuggestionsProps {
  placement: Placement;
  items: SuggestionItem[];
  loading: boolean;
  error: string | null;
  onAdd: (item: SuggestionItem) => void;
  onRetry: () => void;
  heading?: string;
  // Changes when the underlying anchor changes, so pagination resets to the
  // first page for a fresh set of suggestions.
  resetKey?: string;
}

const HEADINGS: Record<Placement, string> = {
  "day-end": "Near your last stop",
};

const PAGE = 10;

export function Suggestions({
  placement,
  items,
  loading,
  error,
  onAdd,
  onRetry,
  heading,
  resetKey,
}: SuggestionsProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE);
  // Reset pagination to the first page when the anchor changes, using the
  // render-time "adjust state on prop change" pattern (no effect needed).
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setVisibleCount(PAGE);
  }

  // Stale-while-revalidate: only show the skeleton on the very first load (no
  // items yet). Once we have items, keep them visible during background
  // refetches so the list never blanks after adding a place.
  const showSkeleton = loading && items.length === 0;
  if (!loading && !error && items.length === 0) return null;

  const visible = items.slice(0, visibleCount);

  return (
    <section className={styles.suggestions}>
      <div className={styles.suggestionsHeading}>{heading ?? HEADINGS[placement]}</div>
      {error && items.length === 0 ? (
        <div className={styles.suggestionsError}>
          {error}{" "}
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : showSkeleton ? (
        <div className={styles.suggestionsRow}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      ) : (
        <div className={styles.suggestionsRow}>
          {visible.map((item) => (
            <SuggestionCard
              key={`${item.title}-${item.lat}-${item.lon}`}
              item={item}
              onAdd={onAdd}
            />
          ))}
          {visibleCount < items.length && (
            <button
              type="button"
              className={styles.suggestionMore}
              onClick={() => setVisibleCount((n) => n + PAGE)}
            >
              Show more
            </button>
          )}
        </div>
      )}
    </section>
  );
}
