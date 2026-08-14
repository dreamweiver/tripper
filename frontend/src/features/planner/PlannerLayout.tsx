import { useState, type ReactNode } from "react";
import styles from "./planner.module.scss";

interface PlannerLayoutProps {
  timeline: ReactNode;
  map: ReactNode;
}

// Single responsive shell. On wide screens CSS shows timeline + map side by
// side and hides the tabs; on narrow screens the tabs switch between them.
// Both panels are always in the DOM; the active tab drives visibility on narrow
// screens via a data attribute, while CSS overrides it on wide screens.
export function PlannerLayout({ timeline, map }: PlannerLayoutProps) {
  const [tab, setTab] = useState<"timeline" | "map">("timeline");
  return (
    <div className={styles.layout} data-active={tab}>
      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          aria-selected={tab === "timeline"}
          className={tab === "timeline" ? styles.tabActive : styles.tab}
          onClick={() => setTab("timeline")}
        >
          Timeline
        </button>
        <button
          role="tab"
          aria-selected={tab === "map"}
          className={tab === "map" ? styles.tabActive : styles.tab}
          onClick={() => setTab("map")}
        >
          Map
        </button>
      </div>
      <div className={styles.panels}>
        <div className={styles.timeline} data-panel="timeline">
          {timeline}
        </div>
        <div className={styles.map} data-panel="map">
          {map}
        </div>
      </div>
    </div>
  );
}
