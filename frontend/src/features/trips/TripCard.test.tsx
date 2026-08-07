import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TripCard } from "./TripCard";
import { useTripStore } from "../../stores/tripStore";
import type { Trip } from "@tripper/shared";

const base: Trip = {
  id: "t1",
  destination: "Paris",
  name: "",
  startDate: "2026-08-12",
  endDate: "2026-08-18",
  createdAt: "2026-08-07T00:00:00.000Z",
  imageUrl: "https://img/paris.jpg", // cached -> no network in these cases
};

const originalFetch = global.fetch;

beforeEach(() => {
  useTripStore.setState({ trips: [] });
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

describe("TripCard", () => {
  it("shows the auto-title when name is blank", () => {
    render(<TripCard trip={base} onDelete={() => {}} />);
    expect(screen.getByText("Trip to Paris")).toBeInTheDocument();
  });

  it("shows the custom name when provided", () => {
    render(<TripCard trip={{ ...base, name: "Honeymoon" }} onDelete={() => {}} />);
    expect(screen.getByText("Honeymoon")).toBeInTheDocument();
  });

  it("shows the formatted date range", () => {
    render(<TripCard trip={base} onDelete={() => {}} />);
    expect(screen.getByText("Aug 12 – Aug 18, 2026")).toBeInTheDocument();
  });

  it("shows the inclusive day count", () => {
    render(<TripCard trip={base} onDelete={() => {}} />);
    expect(screen.getByText("7 days")).toBeInTheDocument();
  });

  it("renders the cached image url without fetching", () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    const { container } = render(<TripCard trip={base} onDelete={() => {}} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "https://img/paris.jpg");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resolves and caches an image when none is stored", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ thumbnail: { source: "https://img/resolved.jpg" } }),
    }) as unknown as typeof fetch;

    const uncached: Trip = { ...base, id: "t2", imageUrl: undefined };
    useTripStore.setState({ trips: [uncached] });

    const { container } = render(<TripCard trip={uncached} onDelete={() => {}} />);

    await waitFor(() => {
      expect(container.querySelector("img")).toHaveAttribute("src", "https://img/resolved.jpg");
    });
    expect(useTripStore.getState().getTrip("t2")?.imageUrl).toBe("https://img/resolved.jpg");
  });

  it("falls back to a generic image when resolution misses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: "Nowhere" }),
    }) as unknown as typeof fetch;

    const uncached: Trip = { ...base, id: "t3", destination: "Nowhere", imageUrl: undefined };
    const { container } = render(<TripCard trip={uncached} onDelete={() => {}} />);

    await waitFor(() => {
      expect(container.querySelector("img")).toHaveAttribute("src", "test-file-stub.svg");
    });
  });

  it("calls onDelete with the trip id", async () => {
    const onDelete = jest.fn();
    render(<TripCard trip={base} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith("t1");
  });
});
