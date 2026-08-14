import styles from "./planner.module.scss";

interface SpinnerProps {
  label?: string;
}

export function Spinner({ label }: SpinnerProps) {
  return (
    <div className={styles.spinnerWrap} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      {label && <span>{label}</span>}
    </div>
  );
}
