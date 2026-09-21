import type { Trip } from "@tripper/shared";
import type { PlannerDay } from "./hooks/usePlannerEvents";
import { buildItineraryText, buildItineraryMailto } from "./itinerary";

const trip: Trip = {
  id: "t1",
  destination: "Kyoto",
  name: "Spring in Kyoto",
  startDate: "2999-04-01",
  endDate: "2999-04-02",
  createdAt: "2999-01-01T00:00:00.000Z",
};

// Minimal PlannerDay factory — buildItineraryText only reads dayIndex + events.
const day = (dayIndex: number, events: PlannerDay["events"]): PlannerDay => ({
  dayIndex,
  events,
});

// Cast helper: itinerary rendering only touches a handful of event fields.
const ev = (e: Partial<PlannerDay["events"][number]>) =>
  ({ notes: [], ...e }) as PlannerDay["events"][number];

describe("buildItineraryText", () => {
  it("starts with the trip title and a dates · days line", () => {
    const text = buildItineraryText(trip, [day(0, [])]);
    const lines = text.split("\n");
    expect(lines[0]).toBe("Spring in Kyoto");
    expect(lines[1]).toContain("· 1 days");
  });

  it("marks an empty day as nothing planned", () => {
    const text = buildItineraryText(trip, [day(0, [])]);
    expect(text).toContain("Day 1 —");
    expect(text).toContain("(nothing planned)");
  });

  it("renders a stop with time, title, and address", () => {
    const text = buildItineraryText(trip, [
      day(0, [ev({ time: "09:00", title: "Fushimi Inari", address: "68 Fukakusa" })]),
    ]);
    expect(text).toContain("09:00");
    expect(text).toContain("Fushimi Inari");
    expect(text).toContain("68 Fukakusa");
  });

  it("appends the English name only when it differs from the title", () => {
    const same = buildItineraryText(trip, [day(0, [ev({ title: "Gion", nameEn: "Gion" })])]);
    expect(same).not.toContain("(Gion)");

    const diff = buildItineraryText(trip, [day(0, [ev({ title: "祇園", nameEn: "Gion" })])]);
    expect(diff).toContain("(Gion)");
  });

  it("has no trailing whitespace", () => {
    const text = buildItineraryText(trip, [day(0, []), day(1, [])]);
    expect(text).toBe(text.trimEnd());
  });
});

describe("buildItineraryMailto", () => {
  it("builds a mailto: URL with the title as subject and the text as body", () => {
    const url = buildItineraryMailto(trip, [day(0, [])]);
    expect(url.startsWith("mailto:?")).toBe(true);
    expect(url).toContain(`subject=${encodeURIComponent("Spring in Kyoto")}`);
    const body = new URL(url).searchParams.get("body");
    expect(body).toBe(buildItineraryText(trip, [day(0, [])]));
  });
});
