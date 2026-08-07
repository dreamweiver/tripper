import { jest } from "@jest/globals";
import { searchPlaces } from "./nominatim.js";

const sample = [
  { display_name: "Louvre Museum, Paris", lat: "48.8606", lon: "2.3376", category: "tourism", type: "museum" },
];

afterEach(() => jest.restoreAllMocks());

test("maps Nominatim rows to PlaceResult and sends a User-Agent", async () => {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => sample,
  });
  global.fetch = fetchMock as unknown as typeof fetch;

  const results = await searchPlaces("louvre");

  expect(results).toEqual([
    { title: "Louvre Museum, Paris", lat: 48.8606, lon: 2.3376, category: "tourism", type: "museum" },
  ]);
  const init = fetchMock.mock.calls[0][1];
  expect(init.headers["User-Agent"]).toMatch(/tripper/i);
});

test("throws on a non-ok upstream response", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
  await expect(searchPlaces("x")).rejects.toThrow();
});
