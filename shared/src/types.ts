// Core discriminant for itinerary items — kept in shared so FE + BE agree.
export type EventKind = "place" | "meal" | "suggestion_accepted";

export function isMealKind(kind: EventKind): boolean {
  return kind === "meal";
}
