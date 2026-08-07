/**
 * Resolve a destination's thumbnail via the Wikipedia REST summary API.
 * Returns the article's lead-image URL (usually the city skyline or a famous
 * monument), or null when the destination has no thumbnail or the lookup fails.
 */
export async function resolveDestinationImage(destination: string): Promise<string | null> {
  const query = destination.trim();
  if (!query) return null;

  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const source = (data as { thumbnail?: { source?: unknown } })?.thumbnail?.source;
    return typeof source === "string" ? source : null;
  } catch {
    return null;
  }
}
