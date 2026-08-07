// Core discriminant for itinerary items — kept in shared so FE + BE agree.
export type EventKind = "place" | "meal" | "suggestion_accepted";

export function isMealKind(kind: EventKind): boolean {
  return kind === "meal";
}

// Trimmed provider result shapes shared between backend proxies and frontend.
export interface PlaceResult {
  title: string;
  lat: number;
  lon: number;
  category: string; // OSM top-level key, e.g. "tourism"
  type: string;     // OSM value, e.g. "museum"
}

export interface NearbyResult {
  title: string;
  lat: number;
  lon: number;
  category: string;
  distance: number; // metres from the anchor
}
