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
}

const HEADINGS: Record<Placement, string> = {
  "day-end": "Near your last stop",
};

export function Suggestions({ placement, items, loading, error, onAdd, onRetry, heading }: SuggestionsProps) {
  if (!loading && !error && items.length === 0) return null;
  return (
    <section className={styles.suggestions}>
      <div className={styles.suggestionsHeading}>{heading ?? HEADINGS[placement]}</div>
      {error ? (
        <div className={styles.suggestionsError}>
          {error} <button type="button" onClick={onRetry}>Retry</button>
        </div>
      ) : loading ? (
        <div className={styles.suggestionsRow}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      ) : (
        <div className={styles.suggestionsRow}>
          {items.map((item) => (
            <SuggestionCard key={`${item.title}-${item.lat}-${item.lon}`} item={item} onAdd={onAdd} />
          ))}
        </div>
      )}
    </section>
  );
}
