import { renderHook, waitFor } from "@testing-library/react";
import { useNearbySuggestions } from "./useNearbySuggestions";

afterEach(() => jest.restoreAllMocks());

const anchor = { lat: 48.86, lon: 2.33, destination: "Paris" };

test("returns nearby items when the nearby call has results", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [{ title: "Tuileries", lat: 48.86, lon: 2.32, category: "leisure", distance: 300 }],
  }) as unknown as typeof fetch;
  const { result } = renderHook(() => useNearbySuggestions(anchor));
  await waitFor(() => expect(result.current.items).toHaveLength(1));
  expect(result.current.items[0]?.title).toBe("Tuileries");
  expect(result.current.error).toBeNull();
});

test("falls back to popular search results when nearby is empty", async () => {
  const fetchMock = jest
    .fn()
    // first call: /api/nearby -> empty
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    // second call: /api/search (popular) -> one result
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{ title: "Notre-Dame", lat: 48.85, lon: 2.35, category: "tourism", type: "cathedral" }],
    });
  global.fetch = fetchMock as unknown as typeof fetch;
  const { result } = renderHook(() => useNearbySuggestions(anchor));
  await waitFor(() => expect(result.current.items).toHaveLength(1));
  expect(result.current.items[0]?.title).toBe("Notre-Dame");
  expect(fetchMock.mock.calls[1][0]).toContain("/api/search");
});

test("sets an error when nearby fails", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as unknown as typeof fetch;
  const { result } = renderHook(() => useNearbySuggestions(anchor));
  await waitFor(() => expect(result.current.error).not.toBeNull());
});

test("is idle with no items when anchor is null", () => {
  const fetchMock = jest.fn();
  global.fetch = fetchMock as unknown as typeof fetch;
  const { result } = renderHook(() => useNearbySuggestions(null));
  expect(result.current.items).toEqual([]);
  expect(fetchMock).not.toHaveBeenCalled();
});
