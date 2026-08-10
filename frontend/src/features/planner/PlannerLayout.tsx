import { useState, type ReactNode } from "react";
import styles from "./planner.module.scss";

interface PlannerLayoutProps {
  timeline: ReactNode;
  map: ReactNode;
}

// Single responsive shell. On wide screens CSS shows timeline + map side by side;
// on narrow screens the tabs switch between them. Tabs are always rendered for
// keyboard access; the active panel is shown.
export function PlannerLayout({ timeline, map }: PlannerLayoutProps) {
  const [tab, setTab] = useState<"timeline" | "map">("timeline");
  return (
    <div className={styles.layout}>
      <div className={styles.tabs} role="tablist">
        <button role="tab" aria-selected={tab === "timeline"} className={tab === "timeline" ? styles.tabActive : styles.tab} onClick={() => setTab("timeline")}>
          Timeline
        </button>
        <button role="tab" aria-selected={tab === "map"} className={tab === "map" ? styles.tabActive : styles.tab} onClick={() => setTab("map")}>
          Map
        </button>
      </div>
      {tab === "timeline" ? <div className={styles.timeline}>{timeline}</div> : <div className={styles.map}>{map}</div>}
    </div>
  );
}
