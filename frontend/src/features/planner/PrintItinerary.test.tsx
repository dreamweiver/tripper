import { render, screen } from "@testing-library/react";
import type { Trip } from "@tripper/shared";
import type { PlannerDay } from "./hooks/usePlannerEvents";
import { PrintItinerary } from "./PrintItinerary";

const trip: Trip = {
  id: "t1",
  destination: "Kyoto",
  name: "Spring in Kyoto",
  startDate: "2999-04-01",
  endDate: "2999-04-02",
  createdAt: "2999-01-01T00:00:00.000Z",
};

const day = (dayIndex: number, events: PlannerDay["events"]): PlannerDay => ({
  dayIndex,
  events,
});

const ev = (e: Partial<PlannerDay["events"][number]>) =>
  ({ id: crypto.randomUUID(), notes: [], ...e }) as PlannerDay["events"][number];

test("renders the trip title and destination · days meta", () => {
  render(<PrintItinerary trip={trip} days={[day(0, [])]} />);
  expect(screen.getByRole("heading", { level: 1, name: "Spring in Kyoto" })).toBeInTheDocument();
  expect(screen.getByText(/Kyoto ·/)).toHaveTextContent("1 days");
});

test("shows 'Nothing planned yet.' for an empty day", () => {
  render(<PrintItinerary trip={trip} days={[day(0, [])]} />);
  expect(screen.getByText("Nothing planned yet.")).toBeInTheDocument();
});

test("lists a stop's time, title, address, and notes", () => {
  render(
    <PrintItinerary
      trip={trip}
      days={[
        day(0, [
          ev({
            time: "09:00",
            title: "Fushimi Inari",
            address: "68 Fukakusa",
            notes: ["Go early to beat crowds"],
          }),
        ]),
      ]}
    />,
  );
  expect(screen.getByText("09:00")).toBeInTheDocument();
  expect(screen.getByText("Fushimi Inari")).toBeInTheDocument();
  expect(screen.getByText("68 Fukakusa")).toBeInTheDocument();
  expect(screen.getByText("Go early to beat crowds")).toBeInTheDocument();
});

test("renders one section per day", () => {
  render(<PrintItinerary trip={trip} days={[day(0, []), day(1, [])]} />);
  expect(screen.getByText(/^Day 1 —/)).toBeInTheDocument();
  expect(screen.getByText(/^Day 2 —/)).toBeInTheDocument();
});
