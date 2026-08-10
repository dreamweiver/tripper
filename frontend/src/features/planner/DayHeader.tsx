import styles from "./planner.module.scss";

interface DayHeaderProps {
  dayIndex: number;
  date: string; // preformatted display string e.g. "WED AUG 12"
}

export function DayHeader({ dayIndex, date }: DayHeaderProps) {
  return (
    <div className={styles.dayHeader}>
      DAY {dayIndex + 1} · {date}
    </div>
  );
}
