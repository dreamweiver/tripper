import { formatDayLabel } from "./formatDayLabel";

describe("formatDayLabel", () => {
  it("labels the first day (offset 0) with weekday, month and date", () => {
    // 2026-08-12 is a Wednesday.
    expect(formatDayLabel("2026-08-12", 0)).toBe("WED AUG 12");
  });

  it("advances by the day offset", () => {
    expect(formatDayLabel("2026-08-12", 1)).toBe("THU AUG 13");
  });

  it("rolls over into the next month", () => {
    // 2026-08-31 (Mon) + 1 day -> 2026-09-01 (Tue).
    expect(formatDayLabel("2026-08-31", 1)).toBe("TUE SEP 1");
  });

  it("rolls over into the next year", () => {
    // 2026-12-31 (Thu) + 1 day -> 2027-01-01 (Fri).
    expect(formatDayLabel("2026-12-31", 1)).toBe("FRI JAN 1");
  });
});
