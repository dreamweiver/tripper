import { tripTitle, type Trip } from "@tripper/shared";
import { formatTripDates } from "../trips/formatTripDates";
import { formatDayLabel } from "./formatDayLabel";
import type { PlannerDay } from "./hooks/usePlannerEvents";

// A plain-text rendering of the itinerary (timeline only), shared by the Share
// email draft. Each day lists its stops with time, name, and category.
export function buildItineraryText(trip: Trip, days: PlannerDay[]): string {
  const lines: string[] = [];
  lines.push(tripTitle(trip));
  lines.push(`${formatTripDates(trip.startDate, trip.endDate)} · ${days.length} days`);
  lines.push("");

  for (const day of days) {
    lines.push(`Day ${day.dayIndex + 1} — ${formatDayLabel(trip.startDate, day.dayIndex)}`);
    if (day.events.length === 0) {
      lines.push("  (nothing planned)");
    }
    for (const e of day.events) {
      const time = e.time ? `${e.time}  ` : "";
      const en = e.nameEn && e.nameEn !== e.title ? ` (${e.nameEn})` : "";
      lines.push(`  ${time}${e.title}${en}`);
      if (e.address) lines.push(`      ${e.address}`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

// A mailto: URL with the itinerary pre-filled as the email body. Native share
// (WhatsApp etc.) is a later phase; email covers the current need.
export function buildItineraryMailto(trip: Trip, days: PlannerDay[]): string {
  const subject = tripTitle(trip);
  const body = buildItineraryText(trip, days);
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
