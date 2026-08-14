export interface PlaceSummary {
  imageUrl: string | null;
  description: string | null;
}

// Trim a Wikipedia extract down to its first sentence, capped so cards stay
// compact. Falls back to a hard character cap when no sentence break is found.
function firstSentence(extract: string, cap = 140): string {
  const trimmed = extract.trim();
  const end = trimmed.search(/(?<=\.)\s/);
  const sentence = end > 0 ? trimmed.slice(0, end) : trimmed;
  return sentence.length > cap ? `${sentence.slice(0, cap - 1).trimEnd()}…` : sentence;
}

/**
 * Resolve a place's lead image + short blurb via the Wikipedia REST summary
 * API in a single request. Returns nulls when the article is missing or the
 * lookup fails, so callers degrade gracefully.
 */
export async function resolvePlaceSummary(title: string): Promise<PlaceSummary> {
  const query = title.trim();
  if (!query) return { imageUrl: null, description: null };

  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return { imageUrl: null, description: null };
    const data = (await res.json()) as { thumbnail?: { source?: unknown }; extract?: unknown };
    const source = data?.thumbnail?.source;
    const extract = data?.extract;
    return {
      imageUrl: typeof source === "string" ? source : null,
      description: typeof extract === "string" && extract.trim() ? firstSentence(extract) : null,
    };
  } catch {
    return { imageUrl: null, description: null };
  }
}

/**
 * Resolve a destination's thumbnail via the Wikipedia REST summary API.
 * Returns the article's lead-image URL (usually the city skyline or a famous
 * monument), or null when the destination has no thumbnail or the lookup fails.
 */
export async function resolveDestinationImage(destination: string): Promise<string | null> {
  const { imageUrl } = await resolvePlaceSummary(destination);
  return imageUrl;
}
