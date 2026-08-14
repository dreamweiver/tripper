import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { TripListScreen } from "./TripListScreen";
import { useTripStore } from "../../stores/tripStore";

beforeEach(() => {
  useTripStore.setState({ trips: [] });
  localStorage.clear();
  // Stub the Wikipedia lookup the card makes on mount so the test stays offline.
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ thumbnail: { source: "https://img/tokyo.jpg" } }),
  }) as unknown as typeof fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("TripListScreen", () => {
  it("creates a trip end-to-end and shows it in the list", async () => {
    // Freeze "today" so the calendar opens on a known month with specific day cells.
    jest.useFakeTimers({ now: new Date(2999, 2, 1) });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <MemoryRouter>
        <TripListScreen />
      </MemoryRouter>,
    );
    expect(screen.getByText(/no trips yet/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /new trip/i }));
    await user.type(screen.getByLabelText(/where to/i), "Tokyo");
    await user.click(screen.getByRole("button", { name: /March 1st, 2999/ }));
    await user.click(screen.getByRole("button", { name: /March 7th, 2999/ }));

    // Real timers from here so the card's async image lookup flushes inside act().
    jest.useRealTimers();
    const realUser = userEvent.setup();
    await realUser.click(screen.getByRole("button", { name: /start planning/i }));

    expect(await screen.findByText("Trip to Tokyo")).toBeInTheDocument();
    expect(useTripStore.getState().trips).toHaveLength(1);
    await waitFor(() => {
      expect(document.querySelector("img")).toHaveAttribute("src", "https://img/tokyo.jpg");
    });
  });
});
