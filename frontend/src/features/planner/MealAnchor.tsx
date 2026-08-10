import type { TimelineEvent } from "@tripper/shared";
import styles from "./planner.module.scss";

interface MealAnchorProps {
  event: TimelineEvent;
  onAddEatery: (eventId: string) => void;
}

export function MealAnchor({ event, onAddEatery }: MealAnchorProps) {
  return (
    <button type="button" className={styles.mealAnchor} onClick={() => onAddEatery(event.id)}>
      🍽 {event.title} {event.time} — tap to add an eatery
    </button>
  );
}
