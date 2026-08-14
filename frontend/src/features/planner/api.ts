import type { PlaceResult, NearbyResult } from "@tripper/shared";

export async function fetchSearch(
  query: string,
  bias?: { lat: number; lon: number },
): Promise<PlaceResult[]> {
  const params = new URLSearchParams({ q: query });
  if (bias) {
    params.set("lat", String(bias.lat));
    params.set("lon", String(bias.lon));
  }
  const res = await fetch(`/api/search?${params.toString()}`);
  if (!res.ok) throw new Error(`search ${res.status}`);
  return (await res.json()) as PlaceResult[];
}

export async function fetchNearby(lat: number, lon: number): Promise<NearbyResult[]> {
  const res = await fetch(`/api/nearby?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error(`nearby ${res.status}`);
  return (await res.json()) as NearbyResult[];
}

export async function fetchNearbyEateries(lat: number, lon: number): Promise<NearbyResult[]> {
  const res = await fetch(`/api/nearby?lat=${lat}&lon=${lon}&eateries=1`);
  if (!res.ok) throw new Error(`nearby ${res.status}`);
  return (await res.json()) as NearbyResult[];
}
