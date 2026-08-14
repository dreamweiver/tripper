import { jest } from "@jest/globals";
import { searchPlaces } from "./nominatim.js";

const sample = [
  {
    display_name: "Louvre Museum, Rue de Rivoli, Paris",
    name: "Louvre Museum",
    lat: "48.8606",
    lon: "2.3376",
    category: "tourism",
    type: "museum",
  },
];

afterEach(() => jest.restoreAllMocks());

test("maps Nominatim rows to PlaceResult with name/address split and requests English", async () => {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => sample,
  });
  global.fetch = fetchMock as unknown as typeof fetch;

  const results = await searchPlaces("louvre");

  expect(results).toEqual([
    {
      title: "Louvre Museum, Rue de Rivoli, Paris",
      name: "Louvre Museum",
      address: "Rue de Rivoli, Paris",
      lat: 48.8606,
      lon: 2.3376,
      category: "tourism",
      type: "museum",
    },
  ]);
  const url = fetchMock.mock.calls[0][0] as string;
  expect(url).toMatch(/accept-language=en/);
  const init = fetchMock.mock.calls[0][1];
  expect(init.headers["User-Agent"]).toMatch(/tripper/i);
});

test("falls back to the first display_name segment when name is absent", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      {
        display_name: "Eiffel Tower, Paris, France",
        lat: "48.85",
        lon: "2.29",
        category: "tourism",
        type: "attraction",
      },
    ],
  }) as unknown as typeof fetch;

  const [r] = await searchPlaces("eiffel");
  expect(r!.name).toBe("Eiffel Tower");
  expect(r!.address).toBe("Paris, France");
});

test("surfaces a partial address from trailing segments when name spans the whole label", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      {
        display_name: "Shibuya, Tokyo, Japan",
        name: "Shibuya, Tokyo, Japan",
        lat: "35.66",
        lon: "139.70",
        category: "place",
        type: "suburb",
      },
    ],
  }) as unknown as typeof fetch;

  const [r] = await searchPlaces("shibuya");
  expect(r!.name).toBe("Shibuya, Tokyo, Japan");
  expect(r!.address).toBe("Tokyo, Japan");
});

test("throws on a non-ok upstream response", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
  await expect(searchPlaces("x")).rejects.toThrow();
});
