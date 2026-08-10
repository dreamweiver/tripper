import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DaySection } from "./DaySection";
import { useTripStore } from "../../stores/tripStore";

beforeEach(() => {
  useTripStore.setState({ trips: [], events: [] });
  useTripStore.getState().seedMealsForTrip("t1", 1);
  // Nearby returns empty, then popular fallback returns empty -> no scroller noise.
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;
});
afterEach(() => jest.restoreAllMocks());

test("adding a place via search appends it to the day", async () => {
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    if (url.includes("/api/search")) {
      return Promise.resolve({
        ok: true,
        json: async () => [{ title: "Louvre", lat: 48.86, lon: 2.33, category: "tourism", type: "museum" }],
      });
    }
    return Promise.resolve({ ok: true, json: async () => [] }); // nearby
  });

  render(<DaySection tripId="t1" dayIndex={0} date="WED AUG 12" destination="Paris" />);
  await userEvent.click(screen.getByRole("button", { name: /add place/i }));
  await userEvent.type(screen.getByRole("searchbox"), "louvre");
  await userEvent.click(screen.getByRole("button", { name: /^search$/i }));
  await userEvent.click(await screen.findByText("Louvre"));

  await waitFor(() => {
    const events = useTripStore.getState().events.filter((e) => e.kind === "place");
    expect(events).toHaveLength(1);
    expect(events[0]!.title).toBe("Louvre");
  });
});
