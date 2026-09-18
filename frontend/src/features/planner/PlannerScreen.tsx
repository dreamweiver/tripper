import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { tripDayCount } from "@tripper/shared";
import { useTripStore } from "../../stores/tripStore";
import { usePlannerEvents } from "./hooks/usePlannerEvents";
import { PlannerLayout } from "./PlannerLayout";
import { TripSummary } from "./TripSummary";
import { DaySection } from "./DaySection";
import { formatDayLabel } from "./formatDayLabel";
import styles from "./planner.module.scss";

export function PlannerScreen() {
  const { id } = useParams();
  const trip = useTripStore((s) => (id ? s.trips.find((t) => t.id === id) : undefined));
  const seedMealsForTrip = useTripStore((s) => s.seedMealsForTrip);

  const dayCount = trip ? tripDayCount(trip.startDate, trip.endDate) : 0;

  // Accordion: exactly one day expanded at a time to keep the timeline focused.
  const [openDayIndex, setOpenDayIndex] = useState(0);

  useEffect(() => {
    if (trip) seedMealsForTrip(trip.id, dayCount);
  }, [trip, dayCount, seedMealsForTrip]);

  // Subscribe so the screen re-renders as events change (grouping used by children).
  const days = usePlannerEvents(trip?.id ?? "", dayCount);
  // A day counts as "planned" once it has at least one real place (meals excluded).
  const plannedDays = useMemo(
    () => days.map((d) => d.events.some((e) => e.kind === "place")),
    [days],
  );

  if (!trip) {
    return (
      <div>
        <p>Trip not found.</p>
        <Link to="/">Back to trips</Link>
      </div>
    );
  }

  const timeline = (
    <div>
      <TripSummary
        trip={trip}
        dayCount={dayCount}
        plannedDays={plannedDays}
        onSelectDay={setOpenDayIndex}
      />
      {Array.from({ length: dayCount }, (_, dayIndex) => (
        <div key={dayIndex}>
          {dayIndex > 0 && <hr className={styles.dayDivider} />}
          <DaySection
            tripId={trip.id}
            dayIndex={dayIndex}
            date={formatDayLabel(trip.startDate, dayIndex)}
            destination={trip.destination}
            expanded={openDayIndex === dayIndex}
            onToggle={() => setOpenDayIndex((cur) => (cur === dayIndex ? -1 : dayIndex))}
          />
        </div>
      ))}
    </div>
  );

  return <PlannerLayout timeline={timeline} map={<span>Map placeholder</span>} />;
}
