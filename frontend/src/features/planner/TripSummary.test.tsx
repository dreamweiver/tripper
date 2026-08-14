import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Trip } from "@tripper/shared";
import { TripSummary } from "./TripSummary";

// useDestinationImage resolves via fetch; stub it to a no-thumbnail response so
// the component falls back to the bundled generic image without network noise.
beforeEach(() => {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({}) }) as unknown as typeof fetch;
});
afterEach(() => jest.restoreAllMocks());

const trip: Trip = {
  id: "t1",
  destination: "Paris",
  name: "",
  startDate: "2026-08-12",
  endDate: "2026-08-16",
  createdAt: "2026-08-01T00:00:00.000Z",
  imageUrl: "https://cached/paris.jpg", // avoids the async lookup path
};

test("shows the trip title, destination, date range and day count", () => {
  render(
    <TripSummary
      trip={trip}
      dayCount={5}
      plannedDays={[true, true, false, false, false]}
      onSelectDay={() => {}}
    />,
  );
  expect(screen.getByRole("heading", { name: /trip to paris/i })).toBeInTheDocument();
  expect(screen.getByText(/📍/)).toHaveTextContent("Paris");
  expect(screen.getByText(/aug 12 – aug 16, 2026/i)).toBeInTheDocument();
  expect(screen.getByText(/5 days/i)).toBeInTheDocument();
});

test("reports planning progress from the planned-day flags", () => {
  render(
    <TripSummary
      trip={trip}
      dayCount={5}
      plannedDays={[true, true, true, false, false]}
      onSelectDay={() => {}}
    />,
  );
  expect(screen.getByText(/3 \/ 5 · 60%/)).toBeInTheDocument();
  const bar = screen.getByRole("progressbar");
  expect(bar).toHaveAttribute("aria-valuenow", "3");
  expect(bar).toHaveAttribute("aria-valuemax", "5");
});

test("clicking a day segment selects that day", async () => {
  const onSelectDay = jest.fn();
  render(
    <TripSummary
      trip={trip}
      dayCount={3}
      plannedDays={[true, false, false]}
      onSelectDay={onSelectDay}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: /day 3/i }));
  expect(onSelectDay).toHaveBeenCalledWith(2);
});
