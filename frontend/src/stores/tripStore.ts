import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Trip, TripInput, TimelineEvent } from "@tripper/shared";
import { seedMeals, insertOrder, tripDayCount, addDays, daysBetween } from "@tripper/shared";

type NewEvent = Omit<TimelineEvent, "id" | "order"> & { order?: number };
type InsertEvent = Omit<TimelineEvent, "id" | "order" | "tripId" | "dayIndex">;

interface TripState {
  trips: Trip[];
  events: TimelineEvent[];
  addTrip: (input: TripInput) => Trip;
  removeTrip: (id: string) => void;
  setTripImage: (id: string, imageUrl: string) => void;
  /**
   * Change the trip's date range. Events keep their calendar date (start + dayIndex):
   * they reflow to new day indices, and any that fall outside the new range are dropped.
   * Newly-added days that end up empty get their meal anchors seeded.
   */
  setTripDates: (id: string, startDate: string, endDate: string) => void;
  /** Delete one day: remove its events, shift later days down by one, and shrink the range. */
  deleteDay: (id: string, dayIndex: number) => void;
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
  setEventDescription: (id: string, description: string) => void;
  removeEvent: (id: string) => void;
}

export const TRIP_STORE_VERSION = 3;

/**
 * Persist migration. v3 drops cached low-res image URLs (small ~330px Wikipedia
 * summary thumbnails) from trips and events, so they re-resolve to the
 * full-resolution `originalimage` on next load. Exported for direct testing.
 */
export function migrateTripState(persisted: unknown, version: number): TripState {
  const state = persisted as Partial<TripState> | undefined;
  if (state && version < 3) {
    return {
      ...state,
      trips: (state.trips ?? []).map((t) => ({ ...t, imageUrl: undefined })),
      events: (state.events ?? []).map((e) => ({ ...e, imageUrl: undefined })),
    } as TripState;
  }
  return persisted as TripState;
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

      setTripDates: (id, startDate, endDate) =>
        set((s) => {
          const trip = s.trips.find((t) => t.id === id);
          if (!trip) return {};
          const oldStart = trip.startDate;
          const newCount = tripDayCount(startDate, endDate);
          // Reflow this trip's events by calendar date; keep the rest untouched.
          const kept: TimelineEvent[] = [];
          for (const e of s.events) {
            if (e.tripId !== id) {
              kept.push(e);
              continue;
            }
            const idx = daysBetween(startDate, addDays(oldStart, e.dayIndex));
            if (idx >= 0 && idx < newCount) kept.push({ ...e, dayIndex: idx });
            // Events outside the new range are dropped (their day was trimmed away).
          }
          // Seed meal anchors for any day that ended up with no events.
          const present = new Set(kept.filter((e) => e.tripId === id).map((e) => e.dayIndex));
          const seeded: TimelineEvent[] = [];
          for (let d = 0; d < newCount; d++) {
            if (!present.has(d)) seeded.push(...seedMeals(id, d));
          }
          return {
            trips: s.trips.map((t) => (t.id === id ? { ...t, startDate, endDate } : t)),
            events: [...kept, ...seeded],
          };
        }),

      deleteDay: (id, dayIndex) =>
        set((s) => {
          const trip = s.trips.find((t) => t.id === id);
          if (!trip) return {};
          const count = tripDayCount(trip.startDate, trip.endDate);
          if (count <= 1) return {}; // a trip keeps at least one day
          const events = s.events
            .filter((e) => !(e.tripId === id && e.dayIndex === dayIndex))
            .map((e) =>
              e.tripId === id && e.dayIndex > dayIndex ? { ...e, dayIndex: e.dayIndex - 1 } : e,
            );
          // One fewer day → last index is count-2, so endDate = start + (count-2).
          const endDate = addDays(trip.startDate, count - 2);
          return {
            trips: s.trips.map((t) => (t.id === id ? { ...t, endDate } : t)),
            events,
          };
        }),

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
      setEventDescription: (id, description) =>
        set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, description } : e)) })),
      removeEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    }),
    {
      name: "tripper.trips",
      version: TRIP_STORE_VERSION,
      migrate: migrateTripState,
    },
  ),
);
