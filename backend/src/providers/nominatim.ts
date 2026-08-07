import type { PlaceResult } from "@tripper/shared";

interface NominatimRow {
  display_name: string;
  lat: string;
  lon: string;
  category?: string;
  type?: string;
}

const ENDPOINT = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "tripper/0.1 (trip planner; contact: noreply@tripper.app)";

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const url = `${ENDPOINT}?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&limit=8`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const rows = (await res.json()) as NominatimRow[];
  return rows.map((r) => ({
    title: r.display_name,
    lat: Number(r.lat),
    lon: Number(r.lon),
    category: r.category ?? "",
    type: r.type ?? "",
  }));
}
