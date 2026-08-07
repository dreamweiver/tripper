import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trip, TripInput, TimelineEvent } from "@tripper/shared";
import { seedMeals, insertOrder } from "@tripper/shared";

type NewEvent = Omit<TimelineEvent, "id" | "order"> & { order?: number };
type InsertEvent = Omit<TimelineEvent, "id" | "order" | "tripId" | "dayIndex">;

interface TripState {
  trips: Trip[];
  events: TimelineEvent[];
  addTrip: (input: TripInput) => Trip;
  removeTrip: (id: string) => void;
  setTripImage: (id: string, imageUrl: string) => void;
  getTrip: (id: string) => Trip | undefined;
  seedMealsForTrip: (tripId: string, dayCount: number) => void;
  addEvent: (event: NewEvent) => TimelineEvent;
  insertEventBetween: (
    tripId: string,
    dayIndex: number,
    beforeId: string | undefined,
    afterId: string | undefined,
    event: InsertEvent,
  ) => TimelineEvent;
  updateEvent: (id: string, patch: Partial<TimelineEvent>) => void;
  updateNotes: (id: string, notes: string[]) => void;
  setEventImage: (id: string, imageUrl: string) => void;
  removeEvent: (id: string) => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      events: [],
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
        set((s) => ({
          trips: s.trips.filter((t) => t.id !== id),
          events: s.events.filter((e) => e.tripId !== id),
        })),
      setTripImage: (id, imageUrl) =>
        set((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, imageUrl } : t)) })),
      getTrip: (id) => get().trips.find((t) => t.id === id),

      seedMealsForTrip: (tripId, dayCount) => {
        const hasEvents = get().events.some((e) => e.tripId === tripId);
        if (hasEvents) return;
        const seeded: TimelineEvent[] = [];
        for (let day = 0; day < dayCount; day++) seeded.push(...seedMeals(tripId, day));
        set((s) => ({ events: [...s.events, ...seeded] }));
      },

      addEvent: (event) => {
        const dayEvents = get().events.filter(
          (e) => e.tripId === event.tripId && e.dayIndex === event.dayIndex,
        );
        const maxOrder = dayEvents.reduce((m, e) => Math.max(m, e.order), -1);
        const created: TimelineEvent = {
          ...event,
          id: crypto.randomUUID(),
          order: event.order ?? maxOrder + 1,
        };
        set((s) => ({ events: [...s.events, created] }));
        return created;
      },

      insertEventBetween: (tripId, dayIndex, beforeId, afterId, event) => {
        const events = get().events;
        const before = beforeId ? events.find((e) => e.id === beforeId)?.order : undefined;
        const after = afterId ? events.find((e) => e.id === afterId)?.order : undefined;
        const created: TimelineEvent = {
          ...event,
          tripId,
          dayIndex,
          id: crypto.randomUUID(),
          order: insertOrder(before, after),
        };
        set((s) => ({ events: [...s.events, created] }));
        return created;
      },

      updateEvent: (id, patch) =>
        set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      updateNotes: (id, notes) =>
        set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, notes } : e)) })),
      setEventImage: (id, imageUrl) =>
        set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, imageUrl } : e)) })),
      removeEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    { name: "tripper.trips", version: 2 },
  ),
);
