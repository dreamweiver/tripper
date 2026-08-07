import { render, screen } from "@testing-library/react";
import { TripList } from "./TripList";
import type { Trip } from "@tripper/shared";

const trip: Trip = {
  id: "t1",
  destination: "Rome",
  name: "",
  startDate: "2026-09-01",
  endDate: "2026-09-04",
  createdAt: "2026-08-07T00:00:00.000Z",
};

describe("TripList", () => {
  it("renders the empty state when there are no trips", () => {
    render(<TripList trips={[]} onCreate={() => {}} onDelete={() => {}} />);
    expect(screen.getByText(/no trips yet/i)).toBeInTheDocument();
  });

  it("renders a card per trip when trips exist", () => {
    render(<TripList trips={[trip]} onCreate={() => {}} onDelete={() => {}} />);
    expect(screen.getByText("Trip to Rome")).toBeInTheDocument();
    expect(screen.queryByText(/no trips yet/i)).not.toBeInTheDocument();
  });
});
