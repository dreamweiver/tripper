import { renderHook, act, waitFor } from "@testing-library/react";
import { usePlaceSearch } from "./usePlaceSearch";

afterEach(() => jest.restoreAllMocks());

test("search populates results", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      { title: "Louvre", lat: 48.8, lon: 2.3, category: "tourism", type: "museum" },
    ],
  }) as unknown as typeof fetch;
  const { result } = renderHook(() => usePlaceSearch());
  await act(async () => {
    await result.current.search("louvre");
  });
  expect(result.current.results).toHaveLength(1);
  expect(result.current.error).toBeNull();
});

test("search sets an error when the request fails", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as unknown as typeof fetch;
  const { result } = renderHook(() => usePlaceSearch());
  await act(async () => {
    await result.current.search("boom");
  });
  await waitFor(() => expect(result.current.error).not.toBeNull());
});

test("empty query does not fetch", async () => {
  const fetchMock = jest.fn();
  global.fetch = fetchMock as unknown as typeof fetch;
  const { result } = renderHook(() => usePlaceSearch());
  await act(async () => {
    await result.current.search("   ");
  });
  expect(fetchMock).not.toHaveBeenCalled();
});

test("searched is false until a query runs, then true", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;
  const { result } = renderHook(() => usePlaceSearch());
  expect(result.current.searched).toBe(false);
  await act(async () => {
    await result.current.search("nowhere");
  });
  expect(result.current.searched).toBe(true);
});

test("initial seed populates results and marks searched", () => {
  const { result } = renderHook(() =>
    usePlaceSearch([
      { title: "Café", name: "Café", lat: 1, lon: 2, category: "amenity", type: "cafe" },
    ]),
  );
  expect(result.current.results).toHaveLength(1);
  expect(result.current.searched).toBe(true);
});
