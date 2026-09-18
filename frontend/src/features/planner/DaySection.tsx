import { useEffect, useMemo, useState } from "react";
import type { PlaceResult } from "@tripper/shared";
import { useTripStore } from "../../stores/tripStore";
import { usePlannerEvents } from "./hooks/usePlannerEvents";
import { useNearbySuggestions, type SuggestionAnchor } from "./hooks/useNearbySuggestions";
import { fetchNearbyEateries, fetchSearch } from "./api";
import { DayHeader } from "./DayHeader";
import { EventCard } from "./EventCard";
import { MealAnchor } from "./MealAnchor";
import { Connector } from "./Connector";
import { StopMarker } from "./StopMarker";
import { Suggestions } from "./Suggestions";
import { NotesModal } from "./NotesModal";
import { PlaceSearch } from "./PlaceSearch";
import type { SuggestionItem } from "./SuggestionCard";
import styles from "./planner.module.scss";

interface DaySectionProps {
  tripId: string;
  dayIndex: number;
  date: string;
  destination: string;
  expanded: boolean;
  onToggle: () => void;
}

// Round coords so the same place added elsewhere in the trip is recognised
// despite tiny float differences between providers.
const placeKey = (lat?: number, lon?: number) =>
  lat !== undefined && lon !== undefined ? `${lat.toFixed(4)},${lon.toFixed(4)}` : null;

