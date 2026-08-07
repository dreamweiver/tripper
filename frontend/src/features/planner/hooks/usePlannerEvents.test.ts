import { renderHook } from "@testing-library/react";
import { useTripStore } from "../../../stores/tripStore";
import { usePlannerEvents } from "./usePlannerEvents";

beforeEach(() => {
  useTripStore.setState({ trips: [], events: [] });
});

test("groups events by day, sorted by order, with out-of-order flags", () => {
  const store = useTripStore.getState();
  store.addEvent({ tripId: "t1", dayIndex: 0, kind: "place", title: "A", time: "09:00", notes: [] });
  store.addEvent({ tripId: "t1", dayIndex: 0, kind: "place", title: "B", time: "08:30", notes: [] });
  store.addEvent({ tripId: "t1", dayIndex: 1, kind: "place", title: "C", time: "10:00", notes: [] });

  const { result } = renderHook(() => usePlannerEvents("t1", 2));
  const days = result.current;
  expect(days).toHaveLength(2);
  expect(days[0]!.events.map((e) => e.title)).toEqual(["A", "B"]); // preserves insertion order
  expect(days[0]!.events[0]!.outOfOrder).toBe(false); // first is never flagged
  expect(days[0]!.events[1]!.outOfOrder).toBe(true);  // 08:30 after 09:00
  expect(days[1]!.events[0]!.outOfOrder).toBe(false);
});
