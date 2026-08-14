import type { NearbyResult } from "@tripper/shared";

interface OverpassElement {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const ENDPOINT = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "tripper/0.1 (trip planner; contact: noreply@tripper.app)";
const RADIUS_M = 500;
const LIMIT = 25;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function categoryOf(tags: Record<string, string>): string {
  // place_of_worship is an amenity but deserves its own category so temples/
  // shrines/churches get a distinct chip and fallback glyph.
  if (tags.amenity === "place_of_worship") return "place_of_worship";
  return tags.tourism
    ? "tourism"
    : tags.historic
      ? "historic"
      : tags.leisure
        ? "leisure"
        : tags.shop
          ? "shop"
          : tags.amenity
            ? "amenity"
            : "";
}

// Build a short street/city address from the OSM addr:* tags when present.
// Prefer a full street + city; otherwise fall back to whatever locality tags
// exist (suburb/city/state) so a place still shows at least a partial address.
function addressOf(tags: Record<string, string>): string | undefined {
  const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  const parts = [street, tags["addr:city"]].filter(Boolean);
  if (parts.length) return parts.join(", ");
  const partial = [tags["addr:suburb"], tags["addr:city"], tags["addr:state"]].filter(Boolean);
  return partial.length ? partial.join(", ") : undefined;
}

interface NearbyOptions {
  eateries?: boolean;
}

export async function nearbyPlaces(
  lat: number,
  lon: number,
  options: NearbyOptions = {},
): Promise<NearbyResult[]> {
  // Non-eatery suggestions are restricted at source to types that add value to
  // an itinerary — attractions, museums, monuments, places of worship, parks,
  // malls — deliberately excluding lodging, fuel, garages, roads, etc.
  const filters = options.eateries
    ? [`node(around:${RADIUS_M},${lat},${lon})[amenity~"^(restaurant|cafe|fast_food)$"];`]
    : [
        `node(around:${RADIUS_M},${lat},${lon})[tourism~"^(attraction|museum|artwork|viewpoint|gallery|theme_park|zoo|aquarium)$"];`,
        `node(around:${RADIUS_M},${lat},${lon})[historic~"^(monument|memorial|castle|ruins|archaeological_site)$"];`,
        `node(around:${RADIUS_M},${lat},${lon})[amenity~"^(restaurant|cafe|place_of_worship|marketplace|theatre|arts_centre)$"];`,
        `node(around:${RADIUS_M},${lat},${lon})[shop~"^(mall|department_store|supermarket)$"];`,
        `node(around:${RADIUS_M},${lat},${lon})[leisure~"^(park|garden)$"];`,
      ];
  const query = `[out:json][timeout:15];(${filters.join("")});out body ${LIMIT * 4};`;
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    body: new URLSearchParams({ data: query }).toString(),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = (await res.json()) as { elements: OverpassElement[] };

  return data.elements
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      const name = el.tags?.name;
      if (elLat === undefined || elLon === undefined || !name) return undefined;
      const tags = el.tags ?? {};
      const address = addressOf(tags);
      return {
        title: name,
        name,
        ...(address ? { address } : {}),
        lat: elLat,
        lon: elLon,
        category: categoryOf(tags),
        distance: haversine(lat, lon, elLat, elLon),
      } satisfies NearbyResult;
    })
    .filter((r): r is NearbyResult => r !== undefined)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, LIMIT);
}
