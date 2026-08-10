import styles from "./planner.module.scss";

interface ConnectorProps {
  onInsert: () => void;
}

// Grey dashed line between cards. The "+" is always in the DOM (accessible);
// CSS reveals it on hover/focus. Clicking inserts a place between neighbours.
export function Connector({ onInsert }: ConnectorProps) {
  return (
    <div className={styles.connector}>
      <span className={styles.connectorLine} aria-hidden="true" />
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
