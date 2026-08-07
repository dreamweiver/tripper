import { jest } from "@jest/globals";
import { nearbyPlaces } from "./overpass.js";

const sample = {
  elements: [
    { type: "node", lat: 48.8635, lon: 2.3275, tags: { name: "Tuileries Garden", leisure: "park" } },
    { type: "node", lat: 48.8600, lon: 2.3360, tags: { name: "Palais Royal", tourism: "attraction" } },
    { type: "node", lat: 48.99, lon: 2.99, tags: { leisure: "park" } }, // no name -> dropped
  ],
};

afterEach(() => jest.restoreAllMocks());

test("maps Overpass elements to NearbyResult sorted by distance, dropping unnamed", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => sample }) as unknown as typeof fetch;
  const results = await nearbyPlaces(48.8606, 2.3376);
  expect(results.map((r) => r.title)).toEqual(["Palais Royal", "Tuileries Garden"]);
  expect(results[0].distance).toBeLessThanOrEqual(results[1].distance);
  expect(results.every((r) => r.title.length > 0)).toBe(true);
});

test("returns an empty array when there are no elements", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ elements: [] }) }) as unknown as typeof fetch;
  expect(await nearbyPlaces(0, 0)).toEqual([]);
});

test("throws on a non-ok upstream response", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 504 }) as unknown as typeof fetch;
  await expect(nearbyPlaces(0, 0)).rejects.toThrow();
});
