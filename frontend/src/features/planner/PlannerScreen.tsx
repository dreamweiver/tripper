import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { tripDayCount } from "@tripper/shared";
import { useTripStore } from "../../stores/tripStore";
import { usePlannerEvents } from "./hooks/usePlannerEvents";
import { PlannerLayout } from "./PlannerLayout";
import { TripSummary } from "./TripSummary";
import { DaySection } from "./DaySection";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function dayLabel(startDate: string, offset: number): string {
  const [y, m, d] = startDate.split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + offset));
  return `${WEEKDAYS[date.getUTCDay()]} ${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

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
        <DaySection
          key={dayIndex}
          tripId={trip.id}
          dayIndex={dayIndex}
          date={dayLabel(trip.startDate, dayIndex)}
          destination={trip.destination}
          expanded={openDayIndex === dayIndex}
          onToggle={() => setOpenDayIndex((cur) => (cur === dayIndex ? -1 : dayIndex))}
        />
      ))}
    </div>
  );

  return <PlannerLayout timeline={timeline} map={<span>Map placeholder</span>} />;
}
