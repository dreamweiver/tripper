import { useTripStore } from "./tripStore";
import type { TripInput } from "@tripper/shared";

const input: TripInput = {
  destination: "Paris",
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

  it("setTripImage caches the resolved url on the trip", () => {
    const trip = useTripStore.getState().addTrip(input);
    useTripStore.getState().setTripImage(trip.id, "https://img/paris.jpg");
    expect(useTripStore.getState().getTrip(trip.id)?.imageUrl).toBe("https://img/paris.jpg");
  });

  it("setTripImage only touches the matching trip", () => {
    const a = useTripStore.getState().addTrip({ ...input, destination: "A" });
    const b = useTripStore.getState().addTrip({ ...input, destination: "B" });
    useTripStore.getState().setTripImage(a.id, "https://img/a.jpg");
    expect(useTripStore.getState().getTrip(a.id)?.imageUrl).toBe("https://img/a.jpg");
    expect(useTripStore.getState().getTrip(b.id)?.imageUrl).toBeUndefined();
  });

  it("persists under the tripper.trips key", () => {
    useTripStore.getState().addTrip(input);
    expect(localStorage.getItem("tripper.trips")).toContain("Paris");
  });

  it("rehydrates persisted trips from localStorage", async () => {
    const created = useTripStore.getState().addTrip(input);

    // Snapshot what persist wrote before clearing in-memory state.
    // setState is patched by zustand persist to also write to storage, so we
    // preserve the snapshot and restore it after wiping in-memory state.
    const snapshot = localStorage.getItem("tripper.trips");
    useTripStore.setState({ trips: [] });
    localStorage.setItem("tripper.trips", snapshot!);
    await useTripStore.persist.rehydrate();

    const rehydrated = useTripStore.getState().trips;
    expect(rehydrated).toHaveLength(1);
    expect(rehydrated[0]?.id).toBe(created.id);
  });
});
