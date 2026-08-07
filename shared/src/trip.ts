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
    startDate: z.string().refine(isTodayOrFuture, "Start date can't be in the past"),
    endDate: z.string(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export type TripInput = z.infer<typeof tripInputSchema>;

export interface Trip extends TripInput {
  id: string;
  createdAt: string;
}

/** Wanderlog-style title: explicit name, else "Trip to {destination}". */
export function tripTitle(t: Pick<Trip, "name" | "destination">): string {
  const trimmed = t.name?.trim();
  return trimmed ? trimmed : `Trip to ${t.destination}`;
}
