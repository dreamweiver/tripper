import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trip, TripInput } from "@tripper/shared";

interface TripState {
  trips: Trip[];
  addTrip: (input: TripInput) => Trip;
  removeTrip: (id: string) => void;
  getTrip: (id: string) => Trip | undefined;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      addTrip: (input) => {
        const trip: Trip = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ trips: [trip, ...s.trips] }));
        return trip;
      },
      removeTrip: (id) =>
        set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),
      getTrip: (id) => get().trips.find((t) => t.id === id),
    }),
    { name: "tripper.trips", version: 1 },
  ),
);
