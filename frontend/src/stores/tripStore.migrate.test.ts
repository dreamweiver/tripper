import { migrateTripState } from "./tripStore";
import type { Trip, TimelineEvent } from "@tripper/shared";

const trip = (over: Partial<Trip> = {}): Trip => ({
  id: "t1",
  destination: "Paris",
  name: "",
  startDate: "2026-08-12",
  endDate: "2026-08-16",
  createdAt: "2026-08-01T00:00:00.000Z",
  ...over,
});

const event = (over: Partial<TimelineEvent> = {}): TimelineEvent =>
  ({
    id: "e1",
    tripId: "t1",
    dayIndex: 0,
    order: 0,
    kind: "place",
    title: "Louvre",
    ...over,
  }) as TimelineEvent;

describe("migrateTripState", () => {
  it("strips cached image URLs from trips and events when migrating from < v3", () => {
    const migrated = migrateTripState(
      {
        trips: [trip({ imageUrl: "https://img/320px-paris.jpg" })],
        events: [event({ imageUrl: "https://img/320px-louvre.jpg" })],
      },
      2,
    );

    expect(migrated.trips[0]!.imageUrl).toBeUndefined();
    expect(migrated.events[0]!.imageUrl).toBeUndefined();
  });

  it("preserves all other trip/event fields", () => {
    const migrated = migrateTripState(
      { trips: [trip({ imageUrl: "https://img/x.jpg" })], events: [] },
      1,
    );
    expect(migrated.trips[0]!.destination).toBe("Paris");
    expect(migrated.trips[0]!.startDate).toBe("2026-08-12");
  });

  it("leaves already-current (v3) state untouched", () => {
    const current = { trips: [trip({ imageUrl: "https://img/keep.jpg" })], events: [] };
    const migrated = migrateTripState(current, 3);
    expect(migrated.trips[0]!.imageUrl).toBe("https://img/keep.jpg");
  });

  it("tolerates missing trips/events arrays", () => {
    const migrated = migrateTripState({}, 1);
    expect(migrated.trips).toEqual([]);
    expect(migrated.events).toEqual([]);
  });
});