export function DaySection({
  tripId,
  dayIndex,
  date,
  destination,
  expanded,
  onToggle,
}: DaySectionProps) {
  const days = usePlannerEvents(tripId, dayIndex + 1);
  const day = days[dayIndex];
  const events = useMemo(() => (day ? day.events : []), [day]);

  const addEvent = useTripStore((s) => s.addEvent);
  const insertEventBetween = useTripStore((s) => s.insertEventBetween);
  const updateEvent = useTripStore((s) => s.updateEvent);
  const updateNotes = useTripStore((s) => s.updateNotes);
  const removeEvent = useTripStore((s) => s.removeEvent);

  const [searchOpen, setSearchOpen] = useState(false);
  const [openKey, setOpenKey] = useState(0);
  const [insertContext, setInsertContext] = useState<{
    beforeId?: string;
    afterId?: string;
  } | null>(null);
  // When set, picking a result replaces this meal anchor in place instead of
  // inserting a new event, so the chosen eatery takes over the meal's slot.
  const [replaceMealId, setReplaceMealId] = useState<string | null>(null);
  const [notesFor, setNotesFor] = useState<string | null>(null);
  const [searchTitle, setSearchTitle] = useState("Add a place");
  const [prefill, setPrefill] = useState<PlaceResult[] | undefined>(undefined);
  // True while nearby eateries are being fetched for the eatery modal, so the
  // modal can show a spinner instead of appearing empty.
  const [prefillLoading, setPrefillLoading] = useState(false);
  // Resolved centroid of the trip destination, used to bias searches on days
  // that have no places yet. Resolved lazily the first time it's needed.
  const [destCoords, setDestCoords] = useState<{ lat: number; lon: number } | undefined>(undefined);

  // Anchor = the last real place (meals excluded).
  const anchor: SuggestionAnchor | null = useMemo(() => {
    const places = events.filter(
      (e) => e.kind === "place" && e.lat !== undefined && e.lon !== undefined,
    );
    const last = places[places.length - 1];
    return last ? { lat: last.lat as number, lon: last.lon as number, destination } : null;
  }, [events, destination]);
  const nearby = useNearbySuggestions(anchor);

  // Whole-trip dedup: hide a suggestion if that place is already on ANY day.
  // Select the raw events array (stable reference) and derive the key set in a
  // memo — filtering inside the selector returns a new array each render and
  // sends Zustand's useSyncExternalStore into an infinite re-render loop.
  const allEvents = useTripStore((s) => s.events);
  const addedKeys = useMemo(() => {
    const set = new Set<string>();
    for (const e of allEvents) {
      if (e.tripId !== tripId || e.kind !== "place") continue;
      const k = placeKey(e.lat, e.lon);
      if (k) set.add(k);
    }
    return set;
  }, [allEvents, tripId]);
  const suggestionItems = useMemo(
    () => nearby.items.filter((it) => !addedKeys.has(`${it.lat.toFixed(4)},${it.lon.toFixed(4)}`)),
    [nearby.items, addedKeys],
  );

  // Bias for manual searches: prefer the day's last place, else the destination centroid.
  const searchBias = anchor ? { lat: anchor.lat, lon: anchor.lon } : destCoords;

  // Pre-resolve the destination centroid once so the first manual search on an
  // empty day is already location-biased rather than global.
  useEffect(() => {
    if (anchor || destCoords) return;
    let cancelled = false;
    void (async () => {
      try {
        const [origin] = await fetchSearch(destination);
        if (!cancelled && origin) setDestCoords({ lat: origin.lat, lon: origin.lon });
      } catch {
        // Non-fatal: searches just won't be biased until a place is added.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [anchor, destCoords, destination]);

  // Resolve (and cache) the origin coords to search around: last place, or the
  // destination centroid geocoded on demand.
  const resolveOrigin = async (): Promise<{ lat: number; lon: number } | undefined> => {
    if (anchor) return { lat: anchor.lat, lon: anchor.lon };
    if (destCoords) return destCoords;
    const [origin] = await fetchSearch(destination);
    if (origin) {
      const coords = { lat: origin.lat, lon: origin.lon };
      setDestCoords(coords);
      return coords;
    }
    return undefined;
  };

  const placeFromResult = (r: PlaceResult) => ({
    kind: "place" as const,
    title: r.name || r.title,
    lat: r.lat,
    lon: r.lon,
    ...(r.address ? { address: r.address } : {}),
    category: r.type || r.category,
    notes: [] as string[],
  });

  const handlePick = (r: PlaceResult) => {
    if (replaceMealId) {
      // Convert the meal anchor in place into the chosen eatery, keeping its
      // slot (order) and scheduled time so it takes over the placeholder.
      updateEvent(replaceMealId, placeFromResult(r));
    } else if (insertContext) {
      insertEventBetween(
        tripId,
        dayIndex,
        insertContext.beforeId,
        insertContext.afterId,
        placeFromResult(r),
      );
    } else {
      addEvent({ tripId, dayIndex, ...placeFromResult(r) });
    }
    setSearchOpen(false);
    setInsertContext(null);
    setReplaceMealId(null);
    setPrefill(undefined);
    setPrefillLoading(false);
  };

  const openAddPlace = () => {
    setInsertContext(null);
    setReplaceMealId(null);
    setPrefill(undefined);
    setPrefillLoading(false);
    setSearchTitle("Add a place");
    setOpenKey((k) => k + 1);
    setSearchOpen(true);
  };

  const openInsert = (beforeId?: string, afterId?: string) => {
    setInsertContext({ beforeId, afterId });
    setReplaceMealId(null);
    setPrefill(undefined);
    setPrefillLoading(false);
    setSearchTitle("Add a place");
    setOpenKey((k) => k + 1);
    setSearchOpen(true);
  };

  // Meal anchor -> open the search modal IMMEDIATELY (with a loading spinner)
  // then fetch nearby eateries in the background and feed them in as they
  // arrive. Opening first prevents the multi-second blank wait that led to
  // users tapping repeatedly and stacking modals. Picking a result replaces the
  // meal anchor in place (see handlePick) rather than adding a separate event.
  const openEateries = async (mealEventId: string) => {
    setInsertContext(null);
    setReplaceMealId(mealEventId);
    setSearchTitle("Add an eatery");
    setPrefill(undefined);
    setPrefillLoading(true);
    setOpenKey((k) => k + 1);
    setSearchOpen(true);
    try {
      const origin = await resolveOrigin();
      if (origin) {
        const eateries = await fetchNearbyEateries(origin.lat, origin.lon);
        setPrefill(
          eateries.map((e) => ({
            title: e.title,
            name: e.name,
            ...(e.address ? { address: e.address } : {}),
            lat: e.lat,
            lon: e.lon,
            category: e.category,
            type: e.category,
          })),
        );
      }
    } catch {
      // Leave the modal open with an empty prefill; the user can still search.
    } finally {
      setPrefillLoading(false);
    }
  };

  const handleAddSuggestion = (item: SuggestionItem) => {
    addEvent({
      tripId,
      dayIndex,
      kind: "place",
      title: item.title,
      lat: item.lat,
      lon: item.lon,
      ...(item.address ? { address: item.address } : {}),
      category: item.category,
      notes: [],
    });
  };

  const notesEvent = events.find((e) => e.id === notesFor);

  const stopCount = events.filter((e) => e.kind === "place").length;
  // Running stop number assigned to real places only (meals excluded), so the
  // spine reads 1, 2, 3… in visit order.
  let stopNo = 0;
  const coordOf = (e?: (typeof events)[number]) =>
    e && e.lat !== undefined && e.lon !== undefined ? { lat: e.lat, lon: e.lon } : undefined;

  return (
    <section>
      <DayHeader
        dayIndex={dayIndex}
        date={date}
        stopCount={stopCount}
        expanded={expanded}
        onToggle={onToggle}
      />
      {expanded && (
        <>
          {events.length > 0 && (
            <div className={styles.addRow}>
              <button
                type="button"
                className={styles.addRowButton}
                onClick={() => openInsert(undefined, events[0]?.id)}
              >
                ＋ Add a stop before
              </button>
            </div>
          )}
          {events.map((event, i) => {
            const number = event.kind === "place" ? ++stopNo : undefined;
            const next = events[i + 1];
            return (
              <div key={event.id} className={styles.timelineRow}>
                <div className={styles.timelineRail}>
                  <StopMarker number={number} />
                </div>
                <div className={styles.timelineContent}>
                  {event.kind === "meal" ? (
                    <MealAnchor
                      event={event}
                      onAddEatery={(id) => {
                        void openEateries(id);
                      }}
                    />
                  ) : (
                    <EventCard event={event} onEditNotes={setNotesFor} onRemove={removeEvent} />
                  )}
                  {i < events.length - 1 && (
                    <Connector
                      onInsert={() => openInsert(event.id, next?.id)}
                      from={coordOf(event)}
                      to={coordOf(next)}
                    />
                  )}
                </div>
              </div>
            );
          })}

          <div className={styles.addRow}>
            <button type="button" className={styles.addRowButton} onClick={openAddPlace}>
              ＋ Add a stop after
            </button>
          </div>

          <Suggestions
            placement="day-end"
            heading={anchor ? undefined : `Popular in ${destination}`}
            items={suggestionItems}
            loading={nearby.loading}
            error={nearby.error}
            onAdd={handleAddSuggestion}
            onRetry={nearby.retry}
            resetKey={anchor ? `${anchor.lat},${anchor.lon}` : destination}
          />
        </>
      )}
      {searchOpen && (
        <PlaceSearch
          key={openKey}
          title={searchTitle}
          initialResults={prefill}
          initialLoading={prefillLoading}
          bias={searchBias}
          onClose={() => {
            setSearchOpen(false);
            setInsertContext(null);
            setReplaceMealId(null);
            setPrefill(undefined);
            setPrefillLoading(false);
          }}
          onPick={handlePick}
        />
      )}
      {notesEvent && (
        <NotesModal
          title={notesEvent.title}
          notes={notesEvent.notes}
          open
          onSave={(next) => {
            updateNotes(notesEvent.id, next);
            setNotesFor(null);
          }}
          onClose={() => setNotesFor(null)}
        />
      )}
    </section>
  );
}
