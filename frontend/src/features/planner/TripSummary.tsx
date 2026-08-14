import { tripTitle, type Trip } from "@tripper/shared";
import { useDestinationImage } from "../trips/useDestinationImage";
import styles from "./planner.module.scss";

interface TripSummaryProps {
  trip: Trip;
  dayCount: number;
  // One flag per day: true when the day has at least one real place.
  plannedDays: boolean[];
  onSelectDay: (dayIndex: number) => void;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmt(date: string): { md: string; year: number } {
  const [y, m, d] = date.split("-").map(Number);
  return { md: `${MONTHS[(m ?? 1) - 1]} ${d ?? 1}`, year: y ?? 1970 };
}

// Human date range: "Aug 12 – Aug 16, 2026", collapsing the year when shared.
function dateRange(startDate: string, endDate: string): string {
  const s = fmt(startDate);
  const e = fmt(endDate);
  if (s.year === e.year) return `${s.md} – ${e.md}, ${e.year}`;
  return `${s.md}, ${s.year} – ${e.md}, ${e.year}`;
}

export function TripSummary({ trip, dayCount, plannedDays, onSelectDay }: TripSummaryProps) {
  const image = useDestinationImage(trip);
  const plannedCount = plannedDays.filter(Boolean).length;
  const pct = dayCount > 0 ? Math.round((plannedCount / dayCount) * 100) : 0;
  const daysLabel = dayCount === 1 ? "1 day" : `${dayCount} days`;

  return (
    <section className={styles.summary}>
      <img className={styles.summaryImage} src={image.src} alt="" aria-hidden="true" />
      <div className={styles.summaryBody}>
        <h1 className={styles.summaryTitle}>{tripTitle(trip)}</h1>
        <div className={styles.summaryMeta}>
          <span className={styles.summaryDest}>📍 {trip.destination}</span>
          <span>🗓 {dateRange(trip.startDate, trip.endDate)}</span>
          <span>· {daysLabel}</span>
        </div>

        <div className={styles.summaryProgress}>
          <div className={styles.summaryProgressLabel}>
            <span>Days planned</span>
            <span className={styles.summaryProgressCount}>
              {plannedCount} / {dayCount} · {pct}%
            </span>
          </div>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={plannedCount}
            aria-valuemin={0}
            aria-valuemax={dayCount}
            aria-label="Trip planning progress"
          >
            {plannedDays.map((planned, i) => (
              <button
                key={i}
                type="button"
                className={styles.progressSegment}
                data-planned={planned}
                aria-label={`Day ${i + 1}${planned ? " — planned" : " — no stops yet"}`}
                title={`Day ${i + 1}`}
                onClick={() => onSelectDay(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
