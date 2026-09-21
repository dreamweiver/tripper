// Core discriminant for itinerary items — kept in shared so FE + BE agree.
export type EventKind = "place" | "meal" | "suggestion_accepted";

export function isMealKind(kind: EventKind): boolean {
  return kind === "meal";
}

// Trimmed provider result shapes shared between backend proxies and frontend.
interface ProviderResultBase {
  title: string; // full label (name + address), kept for back-compat and as the stored event title
  name: string; // short display name in the local language, e.g. "명동교자"
  nameEn?: string; // English equivalent from OSM (name:en / int_name), when the data has one
  address?: string; // remainder of the label, e.g. "Rue de Rivoli, Paris, France"
  distance?: number; // metres from the anchor, when the result is location-anchored
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
