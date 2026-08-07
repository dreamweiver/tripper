import { renderHook, waitFor } from "@testing-library/react";
import { usePlaceImage } from "./usePlaceImage";

afterEach(() => jest.restoreAllMocks());

test("returns a cached url immediately without fetching", () => {
  const fetchMock = jest.fn();
  global.fetch = fetchMock as unknown as typeof fetch;
  const { result } = renderHook(() => usePlaceImage("Louvre", "https://cached/louvre.jpg"));
  expect(result.current.src).toBe("https://cached/louvre.jpg");
  expect(fetchMock).not.toHaveBeenCalled();
});

test("resolves via Wikipedia when no cached url is given", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ thumbnail: { source: "https://img/louvre.jpg" } }),
  }) as unknown as typeof fetch;
  const { result } = renderHook(() => usePlaceImage("Louvre"));
  await waitFor(() => expect(result.current.src).toBe("https://img/louvre.jpg"));
});

test("falls back to the generic image when nothing is found", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as unknown as typeof fetch;
  const { result } = renderHook(() => usePlaceImage("Nowheresville"));
  await waitFor(() => expect(result.current.src).toBe("test-file-stub.svg"));
});
