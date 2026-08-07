import { formatTripDates } from "./formatTripDates";

describe("formatTripDates", () => {
  it("formats a range within the same year", () => {
    expect(formatTripDates("2026-08-12", "2026-08-18")).toBe("Aug 12 – Aug 18, 2026");
  });

  it("formats a single-day trip", () => {
    expect(formatTripDates("2026-08-12", "2026-08-12")).toBe("Aug 12, 2026");
  });

  it("formats a range spanning two years", () => {
    expect(formatTripDates("2026-12-30", "2027-01-02")).toBe("Dec 30, 2026 – Jan 2, 2027");
  });
});
