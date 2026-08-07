/** Parse a YYYY-MM-DD string as a local date (avoids UTC shift). */
function parseLocal(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

const monthDay = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/** "Aug 12 – Aug 18, 2026", "Aug 12, 2026", or cross-year "Dec 30, 2026 – Jan 2, 2027". */
export function formatTripDates(startDate: string, endDate: string): string {
  const start = parseLocal(startDate);
  const end = parseLocal(endDate);
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startDate === endDate) {
    return `${monthDay.format(start)}, ${endYear}`;
  }
  if (startYear === endYear) {
    return `${monthDay.format(start)} – ${monthDay.format(end)}, ${endYear}`;
  }
  return `${monthDay.format(start)}, ${startYear} – ${monthDay.format(end)}, ${endYear}`;
}
