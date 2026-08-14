import { fetchSearch, fetchNearby } from "./api";

afterEach(() => jest.restoreAllMocks());

test("fetchSearch calls /api/search with the encoded query and returns json", async () => {
  const fetchMock = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => [{ title: "Louvre" }] });
  global.fetch = fetchMock as unknown as typeof fetch;
  const results = await fetchSearch("new york");
  // URLSearchParams encodes spaces as "+".
  expect(fetchMock.mock.calls[0][0]).toContain("/api/search?q=new+york");
  expect(results).toEqual([{ title: "Louvre" }]);
});

test("fetchSearch throws on a non-ok response", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as unknown as typeof fetch;
  await expect(fetchSearch("x")).rejects.toThrow();
});

test("fetchNearby calls /api/nearby with lat and lon", async () => {
  const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
  global.fetch = fetchMock as unknown as typeof fetch;
  await fetchNearby(48.86, 2.33);
  expect(fetchMock.mock.calls[0][0]).toContain("/api/nearby?lat=48.86&lon=2.33");
});
