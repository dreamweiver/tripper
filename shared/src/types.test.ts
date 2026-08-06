import { isMealKind } from "./index.js";

// Business logic: event "kind" discriminates places from meals; used app-wide.
test("isMealKind identifies meal events", () => {
  expect(isMealKind("meal")).toBe(true);
  expect(isMealKind("place")).toBe(false);
});
