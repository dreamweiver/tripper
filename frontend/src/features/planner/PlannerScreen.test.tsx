import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { PlannerScreen } from "./PlannerScreen";
import { useTripStore } from "../../stores/tripStore";

beforeEach(() => {
  useTripStore.setState({ trips: [], events: [] });
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => [] }) as unknown as typeof fetch;
});
afterEach(() => jest.restoreAllMocks());

function renderAt(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/trips/${id}`]}>
      <Routes>
        <Route path="/trips/:id" element={<PlannerScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

test("seeds meals for the trip and renders day headers", async () => {
  const trip = useTripStore.getState().addTrip({
    destination: "Paris",
    name: "",
    startDate: "2999-08-12",
    endDate: "2999-08-13",
  });
  renderAt(trip.id);
  expect(await screen.findByText(/DAY 1/)).toBeInTheDocument();
  expect(screen.getByText(/DAY 2/)).toBeInTheDocument();
  await waitFor(() => {
    expect(useTripStore.getState().events.filter((e) => e.kind === "meal")).toHaveLength(6);
  });
});

test("shows a not-found message for an unknown trip", () => {
  renderAt("missing");
  expect(screen.getByText(/trip not found/i)).toBeInTheDocument();
});
