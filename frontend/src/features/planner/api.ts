import type { PlaceResult, NearbyResult } from "@tripper/shared";

export async function fetchSearch(query: string): Promise<PlaceResult[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`search ${res.status}`);
  return (await res.json()) as PlaceResult[];
}

export async function fetchNearby(lat: number, lon: number): Promise<NearbyResult[]> {
  const res = await fetch(`/api/nearby?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error(`nearby ${res.status}`);
  return (await res.json()) as NearbyResult[];
}
