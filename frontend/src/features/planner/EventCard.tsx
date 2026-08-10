import type { DecoratedEvent } from "./hooks/usePlannerEvents";
import { PlaceImage } from "./PlaceImage";
import { NotesList } from "./NotesList";
import styles from "./planner.module.scss";

interface EventCardProps {
  event: DecoratedEvent;
  onEditNotes: (eventId: string) => void;
  onRemove: (eventId: string) => void;
}

export function EventCard({ event, onEditNotes, onRemove }: EventCardProps) {
  const timing = [event.time, event.openHours ? `Open ${event.openHours}` : null, event.category]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className={styles.card}>
      <PlaceImage title={event.title} cachedUrl={event.imageUrl} className={styles.cardImage} />
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <b>{event.title}</b>
          <button type="button" aria-label={`Remove ${event.title}`} onClick={() => onRemove(event.id)}>
            ×
          </button>
        </div>
        <div className={styles.cardTiming}>{timing}</div>
        {event.outOfOrder && (
          <div className={styles.outOfOrder}>⚠ earlier than the stop above</div>
        )}
        <NotesList notes={event.notes} onExpand={() => onEditNotes(event.id)} />
      </div>
    </div>
  );
}
