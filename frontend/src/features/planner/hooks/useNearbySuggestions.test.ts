import { renderHook, waitFor } from "@testing-library/react";
import { useNearbySuggestions } from "./useNearbySuggestions";

afterEach(() => jest.restoreAllMocks());

const anchor = { lat: 48.86, lon: 2.33, destination: "Paris" };

test("returns nearby items when the nearby call has results", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      { title: "Tuileries", lat: 48.86, lon: 2.32, category: "leisure", distance: 300 },
    ],
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
      json: async () => [
        { title: "Notre-Dame", lat: 48.85, lon: 2.35, category: "tourism", type: "cathedral" },
      ],
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

test("keeps the previous items visible while a refetch is in flight (stale-while-revalidate)", async () => {
  let resolveSecond: (value: unknown) => void = () => {};
  const fetchMock = jest
    .fn()
    // first anchor -> resolves immediately with one item
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { title: "Louvre", lat: 48.86, lon: 2.33, category: "tourism", distance: 100 },
      ],
    })
    // second anchor -> stays pending so we can observe stale items
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSecond = resolve;
        }),
    );
  global.fetch = fetchMock as unknown as typeof fetch;

  const { result, rerender } = renderHook(({ a }) => useNearbySuggestions(a), {
    initialProps: { a: { lat: 48.86, lon: 2.33, destination: "Paris" } },
  });
  await waitFor(() => expect(result.current.items[0]?.title).toBe("Louvre"));

  // Change anchor -> triggers a refetch that is still pending.
  rerender({ a: { lat: 40.71, lon: -74.0, destination: "Paris" } });
  await waitFor(() => expect(result.current.loading).toBe(true));
  // Old items remain visible during the refetch instead of blanking.
  expect(result.current.items[0]?.title).toBe("Louvre");

  resolveSecond({
    ok: true,
    json: async () => [
      { title: "Central Park", lat: 40.78, lon: -73.96, category: "leisure", distance: 200 },
    ],
  });
  await waitFor(() => expect(result.current.items[0]?.title).toBe("Central Park"));
});
