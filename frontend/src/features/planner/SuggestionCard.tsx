import { PlaceImage } from "./PlaceImage";
import styles from "./planner.module.scss";

export interface SuggestionItem {
  title: string;
  category: string;
  distance?: number;
  address?: string;
  lat: number;
  lon: number;
}

interface SuggestionCardProps {
  item: SuggestionItem;
  onAdd: (item: SuggestionItem) => void;
}

export function SuggestionCard({ item, onAdd }: SuggestionCardProps) {
  const meta = [item.category, item.distance !== undefined ? `${item.distance} m` : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className={styles.suggestionCard}>
      <PlaceImage title={item.title} category={item.category} className={styles.suggestionImage} />
      <div className={styles.suggestionTitle}>{item.title}</div>
      <div className={styles.suggestionMeta}>{meta}</div>
      <button type="button" onClick={() => onAdd(item)}>
        + Add
      </button>
    </div>
  );
}
