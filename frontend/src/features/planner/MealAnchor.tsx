import type { TimelineEvent } from "@tripper/shared";
import { mealEmoji } from "./mealMeta";
import styles from "./planner.module.scss";

interface MealAnchorProps {
  event: TimelineEvent;
  onAddEatery: (eventId: string) => void;
}

export function MealAnchor({ event, onAddEatery }: MealAnchorProps) {
  const emoji = mealEmoji(event.title);
  return (
    <button type="button" className={styles.mealAnchor} onClick={() => onAddEatery(event.id)}>
      <span className={styles.mealAnchorLabel}>
        <span aria-hidden="true">{emoji}</span> {event.title} · {event.time}
      </span>
      <span className={styles.mealAnchorAction}>+ add an eatery</span>
    </button>
  );
}
