import styles from "./planner.module.scss";

interface StopMarkerProps {
  // Numbered pin for a real place stop; meals render a muted dot instead.
  number?: number;
}

export function StopMarker({ number }: StopMarkerProps) {
  return (
    <span className={number === undefined ? styles.markerDot : styles.markerPin} aria-hidden="true">
      {number}
    </span>
  );
}
