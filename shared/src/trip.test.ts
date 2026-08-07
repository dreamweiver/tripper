import { tripInputSchema, tripTitle, isTodayOrFuture, tripDayCount } from "./trip.js";

const today = new Date();
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const plusDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return iso(d);
};

describe("tripInputSchema", () => {
  const valid = {
    destination: "Paris",
    name: "",
    startDate: plusDays(1),
    endDate: plusDays(5),
  };

  it("accepts valid input", () => {
    expect(tripInputSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects blank destination", () => {
    const r = tripInputSchema.safeParse({ ...valid, destination: "  " });
    expect(r.success).toBe(false);
  });

  it("rejects a past start date", () => {
    const r = tripInputSchema.safeParse({ ...valid, startDate: plusDays(-1) });
    expect(r.success).toBe(false);
  });

  it("rejects end date before start date", () => {
    const r = tripInputSchema.safeParse({
      ...valid,
      startDate: plusDays(5),
      endDate: plusDays(2),
    });
    expect(r.success).toBe(false);
  });

  it("accepts a same-day trip (end === start)", () => {
    const r = tripInputSchema.safeParse({
      ...valid,
      startDate: plusDays(3),
      endDate: plusDays(3),
    });
    expect(r.success).toBe(true);
  });

  it("rejects a malformed date string", () => {
    const r = tripInputSchema.safeParse({ ...valid, startDate: "2026-8-6" });
    expect(r.success).toBe(false);
  });

  it("rejects an empty end date", () => {
    const r = tripInputSchema.safeParse({ ...valid, endDate: "" });
    expect(r.success).toBe(false);
  });

  it("gives a friendly message when dates are missing", () => {
    const r = tripInputSchema.safeParse({ destination: "Paris", name: "" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const startIssue = r.error.issues.find((i) => i.path[0] === "startDate");
      expect(startIssue?.message).toBe("Please select your trip's start and end dates");
    }
  });
});

describe("tripDayCount", () => {
  it("counts both endpoints (inclusive)", () => {
    expect(tripDayCount("2999-01-01", "2999-01-05")).toBe(5);
  });

  it("returns 1 for a same-day trip", () => {
    expect(tripDayCount("2999-01-01", "2999-01-01")).toBe(1);
  });

  it("counts across a month boundary", () => {
    expect(tripDayCount("2999-01-30", "2999-02-02")).toBe(4);
  });
});

describe("tripTitle", () => {
  it("uses name when provided", () => {
    expect(tripTitle({ name: "Honeymoon", destination: "Bali" })).toBe("Honeymoon");
  });

  it("auto-titles from destination when name is blank", () => {
    expect(tripTitle({ name: "", destination: "Bali" })).toBe("Trip to Bali");
  });

  it("auto-titles when name is undefined", () => {
    expect(tripTitle({ name: undefined, destination: "Rome" })).toBe("Trip to Rome");
  });
});

describe("isTodayOrFuture", () => {
  it("accepts today", () => {
    expect(isTodayOrFuture(iso(today))).toBe(true);
  });
  it("accepts a future date", () => {
    expect(isTodayOrFuture(plusDays(10))).toBe(true);
  });
  it("rejects a past date", () => {
    expect(isTodayOrFuture(plusDays(-1))).toBe(false);
  });
});
