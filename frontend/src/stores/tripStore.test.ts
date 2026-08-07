import { useTripStore } from "./tripStore";
import type { TripInput } from "@tripper/shared";

const input: TripInput = {
  destination: "Paris",
  name: "",
  startDate: "2999-01-01",
  endDate: "2999-01-05",
};

beforeEach(() => {
  useTripStore.setState({ trips: [] });
  localStorage.clear();
});

describe("tripStore", () => {
  it("addTrip stamps id + createdAt and returns the trip", () => {
    const trip = useTripStore.getState().addTrip(input);
    expect(trip.id).toBeTruthy();
    expect(trip.createdAt).toBeTruthy();
    expect(trip.destination).toBe("Paris");
  });

  it("addTrip prepends newest first", () => {
    const a = useTripStore.getState().addTrip({ ...input, destination: "A" });
    const b = useTripStore.getState().addTrip({ ...input, destination: "B" });
    const trips = useTripStore.getState().trips;
    expect(trips[0]?.id).toBe(b.id);
    expect(trips[1]?.id).toBe(a.id);
  });

  it("removeTrip removes by id", () => {
    const trip = useTripStore.getState().addTrip(input);
    useTripStore.getState().removeTrip(trip.id);
    expect(useTripStore.getState().trips).toHaveLength(0);
  });

  it("getTrip finds by id", () => {
    const trip = useTripStore.getState().addTrip(input);
    expect(useTripStore.getState().getTrip(trip.id)?.id).toBe(trip.id);
  });

  it("persists under the tripper.trips key", () => {
    useTripStore.getState().addTrip(input);
    expect(localStorage.getItem("tripper.trips")).toContain("Paris");
  });
});
