import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TripListScreen } from "./TripListScreen";
import { useTripStore } from "../../stores/tripStore";

beforeEach(() => {
  useTripStore.setState({ trips: [] });
  localStorage.clear();
});

describe("TripListScreen", () => {
  it("creates a trip end-to-end and shows it in the list", async () => {
    // Freeze "today" so the calendar opens on a known month with specific day cells.
    jest.useFakeTimers({ now: new Date(2999, 2, 1) });
    try {
      render(<TripListScreen />);
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      expect(screen.getByText(/no trips yet/i)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /new trip/i }));

      await user.type(screen.getByLabelText(/where to/i), "Tokyo");
      await user.click(screen.getByRole("button", { name: /March 1st, 2999/ }));
      await user.click(screen.getByRole("button", { name: /March 7th, 2999/ }));
      await user.click(screen.getByRole("button", { name: /start planning/i }));

      expect(await screen.findByText("Trip to Tokyo")).toBeInTheDocument();
      expect(useTripStore.getState().trips).toHaveLength(1);
    } finally {
      jest.useRealTimers();
    }
  });
});
