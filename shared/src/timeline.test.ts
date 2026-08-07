import { seedMeals, insertOrder, isOutOfOrder } from "./timeline.js";

test("seedMeals returns three meal events with default times and spaced order", () => {
  const meals = seedMeals("trip1", 0);
  expect(meals).toHaveLength(3);
  expect(meals.map((m) => m.time)).toEqual(["08:00", "12:30", "20:30"]);
  expect(meals.every((m) => m.kind === "meal")).toBe(true);
  expect(meals.every((m) => m.tripId === "trip1" && m.dayIndex === 0)).toBe(true);
  expect(meals.map((m) => m.order)).toEqual([0, 1, 2]);
  expect(meals.every((m) => Array.isArray(m.notes) && m.notes.length === 0)).toBe(true);
});

test("seedMeals stamps unique ids", () => {
  const ids = seedMeals("trip1", 1).map((m) => m.id);
  expect(new Set(ids).size).toBe(3);
});

test("insertOrder returns midpoint between two neighbours", () => {
  expect(insertOrder(2, 4)).toBe(3);
});

test("insertOrder handles the ends", () => {
  expect(insertOrder(5, undefined)).toBe(6); // after the last
  expect(insertOrder(undefined, 5)).toBe(4); // before the first
  expect(insertOrder(undefined, undefined)).toBe(0); // empty day
});

test("isOutOfOrder is true only when a time is earlier than the previous", () => {
  expect(isOutOfOrder("09:00", "08:30")).toBe(true);
  expect(isOutOfOrder("09:00", "10:00")).toBe(false);
  expect(isOutOfOrder("09:00", "09:00")).toBe(false);
  expect(isOutOfOrder(undefined, "08:00")).toBe(false);
  expect(isOutOfOrder("09:00", undefined)).toBe(false);
});
