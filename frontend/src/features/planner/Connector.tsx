import { quickestLeg, formatKm, formatMinutes, type TravelMode } from "@tripper/shared";
import styles from "./planner.module.scss";

interface Coord {
  lat: number;
  lon: number;
}

interface ConnectorProps {
  onInsert: () => void;
  from?: Coord;
  to?: Coord;
}

const MODE_ICON: Record<TravelMode, string> = { walk: "🚶", car: "🚗", train: "🚆" };
const MODE_LABEL: Record<TravelMode, string> = { walk: "Walk", car: "Drive", train: "Train" };

// Vertical link between two stops. Shows the quickest travel mode + time +
// distance when both endpoints have coordinates; otherwise a plain dashed line.
// The hover "+" (always in the DOM for accessibility) inserts a place here.
export function Connector({ onInsert, from, to }: ConnectorProps) {
  const leg = quickestLeg(from, to);
  return (
    <div className={styles.connector}>
      <span className={styles.connectorLine} aria-hidden="true" />
      {leg && (
        <span
          className={styles.connectorLeg}
          title={`${MODE_LABEL[leg.mode]} · ${formatMinutes(leg.minutes)} · ${formatKm(leg.km)}`}
        >
          <span aria-hidden="true">{MODE_ICON[leg.mode]}</span>
          {formatMinutes(leg.minutes)} · {formatKm(leg.km)}
        </span>
      )}
      <button
        type="button"
        className={styles.connectorInsert}
        aria-label="Insert place here"
        onClick={onInsert}
      >
        +
      </button>
    </div>
  );
}
