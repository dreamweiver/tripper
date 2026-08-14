import { jest } from "@jest/globals";
import { nearbyPlaces } from "./overpass.js";

const sample = {
  elements: [
    {
      type: "node",
      lat: 48.8635,
      lon: 2.3275,
      tags: { name: "Tuileries Garden", leisure: "park" },
    },
    { type: "node", lat: 48.86, lon: 2.336, tags: { name: "Palais Royal", tourism: "attraction" } },
    { type: "node", lat: 48.99, lon: 2.99, tags: { leisure: "park" } }, // no name -> dropped
  ],
};

afterEach(() => jest.restoreAllMocks());

test("maps Overpass elements to NearbyResult sorted by distance, dropping unnamed", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => sample }) as unknown as typeof fetch;
  const results = await nearbyPlaces(48.8606, 2.3376);
  expect(results.map((r) => r.name)).toEqual(["Palais Royal", "Tuileries Garden"]);
  expect(results[0]!.distance).toBeLessThanOrEqual(results[1]!.distance);
  expect(results.every((r) => r.name.length > 0)).toBe(true);
});

test("derives address from addr:* tags", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      elements: [
        {
          type: "node",
          lat: 48.86,
          lon: 2.33,
          tags: {
            name: "Café de Flore",
            amenity: "cafe",
            "addr:housenumber": "172",
            "addr:street": "Boulevard Saint-Germain",
            "addr:city": "Paris",
          },
        },
      ],
    }),
  }) as unknown as typeof fetch;
  const [r] = await nearbyPlaces(48.86, 2.33, { eateries: true });
  expect(r!.name).toBe("Café de Flore");
  expect(r!.address).toBe("172 Boulevard Saint-Germain, Paris");
});

test("falls back to a partial address from locality tags when street is absent", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      elements: [
        {
          type: "node",
          lat: 48.86,
          lon: 2.33,
          tags: {
            name: "Riverside Park",
            leisure: "park",
            "addr:suburb": "Le Marais",
            "addr:state": "Île-de-France",
          },
        },
      ],
    }),
  }) as unknown as typeof fetch;
  const [r] = await nearbyPlaces(48.86, 2.33);
  expect(r!.address).toBe("Le Marais, Île-de-France");
});

test("eateries mode queries restaurant/cafe/fast_food amenities", async () => {
  const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ elements: [] }) });
  global.fetch = fetchMock as unknown as typeof fetch;
  await nearbyPlaces(48.86, 2.33, { eateries: true });
  // Body is URLSearchParams-encoded, so the `|` alternation appears as %7C.
  const body = fetchMock.mock.calls[0][1].body as string;
  expect(body).toMatch(/restaurant%7Ccafe%7Cfast_food/);
});

test("non-eatery mode queries the attraction allowlist, excluding lodging/fuel/roads", async () => {
  const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ elements: [] }) });
  global.fetch = fetchMock as unknown as typeof fetch;
  await nearbyPlaces(48.86, 2.33);
  const body = fetchMock.mock.calls[0][1].body as string;
  // Allowlisted keys are present…
  expect(body).toMatch(/tourism/);
  expect(body).toMatch(/historic/);
  expect(body).toMatch(/place_of_worship/);
  expect(body).toMatch(/shop/);
  // …and value-less types are never requested.
  expect(body).not.toMatch(/hotel|guest_house|fuel|motorway|highway/);
});

test("categorises place_of_worship, historic and shop distinctly", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      elements: [
        {
          type: "node",
          lat: 48.86,
          lon: 2.33,
          tags: { name: "Sensoji", amenity: "place_of_worship" },
        },
        {
          type: "node",
          lat: 48.861,
          lon: 2.331,
          tags: { name: "Arc de Triomphe", historic: "monument" },
        },
        {
          type: "node",
          lat: 48.862,
          lon: 2.332,
          tags: { name: "Galeries Lafayette", shop: "mall" },
        },
      ],
    }),
  }) as unknown as typeof fetch;
  const results = await nearbyPlaces(48.86, 2.33);
  const byName = Object.fromEntries(results.map((r) => [r.name, r.category]));
  expect(byName["Sensoji"]).toBe("place_of_worship");
  expect(byName["Arc de Triomphe"]).toBe("historic");
  expect(byName["Galeries Lafayette"]).toBe("shop");
});

test("returns an empty array when there are no elements", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ elements: [] }),
  }) as unknown as typeof fetch;
  expect(await nearbyPlaces(0, 0)).toEqual([]);
});

test("throws on a non-ok upstream response", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 504 }) as unknown as typeof fetch;
  await expect(nearbyPlaces(0, 0)).rejects.toThrow();
});
