export interface PlaceSummary {
  imageUrl: string | null;
  // Full-resolution lead image (Wikipedia `originalimage`), when available.
  // Used for large backgrounds where the small summary thumbnail looks blurry.
  originalImageUrl: string | null;
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
  if (!query) return { imageUrl: null, originalImageUrl: null, description: null };

  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return { imageUrl: null, originalImageUrl: null, description: null };
    const data = (await res.json()) as {
      thumbnail?: { source?: unknown };
      originalimage?: { source?: unknown };
      extract?: unknown;
    };
    const source = data?.thumbnail?.source;
    const original = data?.originalimage?.source;
    const extract = data?.extract;
    return {
      imageUrl: typeof source === "string" ? source : null,
      originalImageUrl: typeof original === "string" ? original : null,
      description: typeof extract === "string" && extract.trim() ? firstSentence(extract) : null,
    };
  } catch {
    return { imageUrl: null, originalImageUrl: null, description: null };
  }
}

/**
 * Resolve a destination's lead image via the Wikipedia REST summary API, for use
 * as a full-bleed background. Prefers the full-resolution `originalimage` (the
 * summary's own `thumbnail` is only ~330px and looks blurry blown up), and only
 * falls back to that thumbnail when no original exists. Returns null when the
 * destination has no image or the lookup fails.
 *
 * Note: we deliberately do NOT rewrite the thumbnail's `/<n>px-` width segment —
 * Wikimedia's `thumb.wikimedia.org` CDN returns HTTP 400 for arbitrary widths it
 * hasn't pre-rendered, so the only reliably-loadable high-res URL is the original.
 */
export async function resolveDestinationImage(destination: string): Promise<string | null> {
  const { imageUrl, originalImageUrl } = await resolvePlaceSummary(destination);
  return originalImageUrl ?? imageUrl;
}
