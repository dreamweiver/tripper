import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DaySection } from "./DaySection";
import { useTripStore } from "../../stores/tripStore";

beforeEach(() => {
  useTripStore.setState({ trips: [], events: [] });
  useTripStore.getState().seedMealsForTrip("t1", 1);
  // Nearby returns empty, then popular fallback returns empty -> no scroller noise.
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;
});
afterEach(() => jest.restoreAllMocks());

test("adding a place via search appends it to the day", async () => {
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    if (url.includes("/api/search")) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          {
            title: "Louvre Museum, Paris",
            name: "Louvre",
            address: "Paris",
            lat: 48.86,
            lon: 2.33,
            category: "tourism",
            type: "museum",
          },
        ],
      });
    }
    return Promise.resolve({ ok: true, json: async () => [] }); // nearby
  });

  render(
    <DaySection
      tripId="t1"
      dayIndex={0}
      date="WED AUG 12"
      weekend={false}
      destination="Paris"
      expanded
      onToggle={() => {}}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: /add a stop after/i }));
  await userEvent.type(screen.getByRole("searchbox"), "louvre");
  await userEvent.click(screen.getByRole("button", { name: /^search$/i }));
  await userEvent.click(await screen.findByText("Louvre"));

  await waitFor(() => {
    const events = useTripStore.getState().events.filter((e) => e.kind === "place");
    expect(events).toHaveLength(1);
    expect(events[0]!.title).toBe("Louvre");
  });
});

test("tapping a meal anchor opens the modal prefilled with nearby eateries", async () => {
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    if (url.includes("eateries=1")) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          {
            title: "Café de Flore",
            name: "Café de Flore",
            address: "Paris",
            lat: 48.85,
            lon: 2.33,
            category: "amenity",
            distance: 120,
          },
        ],
      });
    }
    if (url.includes("/api/search")) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          { title: "Paris", name: "Paris", lat: 48.85, lon: 2.35, category: "place", type: "city" },
        ],
      });
    }
    return Promise.resolve({ ok: true, json: async () => [] }); // nearby suggestions
  });

  render(
    <DaySection
      tripId="t1"
      dayIndex={0}
      date="WED AUG 12"
      weekend={false}
      destination="Paris"
      expanded
      onToggle={() => {}}
    />,
  );
  await userEvent.click(screen.getAllByRole("button", { name: /add an eatery/i })[0]!);

  expect(await screen.findByText("Café de Flore")).toBeInTheDocument();
  expect(screen.getByRole("dialog", { name: /add an eatery/i })).toBeInTheDocument();
});
