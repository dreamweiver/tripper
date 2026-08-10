import { useMemo, useState } from "react";
import type { PlaceResult } from "@tripper/shared";
import { useTripStore } from "../../stores/tripStore";
import { usePlannerEvents } from "./hooks/usePlannerEvents";
import { useNearbySuggestions, type SuggestionAnchor } from "./hooks/useNearbySuggestions";
import { DayHeader } from "./DayHeader";
import { EventCard } from "./EventCard";
import { MealAnchor } from "./MealAnchor";
import { Connector } from "./Connector";
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
}

export function DaySection({ tripId, dayIndex, date, destination }: DaySectionProps) {
  const days = usePlannerEvents(tripId, dayIndex + 1);
  const day = days[dayIndex];
  const events = useMemo(() => (day ? day.events : []), [day]);

  const addEvent = useTripStore((s) => s.addEvent);
  const insertEventBetween = useTripStore((s) => s.insertEventBetween);
  const updateNotes = useTripStore((s) => s.updateNotes);
  const removeEvent = useTripStore((s) => s.removeEvent);

  const [searchOpen, setSearchOpen] = useState(false);
  const [insertContext, setInsertContext] = useState<{ beforeId?: string; afterId?: string } | null>(null);
  const [notesFor, setNotesFor] = useState<string | null>(null);

  // Anchor = the last real place (meals excluded).
  const anchor: SuggestionAnchor | null = useMemo(() => {
    const places = events.filter((e) => e.kind === "place" && e.lat !== undefined && e.lon !== undefined);
    const last = places[places.length - 1];
    return last ? { lat: last.lat as number, lon: last.lon as number, destination } : null;
  }, [events, destination]);
  const nearby = useNearbySuggestions(anchor);

  const placeFromResult = (r: PlaceResult) => ({
    kind: "place" as const,
    title: r.title,
    lat: r.lat,
    lon: r.lon,
    category: r.type || r.category,
    notes: [] as string[],
  });

  const handlePick = (r: PlaceResult) => {
    if (insertContext) {
      insertEventBetween(tripId, dayIndex, insertContext.beforeId, insertContext.afterId, placeFromResult(r));
    } else {
      addEvent({ tripId, dayIndex, ...placeFromResult(r) });
    }
    setSearchOpen(false);
    setInsertContext(null);
  };

  const handleAddSuggestion = (item: SuggestionItem) => {
    addEvent({ tripId, dayIndex, kind: "place", title: item.title, lat: item.lat, lon: item.lon, category: item.category, notes: [] });
  };

  const notesEvent = events.find((e) => e.id === notesFor);

  return (
    <section>
      <DayHeader dayIndex={dayIndex} date={date} />
      {events.map((event, i) => (
        <div key={event.id}>
          {event.kind === "meal" ? (
            <MealAnchor event={event} onAddEatery={() => { setInsertContext(null); setSearchOpen(true); }} />
          ) : (
            <EventCard event={event} onEditNotes={setNotesFor} onRemove={removeEvent} />
          )}
          {i < events.length - 1 && (
            <Connector
              onInsert={() => {
                setInsertContext({ beforeId: event.id, afterId: events[i + 1]?.id });
                setSearchOpen(true);
              }}
            />
          )}
        </div>
      ))}

      <Suggestions
        placement="day-end"
        heading={anchor ? undefined : `Popular in ${destination}`}
        items={nearby.items}
        loading={nearby.loading}
        error={nearby.error}
        onAdd={handleAddSuggestion}
        onRetry={nearby.retry}
      />

      <div className={styles.addPlace}>
        <button type="button" onClick={() => { setInsertContext(null); setSearchOpen(true); }}>+ Add place</button>
      </div>

      <PlaceSearch open={searchOpen} onClose={() => { setSearchOpen(false); setInsertContext(null); }} onPick={handlePick} />
      {notesEvent && (
        <NotesModal
          title={notesEvent.title}
          notes={notesEvent.notes}
          open
          onSave={(next) => { updateNotes(notesEvent.id, next); setNotesFor(null); }}
          onClose={() => setNotesFor(null)}
        />
      )}
    </section>
  );
}
