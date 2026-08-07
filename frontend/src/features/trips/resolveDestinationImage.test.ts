import { resolveDestinationImage } from "./resolveDestinationImage";

describe("resolveDestinationImage", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("returns the thumbnail source on a hit", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ thumbnail: { source: "https://img/paris.jpg" } }),
    }) as unknown as typeof fetch;

    await expect(resolveDestinationImage("Paris")).resolves.toBe("https://img/paris.jpg");
  });

  it("URL-encodes the destination in the request", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ thumbnail: { source: "https://img/x.jpg" } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await resolveDestinationImage("New York");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/page/summary/New%20York"),
      expect.anything(),
    );
  });

  it("returns null when the article has no thumbnail", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Nowhere" }),
    }) as unknown as typeof fetch;

    await expect(resolveDestinationImage("Nowhere")).resolves.toBeNull();
  });

  it("returns null on a non-ok response", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
    await expect(resolveDestinationImage("Paris")).resolves.toBeNull();
  });

  it("returns null when fetch rejects", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network")) as unknown as typeof fetch;
    await expect(resolveDestinationImage("Paris")).resolves.toBeNull();
  });

  it("returns null for a blank destination without fetching", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    await expect(resolveDestinationImage("   ")).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
