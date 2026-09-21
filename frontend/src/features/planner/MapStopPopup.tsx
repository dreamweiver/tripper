import { PlaceImage } from "./PlaceImage";
import { categoryEmoji, categoryLabel } from "./categoryImage";
import { placeNames } from "./placeNames";
import type { MapStop } from "./TripMap";
import styles from "./planner.module.scss";

// Popup card for a map marker, mirroring the planner card's category chip +
// photo/icon thumbnail. English-first (locale support is a later phase): show
// the English name as the primary label, falling back to the local name only
// when OSM has no English equivalent, with the local name kept as a muted
// subtitle for reference. The English title also drives a better photo lookup.
export function MapStopPopup({ stop }: { stop: MapStop }) {
  const { primary, local } = placeNames(stop.title, stop.nameEn);
  const label = categoryLabel(stop.category);
  return (
    <div className={styles.mapPopup}>
      <PlaceImage
        title={primary}
        cachedUrl={stop.imageUrl}
        category={stop.category}
        className={styles.mapPopupImage}
      />
      <div className={styles.mapPopupBody}>
        <div className={styles.mapPopupTitle}>{primary}</div>
        {local && <div className={styles.mapPopupSub}>{local}</div>}
        {label && (
          <span className={styles.mapPopupChip}>
            <span aria-hidden="true">{categoryEmoji(stop.category)}</span> {label}
          </span>
        )}
      </div>
    </div>
  );
}
