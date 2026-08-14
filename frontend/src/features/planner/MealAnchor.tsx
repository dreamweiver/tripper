import type { TimelineEvent } from "@tripper/shared";
import styles from "./planner.module.scss";

interface MealAnchorProps {
  event: TimelineEvent;
  onAddEatery: (eventId: string) => void;
}

const MEAL_EMOJI: Record<string, string> = {
  Breakfast: "🥐",
  Lunch: "🥗",
  Dinner: "🍷",
};

export function MealAnchor({ event, onAddEatery }: MealAnchorProps) {
  const emoji = MEAL_EMOJI[event.title] ?? "🍽";
  return (
    <button type="button" className={styles.mealAnchor} onClick={() => onAddEatery(event.id)}>
      <span className={styles.mealAnchorLabel}>
        <span aria-hidden="true">{emoji}</span> {event.title} · {event.time}
      </span>
      <span className={styles.mealAnchorAction}>+ add an eatery</span>
    </button>
  );
}
