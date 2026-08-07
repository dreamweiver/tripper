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
    render(<TripListScreen />);

    expect(screen.getByText(/no trips yet/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /new trip/i }));

    await userEvent.type(screen.getByLabelText(/where to/i), "Tokyo");
    await userEvent.type(screen.getByLabelText(/start date/i), "2999-03-01");
    await userEvent.type(screen.getByLabelText(/end date/i), "2999-03-07");
    await userEvent.click(screen.getByRole("button", { name: /start planning/i }));

    expect(await screen.findByText("Trip to Tokyo")).toBeInTheDocument();
    expect(useTripStore.getState().trips).toHaveLength(1);
  });
});
