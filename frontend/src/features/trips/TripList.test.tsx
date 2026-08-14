import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { TripList } from "./TripList";
import type { Trip } from "@tripper/shared";

const renderWithRouter = (ui: ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

const trip: Trip = {
  id: "t1",
  destination: "Rome",
  name: "",
  startDate: "2026-09-01",
  endDate: "2026-09-04",
  createdAt: "2026-08-07T00:00:00.000Z",
  imageUrl: "https://img/rome.jpg", // cached -> card won't hit the network
};

describe("TripList", () => {
  it("renders the empty state when there are no trips", () => {
    renderWithRouter(<TripList trips={[]} onCreate={() => {}} onDelete={() => {}} />);
    expect(screen.getByText(/no trips yet/i)).toBeInTheDocument();
  });

  it("renders a card per trip when trips exist", () => {
    renderWithRouter(<TripList trips={[trip]} onCreate={() => {}} onDelete={() => {}} />);
    expect(screen.getByText("Trip to Rome")).toBeInTheDocument();
    expect(screen.queryByText(/no trips yet/i)).not.toBeInTheDocument();
  });
});
