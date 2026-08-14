export type TravelMode = "walk" | "car" | "train";

export interface TravelLeg {
  mode: TravelMode;
  km: number;
  minutes: number;
}

interface Coord {
  lat: number;
  lon: number;
}

const EARTH_RADIUS_KM = 6371;

// Great-circle distance between two coordinates, in kilometres.
export function haversineKm(a: Coord, b: Coord): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Distance thresholds pick the "quickest" plausible mode; average speeds turn
// distance into a rough duration. Offline heuristic — no routing API.
const WALK_MAX_KM = 1.5;
const CAR_MAX_KM = 80;
const SPEED_KMH: Record<TravelMode, number> = { walk: 5, car: 30, train: 120 };

function modeFor(km: number): TravelMode {
  if (km <= WALK_MAX_KM) return "walk";
  if (km <= CAR_MAX_KM) return "car";
  return "train";
}

// Quickest travel leg between two coordinates. Returns null when either
// coordinate is missing so callers can render a plain connector.
export function quickestLeg(a?: Coord, b?: Coord): TravelLeg | null {
  if (!a || !b) return null;
  const km = haversineKm(a, b);
  const mode = modeFor(km);
  const minutes = Math.max(1, Math.round((km / SPEED_KMH[mode]) * 60));
  return { mode, km, minutes };
}

// "0.9 km" / "12 km" for display.
export function formatKm(km: number): string {
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

// "11 min" / "3 h 30" for display.
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m}` : `${h} h`;
}
