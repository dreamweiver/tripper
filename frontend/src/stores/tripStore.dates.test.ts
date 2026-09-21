import { useTripStore } from "./tripStore";
import type { TripInput } from "@tripper/shared";

const input: TripInput = {
  destination: "Kyoto",
  startDate: "2999-01-01",
  endDate: "2999-01-03", // 3 days
};

beforeEach(() => {
  useTripStore.setState({ trips: [], events: [] });
  localStorage.clear();
});

// A real place stop on a given day; helper to keep the tests terse.
const addPlace = (tripId: string, dayIndex: number, title: string) =>
  useTripStore.getState().addEvent({ tripId, dayIndex, kind: "place", title, notes: [] });

const dayIndicesFor = (tripId: string) =>
  useTripStore
    .getState()
    .events.filter((e) => e.tripId === tripId)
    .map((e) => e.dayIndex);

describe("setTripDates", () => {
  it("keeps events on their calendar date when the range shifts", () => {
    const trip = useTripStore.getState().addTrip(input);
    const p = addPlace(trip.id, 1, "Kinkaku-ji"); // Jan 02

    // Shift start one day earlier: Jan 02 is now dayIndex 2.
    useTripStore.getState().setTripDates(trip.id, "2998-12-31", "2999-01-03");
    const moved = useTripStore.getState().events.find((e) => e.id === p.id);
    expect(moved?.dayIndex).toBe(2);
  });

  it("drops events that fall outside a shrunk range", () => {
    const trip = useTripStore.getState().addTrip(input);
    const keep = addPlace(trip.id, 0, "Gion");
    const drop = addPlace(trip.id, 2, "Arashiyama"); // Jan 03, trimmed away

    useTripStore.getState().setTripDates(trip.id, "2999-01-01", "2999-01-02"); // 2 days
    const events = useTripStore.getState().events;
    expect(events.find((e) => e.id === keep.id)).toBeTruthy();
    expect(events.find((e) => e.id === drop.id)).toBeUndefined();
  });

  it("seeds meals for newly added empty days", () => {
    const trip = useTripStore.getState().addTrip(input);
    addPlace(trip.id, 0, "Gion");

    // Grow to 5 days; days 3 and 4 are new and empty → each seeded with 3 meals.
    useTripStore.getState().setTripDates(trip.id, "2999-01-01", "2999-01-05");
    const meals = useTripStore
      .getState()
      .events.filter((e) => e.tripId === trip.id && e.kind === "meal");
    expect(meals.filter((e) => e.dayIndex === 3)).toHaveLength(3);
    expect(meals.filter((e) => e.dayIndex === 4)).toHaveLength(3);
  });

  it("updates the trip's start and end dates", () => {
    const trip = useTripStore.getState().addTrip(input);
    useTripStore.getState().setTripDates(trip.id, "2999-02-01", "2999-02-04");
    const after = useTripStore.getState().getTrip(trip.id);
    expect(after?.startDate).toBe("2999-02-01");
    expect(after?.endDate).toBe("2999-02-04");
  });

  it("leaves other trips' events untouched", () => {
    const a = useTripStore.getState().addTrip({ ...input, destination: "A" });
    const b = useTripStore.getState().addTrip({ ...input, destination: "B" });
    const bEvent = addPlace(b.id, 2, "B-only");
    useTripStore.getState().setTripDates(a.id, "2999-01-01", "2999-01-01");
    expect(useTripStore.getState().events.find((e) => e.id === bEvent.id)?.dayIndex).toBe(2);
  });
});

describe("deleteDay", () => {
  it("removes the day's events and shrinks the end date", () => {
    const trip = useTripStore.getState().addTrip(input); // 3 days
    const gone = addPlace(trip.id, 1, "middle");

    useTripStore.getState().deleteDay(trip.id, 1);
    expect(useTripStore.getState().events.find((e) => e.id === gone.id)).toBeUndefined();
    expect(useTripStore.getState().getTrip(trip.id)?.endDate).toBe("2999-01-02"); // 3 → 2 days
  });

  it("renumbers later days down by one", () => {
    const trip = useTripStore.getState().addTrip(input);
    addPlace(trip.id, 0, "day0");
    const later = addPlace(trip.id, 2, "day2");

    useTripStore.getState().deleteDay(trip.id, 1);
    expect(useTripStore.getState().events.find((e) => e.id === later.id)?.dayIndex).toBe(1);
    expect(dayIndicesFor(trip.id).sort()).toEqual([0, 1]);
  });

  it("refuses to delete the last remaining day", () => {
    const trip = useTripStore.getState().addTrip({ ...input, endDate: "2999-01-01" }); // 1 day
    addPlace(trip.id, 0, "only");
    useTripStore.getState().deleteDay(trip.id, 0);
    expect(useTripStore.getState().getTrip(trip.id)?.endDate).toBe("2999-01-01");
    expect(useTripStore.getState().events).toHaveLength(1);
  });
});
