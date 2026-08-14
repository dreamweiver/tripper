import { TtlCache } from "./cache.js";

test("returns a stored value before it expires", () => {
  const cache = new TtlCache<string>();
  cache.set("k", "v", 1000);
  expect(cache.get("k")).toBe("v");
});

test("returns undefined after expiry", () => {
  let now = 0;
  const cache = new TtlCache<string>(() => now);
  cache.set("k", "v", 1000);
  now = 1001;
  expect(cache.get("k")).toBeUndefined();
});

test("returns undefined for an unknown key", () => {
  const cache = new TtlCache<string>();
  expect(cache.get("missing")).toBeUndefined();
});
