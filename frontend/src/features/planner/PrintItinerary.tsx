import { tripTitle, type Trip } from "@tripper/shared";
import { formatTripDates } from "../trips/formatTripDates";
import { formatDayLabel } from "./formatDayLabel";
import { categoryLabel } from "./categoryImage";
import type { PlannerDay } from "./hooks/usePlannerEvents";
import styles from "./planner.module.scss";

interface PrintItineraryProps {
  trip: Trip;
  days: PlannerDay[];
  className?: string;
}

// A simple, print-friendly rendering of the timeline (left side only — no map,
// no photos). Hidden on screen; the print stylesheet reveals it and hides the
// interactive planner so "Export PDF" (browser Print → Save as PDF) yields a
// clean, selectable-text document.
export function PrintItinerary({ trip, days, className }: PrintItineraryProps) {
  return (
    <div className={className}>
      <header className={styles.printHeader}>
        <h1 className={styles.printTitle}>{tripTitle(trip)}</h1>
        <p className={styles.printMeta}>
          {trip.destination} · {formatTripDates(trip.startDate, trip.endDate)} · {days.length} days
        </p>
      </header>
      {days.map((day) => (
        <section key={day.dayIndex} className={styles.printDay}>
          <h2 className={styles.printDayHeading}>
            Day {day.dayIndex + 1} — {formatDayLabel(trip.startDate, day.dayIndex)}
          </h2>
          {day.events.length === 0 ? (
            <p className={styles.printEmpty}>Nothing planned yet.</p>
          ) : (
            <ol className={styles.printStops}>
              {day.events.map((e) => {
                const label = categoryLabel(e.category);
                return (
                  <li key={e.id} className={styles.printStop}>
                    {e.time && <span className={styles.printTime}>{e.time}</span>}
                    <span className={styles.printStopBody}>
                      <span className={styles.printStopName}>
                        {e.title}
                        {e.nameEn && e.nameEn !== e.title && (
                          <span className={styles.printStopEn}> · {e.nameEn}</span>
                        )}
                        {label && <span className={styles.printStopCat}> — {label}</span>}
                      </span>
                      {e.address && <span className={styles.printStopAddr}>{e.address}</span>}
                      {e.notes.length > 0 && (
                        <ul className={styles.printNotes}>
                          {e.notes.map((note, i) => (
                            <li key={i}>{note}</li>
                          ))}
                        </ul>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      ))}
    </div>
  );
}
