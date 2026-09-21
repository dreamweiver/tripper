import { forwardRef, type ReactNode } from "react";
import { tripTitle, type Trip } from "@tripper/shared";
import { useDestinationImage } from "../trips/useDestinationImage";
import { formatTripDates } from "../trips/formatTripDates";
import styles from "./planner.module.scss";

interface TripSummaryProps {
  trip: Trip;
  dayCount: number;
  // One flag per day: true when the day has at least one real place.
  plannedDays: boolean[];
  onSelectDay: (dayIndex: number) => void;
  // Optional overlay slot (top-right), e.g. the trip options menu.
  menu?: ReactNode;
}

// forwardRef exposes the sticky root <section> so the planner can measure its
// height and offset day-scroll targets to land just below it.
export const TripSummary = forwardRef<HTMLElement, TripSummaryProps>(function TripSummary(
  { trip, dayCount, plannedDays, onSelectDay, menu },
  ref,
) {
  const image = useDestinationImage(trip);
  const plannedCount = plannedDays.filter(Boolean).length;
  const pct = dayCount > 0 ? Math.round((plannedCount / dayCount) * 100) : 0;
  const daysLabel = dayCount === 1 ? "1 day" : `${dayCount} days`;

  return (
    <section ref={ref} className={styles.summary}>
      <img className={styles.summaryBg} src={image.src} alt="" aria-hidden="true" />
      <div className={styles.summaryScrim} aria-hidden="true" />
      {menu && <div className={styles.summaryMenu}>{menu}</div>}
      <div className={styles.summaryBody}>
        <h1 className={styles.summaryTitle}>{tripTitle(trip)}</h1>
        <div className={styles.summaryMeta}>
          <span className={styles.summaryDest}>📍 {trip.destination}</span>
          <span>🗓 {formatTripDates(trip.startDate, trip.endDate)}</span>
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
});
