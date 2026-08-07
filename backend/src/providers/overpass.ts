import type { NearbyResult } from "@tripper/shared";

interface OverpassElement {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const ENDPOINT = "https://overpass-api.de/api/interpreter";
const RADIUS_M = 500;
const LIMIT = 8;

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
  return tags.tourism ? "tourism" : tags.leisure ? "leisure" : tags.amenity ? "amenity" : "";
}

export async function nearbyPlaces(lat: number, lon: number): Promise<NearbyResult[]> {
  const query = `[out:json][timeout:15];(node(around:${RADIUS_M},${lat},${lon})[tourism];node(around:${RADIUS_M},${lat},${lon})[leisure=park];);out body ${LIMIT * 4};`;
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = (await res.json()) as { elements: OverpassElement[] };

  return data.elements
    .map((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      const name = el.tags?.name;
      if (elLat === undefined || elLon === undefined || !name) return undefined;
      return {
        title: name,
        lat: elLat,
        lon: elLon,
        category: categoryOf(el.tags ?? {}),
        distance: haversine(lat, lon, elLat, elLon),
      } satisfies NearbyResult;
    })
    .filter((r): r is NearbyResult => r !== undefined)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, LIMIT);
}
