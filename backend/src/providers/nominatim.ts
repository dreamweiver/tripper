import type { PlaceResult } from "@tripper/shared";

interface NominatimRow {
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  category?: string;
  type?: string;
}

const ENDPOINT = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "tripper/0.1 (trip planner; contact: noreply@tripper.app)";

// Split "Louvre Museum, Rue de Rivoli, Paris, France" into a short name and the
// remaining address. Nominatim usually provides `name`; fall back to the first
// segment of display_name when it doesn't. When the name spans the whole label
// (no trailing segments), surface the last couple of segments as a partial
// address so the place still shows some locality context.
function splitLabel(displayName: string, name?: string): { name: string; address?: string } {
  const segments = displayName
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const shortName = name?.trim() || segments[0] || displayName;
  // The address is the locality context after the place's own segment. Strip
  // the first segment (the place itself) so a name that spans the whole label
  // still surfaces the trailing locality (e.g. "Tokyo, Japan") as a partial
  // address instead of leaving it blank or repeating the name.
  const startsWithName = shortName === segments[0] || shortName.startsWith(`${segments[0]},`);
  const rest = startsWithName ? segments.slice(1) : segments;
  const address = rest.join(", ") || undefined;
  return { name: shortName, address };
}

// A ~0.35° box (~35-40km) around the bias point. Wide enough to include a
// whole city and its outskirts, narrow enough to keep results local.
const BIAS_HALF_DEG = 0.35;

interface SearchOptions {
  lat?: number;
  lon?: number;
}

export async function searchPlaces(
  query: string,
  options: SearchOptions = {},
): Promise<PlaceResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    "accept-language": "en",
    limit: "8",
  });
  // Bias results toward the trip/anchor location when we have coordinates.
  if (Number.isFinite(options.lat) && Number.isFinite(options.lon)) {
    const lat = options.lat as number;
    const lon = options.lon as number;
    // viewbox order is left,top,right,bottom (lon,lat,lon,lat).
    const left = lon - BIAS_HALF_DEG;
    const right = lon + BIAS_HALF_DEG;
    const top = lat + BIAS_HALF_DEG;
    const bottom = lat - BIAS_HALF_DEG;
    params.set("viewbox", `${left},${top},${right},${bottom}`);
    params.set("bounded", "1");
  }
  const url = `${ENDPOINT}?${params.toString()}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const rows = (await res.json()) as NominatimRow[];
  return rows.map((r) => {
    const { name, address } = splitLabel(r.display_name, r.name);
    return {
      title: r.display_name,
      name,
      ...(address ? { address } : {}),
      lat: Number(r.lat),
      lon: Number(r.lon),
      category: r.category ?? "",
      type: r.type ?? "",
    };
  });
}
