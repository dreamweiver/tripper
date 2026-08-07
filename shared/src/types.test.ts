import { isMealKind } from "./types.js";
import type { PlaceResult, NearbyResult } from "./types.js";

test("isMealKind distinguishes meal from place", () => {
  expect(isMealKind("meal")).toBe(true);
  expect(isMealKind("place")).toBe(false);
});

test("PlaceResult and NearbyResult shapes are usable", () => {
  const p: PlaceResult = { title: "Louvre", lat: 48.8, lon: 2.3, category: "tourism", type: "museum" };
  const n: NearbyResult = { title: "Tuileries", lat: 48.86, lon: 2.32, category: "leisure", distance: 300 };
  expect(p.title).toBe("Louvre");
  expect(n.distance).toBe(300);
});
