// Core discriminant for itinerary items — kept in shared so FE + BE agree.
export type EventKind = "place" | "meal" | "suggestion_accepted";

export function isMealKind(kind: EventKind): boolean {
  return kind === "meal";
}

// Trimmed provider result shapes shared between backend proxies and frontend.
interface ProviderResultBase {
  title: string; // full label (name + address), kept for back-compat and as the stored event title
  name: string; // short display name, e.g. "Louvre Museum"
  address?: string; // remainder of the label, e.g. "Rue de Rivoli, Paris, France"
  lat: number;
  lon: number;
  category: string; // OSM top-level key, e.g. "tourism"
}

export interface PlaceResult extends ProviderResultBase {
  type: string; // OSM value, e.g. "museum"
}

export interface NearbyResult extends ProviderResultBase {
  distance: number; // metres from the anchor
}
