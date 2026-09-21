import type { DecoratedEvent } from "./hooks/usePlannerEvents";
import { useTripStore } from "../../stores/tripStore";
import { PlaceImage } from "./PlaceImage";
import { NotesList } from "./NotesList";
import { usePlaceDescription } from "./usePlaceDescription";
import { categoryLabel, categoryEmoji } from "./categoryImage";
import { mealEmoji } from "./mealMeta";
import styles from "./planner.module.scss";

interface EventCardProps {
  event: DecoratedEvent;
  onEditNotes: (eventId: string) => void;
  onRemove: (eventId: string) => void;
}

// Wanderlog-style place card: text column on the left (title, meta, address,
// blurb, notes), a larger rounded thumbnail on the right.
export function EventCard({ event, onEditNotes, onRemove }: EventCardProps) {
  const setEventImage = useTripStore((s) => s.setEventImage);
  const setEventDescription = useTripStore((s) => s.setEventDescription);
  const label = categoryLabel(event.category);
  const description = usePlaceDescription(event.title, event.description, (text) =>
    setEventDescription(event.id, text),
  );
  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.cardRemove}
        aria-label={`Remove ${event.title}`}
        onClick={() => onRemove(event.id)}
      >
        ×
      </button>
      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <span className={styles.cardTitleGroup}>
            <b className={styles.cardTitle}>{event.title}</b>
            {event.nameEn && <span className={styles.cardTitleEn}>{event.nameEn}</span>}
          </span>
          {event.mealSlot && (
            <span className={styles.mealBadge}>
              <span aria-hidden="true">{mealEmoji(event.mealSlot)}</span> {event.mealSlot}
            </span>
          )}
        </div>
        <div className={styles.cardMeta}>
          {label && (
            <span className={styles.categoryChip}>
              <span aria-hidden="true">{categoryEmoji(event.category)}</span> {label}
            </span>
          )}
          {event.time && <span className={styles.cardTime}>{event.time}</span>}
          {event.openHours && <span className={styles.cardOpen}>Open {event.openHours}</span>}
        </div>
        {event.address && <div className={styles.cardAddress}>{event.address}</div>}
        {description && <p className={styles.cardDescription}>{description}</p>}
        {event.outOfOrder && <div className={styles.outOfOrder}>⚠ earlier than the stop above</div>}
        <NotesList notes={event.notes} onExpand={() => onEditNotes(event.id)} />
        {event.notes.length === 0 && (
          <button type="button" className={styles.addNote} onClick={() => onEditNotes(event.id)}>
            ＋ note
          </button>
        )}
      </div>
      <PlaceImage
        title={event.title}
        cachedUrl={event.imageUrl}
        category={event.category}
        className={styles.cardImage}
        onResolved={(url) => setEventImage(event.id, url)}
      />
    </div>
  );
}
