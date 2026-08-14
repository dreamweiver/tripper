import styles from "./planner.module.scss";

interface DayHeaderProps {
  dayIndex: number;
  date: string; // preformatted display string e.g. "WED AUG 12"
  stopCount: number;
  expanded: boolean;
  onToggle: () => void;
}

export function DayHeader({ dayIndex, date, stopCount, expanded, onToggle }: DayHeaderProps) {
  const stops = stopCount === 1 ? "1 stop" : `${stopCount} stops`;
  return (
    <button
      type="button"
      className={styles.dayHeader}
      data-open={expanded}
      aria-expanded={expanded}
      onClick={onToggle}
    >
      <span className={styles.dayHeaderChevron} data-open={expanded} aria-hidden="true">
        ▾
      </span>
      <span className={styles.dayHeaderText}>
        DAY {dayIndex + 1} · {date} · {stops}
      </span>
    </button>
  );
}
