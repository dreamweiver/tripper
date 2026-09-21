const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/**
 * Compact per-day heading for the planner timeline, e.g. "WED AUG 12".
 * `offset` is the zero-based day index within the trip. Uses UTC math so the
 * label never shifts across the viewer's timezone/DST boundaries.
 */
export function formatDayLabel(startDate: string, offset: number): string {
  const [y, m, d] = startDate.split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + offset));
  return `${WEEKDAYS[date.getUTCDay()]} ${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

/**
 * Whether the day at `offset` (zero-based day index) falls on a weekend
 * (Saturday or Sunday). Uses the same UTC math as `formatDayLabel` so the two
 * always agree on which weekday a day is.
 */
export function isWeekendDay(startDate: string, offset: number): boolean {
  const [y, m, d] = startDate.split("-").map(Number);
  const day = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + offset)).getUTCDay();
  return day === 0 || day === 6;
}
