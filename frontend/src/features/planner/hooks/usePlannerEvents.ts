import { useMemo } from "react";
import type { TimelineEvent } from "@tripper/shared";
import { isOutOfOrder } from "@tripper/shared";
import { useTripStore } from "../../../stores/tripStore";

export interface DecoratedEvent extends TimelineEvent {
  outOfOrder: boolean;
}

export interface PlannerDay {
  dayIndex: number;
  events: DecoratedEvent[];
}

export function usePlannerEvents(tripId: string, dayCount: number): PlannerDay[] {
  const events = useTripStore((s) => s.events);

  return useMemo(() => {
    const days: PlannerDay[] = [];
    for (let day = 0; day < dayCount; day++) {
      const sorted = events
        .filter((e) => e.tripId === tripId && e.dayIndex === day)
        .sort((a, b) => a.order - b.order);
      const decorated: DecoratedEvent[] = sorted.map((e, i) => ({
        ...e,
        outOfOrder: isOutOfOrder(sorted[i - 1]?.time, e.time),
      }));
      days.push({ dayIndex: day, events: decorated });
    }
    return days;
  }, [events, tripId, dayCount]);
}
