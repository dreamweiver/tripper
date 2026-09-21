import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { tripDayCount } from "@tripper/shared";
import { useTripStore } from "../../stores/tripStore";
import { usePlannerEvents } from "./hooks/usePlannerEvents";
import { PlannerLayout } from "./PlannerLayout";
import { TripSummary } from "./TripSummary";
import { TripMenu } from "./TripMenu";
import { EditTripModal } from "./EditTripModal";
import { PrintItinerary } from "./PrintItinerary";
import { DaySection } from "./DaySection";
import { TripMap, type MapStop } from "./TripMap";
import { buildItineraryMailto } from "./itinerary";
import { formatDayLabel, isWeekendDay } from "./formatDayLabel";
import styles from "./planner.module.scss";

export function PlannerScreen() {
  const { id } = useParams();
  const trip = useTripStore((s) => (id ? s.trips.find((t) => t.id === id) : undefined));
  const seedMealsForTrip = useTripStore((s) => s.seedMealsForTrip);

  const dayCount = trip ? tripDayCount(trip.startDate, trip.endDate) : 0;

  // Accordion: exactly one day expanded at a time to keep the timeline focused.
  const [openDayIndex, setOpenDayIndex] = useState(0);
  // Keep the open day in range if the trip shrank (day deleted / range trimmed).
  // Adjusting state during render (rather than in an effect) is React's
  // recommended way to derive state from props without an extra commit.
  if (dayCount > 0 && openDayIndex > dayCount - 1) setOpenDayIndex(dayCount - 1);
  // Trip options menu → Edit modal.
  const [editOpen, setEditOpen] = useState(false);

  // One wrapper ref per day so the top progress bar can scroll a day into view.
  const dayRefs = useRef<Array<HTMLDivElement | null>>([]);
  // The sticky trip-summary header; we measure it so a scrolled-to day lands
  // just below it instead of hidden underneath.
  const summaryRef = useRef<HTMLElement>(null);

  // Selecting a day from the progress bar: expand it, then scroll it just below
  // the sticky summary. rAF lets the accordion expand (layout settle) first, and
  // scroll-margin-top offsets the target by the sticky header's current height.
  const handleSelectDay = (dayIndex: number) => {
    setOpenDayIndex(dayIndex);
    requestAnimationFrame(() => {
      const el = dayRefs.current[dayIndex];
      if (!el) return;
      const offset = summaryRef.current?.offsetHeight ?? 0;
      el.style.scrollMarginTop = `${offset + 12}px`;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

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

  // Stops to plot on the map: the open day's real places that have coords,
  // numbered to match the timeline spine (every place counts, even without
  // coords, so the pin numbers line up with the visible stop numbers).
  const mapStops = useMemo<MapStop[]>(() => {
    const openDay = openDayIndex >= 0 ? days[openDayIndex] : undefined;
    if (!openDay) return [];
    const out: MapStop[] = [];
    let n = 0;
    for (const e of openDay.events) {
      if (e.kind !== "place") continue;
      n += 1;
      if (e.lat !== undefined && e.lon !== undefined) {
        out.push({
          id: e.id,
          number: n,
          title: e.title,
          ...(e.nameEn ? { nameEn: e.nameEn } : {}),
          ...(e.category ? { category: e.category } : {}),
          ...(e.imageUrl ? { imageUrl: e.imageUrl } : {}),
          lat: e.lat,
          lon: e.lon,
        });
      }
    }
    return out;
  }, [days, openDayIndex]);

  if (!trip) {
    return (
      <div>
        <p>Trip not found.</p>
        <Link to="/">Back to trips</Link>
      </div>
    );
  }

  const handleExport = () => window.print();
  const handleShare = () => {
    window.location.href = buildItineraryMailto(trip, days);
  };

  const timeline = (
    <div>
      <TripSummary
        ref={summaryRef}
        trip={trip}
        dayCount={dayCount}
        plannedDays={plannedDays}
        onSelectDay={handleSelectDay}
        menu={
          <TripMenu
            onEdit={() => setEditOpen(true)}
            onExport={handleExport}
            onShareEmail={handleShare}
          />
        }
      />
      {Array.from({ length: dayCount }, (_, dayIndex) => (
        <div
          key={dayIndex}
          ref={(el) => {
            dayRefs.current[dayIndex] = el;
          }}
        >
          {dayIndex > 0 && <hr className={styles.dayDivider} />}
          <DaySection
            tripId={trip.id}
            dayIndex={dayIndex}
            date={formatDayLabel(trip.startDate, dayIndex)}
            weekend={isWeekendDay(trip.startDate, dayIndex)}
            destination={trip.destination}
            expanded={openDayIndex === dayIndex}
            onToggle={() => setOpenDayIndex((cur) => (cur === dayIndex ? -1 : dayIndex))}
          />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className={styles.screenOnly}>
        <PlannerLayout
          timeline={timeline}
          map={<TripMap stops={mapStops} destination={trip.destination} />}
        />
      </div>
      <PrintItinerary trip={trip} days={days} className={styles.printOnly} />
      <EditTripModal trip={trip} days={days} open={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}
