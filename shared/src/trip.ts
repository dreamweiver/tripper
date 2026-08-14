import { z } from "zod";

/** Today's local date as YYYY-MM-DD. */
function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** True when the YYYY-MM-DD string is today or later (local). */
export function isTodayOrFuture(date: string): boolean {
  return date >= todayIso();
}

export const tripInputSchema = z
  .object({
    destination: z.string().trim().min(1, "Where to?"),
    name: z.string().trim().max(80).optional(),
    startDate: z
      .string({ error: "Please select your trip's start and end dates" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
      .refine(isTodayOrFuture, "Start date can't be in the past"),
    endDate: z
      .string({ error: "Please select an end date to complete the range" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export type TripInput = z.infer<typeof tripInputSchema>;

export interface Trip extends TripInput {
  id: string;
  createdAt: string;
  /** Resolved destination thumbnail URL, cached after first lookup. Absent until resolved. */
  imageUrl?: string;
}

/** Wanderlog-style title: explicit name, else "Trip to {destination}". */
export function tripTitle(t: Pick<Trip, "name" | "destination">): string {
  const trimmed = t.name?.trim();
  return trimmed ? trimmed : `Trip to ${t.destination}`;
}

/**
 * Inclusive trip length in days: both endpoints count, so Jan 1 → Jan 5 is 5 days.
 * Assumes valid YYYY-MM-DD strings with endDate >= startDate.
 */
export function tripDayCount(startDate: string, endDate: string): number {
  const start = Date.UTC(...ymd(startDate));
  const end = Date.UTC(...ymd(endDate));
  return Math.round((end - start) / 86_400_000) + 1;
}

/** Split a YYYY-MM-DD string into [year, monthIndex, day] for Date.UTC. */
function ymd(date: string): [number, number, number] {
  const [y, m, d] = date.split("-").map(Number);
  return [y ?? 1970, (m ?? 1) - 1, d ?? 1];
}
