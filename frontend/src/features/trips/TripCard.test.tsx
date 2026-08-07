import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TripCard } from "./TripCard";
import type { Trip } from "@tripper/shared";

const base: Trip = {
  id: "t1",
  destination: "Paris",
  name: "",
  startDate: "2026-08-12",
  endDate: "2026-08-18",
  createdAt: "2026-08-07T00:00:00.000Z",
};

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

  it("calls onDelete with the trip id", async () => {
    const onDelete = jest.fn();
    render(<TripCard trip={base} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith("t1");
  });
});
