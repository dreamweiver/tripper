import { useTripStore } from "./tripStore";

beforeEach(() => {
  useTripStore.setState({ trips: [], events: [] });
});

test("seedMealsForTrip seeds three meals per day only once", () => {
  useTripStore.getState().seedMealsForTrip("t1", 2);
  let events = useTripStore.getState().events;
  expect(events).toHaveLength(6); // 3 meals x 2 days
  expect(events.filter((e) => e.dayIndex === 0)).toHaveLength(3);

  // Idempotent: calling again does nothing because events already exist.
  useTripStore.getState().seedMealsForTrip("t1", 2);
  expect(useTripStore.getState().events).toHaveLength(6);
});

test("addEvent appends at the bottom of its day (order = maxOrder + 1)", () => {
  useTripStore.getState().seedMealsForTrip("t1", 1); // orders 0,1,2
  const created = useTripStore.getState().addEvent({
    tripId: "t1", dayIndex: 0, kind: "place", title: "Louvre", notes: [],
  });
  expect(created.order).toBe(3);
  expect(created.id).toBeTruthy();
});

test("insertEventBetween places an event at the midpoint order", () => {
  useTripStore.getState().seedMealsForTrip("t1", 1); // orders 0,1,2
  const day = useTripStore.getState().events.filter((e) => e.dayIndex === 0).sort((a, b) => a.order - b.order);
  const inserted = useTripStore.getState().insertEventBetween(
    "t1", 0, day[0]!.id, day[1]!.id, { kind: "place", title: "Cafe", notes: [] },
  );
  expect(inserted.order).toBe(0.5);
});

test("updateNotes, updateEvent, setEventImage and removeEvent mutate the right event", () => {
  const created = useTripStore.getState().addEvent({
    tripId: "t1", dayIndex: 0, kind: "place", title: "Louvre", notes: [],
  });
  useTripStore.getState().updateNotes(created.id, ["buy tickets"]);
  useTripStore.getState().updateEvent(created.id, { time: "10:00" });
  useTripStore.getState().setEventImage(created.id, "https://img/louvre.jpg");
  const after = useTripStore.getState().events.find((e) => e.id === created.id)!;
  expect(after.notes).toEqual(["buy tickets"]);
  expect(after.time).toBe("10:00");
  expect(after.imageUrl).toBe("https://img/louvre.jpg");

  useTripStore.getState().removeEvent(created.id);
  expect(useTripStore.getState().events.find((e) => e.id === created.id)).toBeUndefined();
});
