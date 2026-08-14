// Maps an event category (Nominatim `type` or Overpass category, e.g.
// "restaurant", "motorway", "station", "museum") to a distinct fallback image,
// glyph, and human label. Without this, every thumbnail-less place shared one
// generic SVG and had no category chip.

interface CategoryStyle {
  glyph: string;
  label: string;
  bg: string; // gradient top colour; bottom is a lighter tint
}

// Keyword groups checked in order against the lowercased category string.
const GROUPS: { match: string[]; style: CategoryStyle }[] = [
  {
    match: ["restaurant", "cafe", "fast_food", "food", "bar", "pub", "eatery", "amenity"],
    style: { glyph: "🍽", label: "Food", bg: "#f97316" },
  },
  {
    match: ["hotel", "hostel", "guest", "motel", "lodging"],
    style: { glyph: "🏨", label: "Stay", bg: "#6366f1" },
  },
  {
    match: ["place_of_worship", "temple", "shrine", "church", "mosque", "worship"],
    style: { glyph: "🛕", label: "Shrine", bg: "#d97706" },
  },
  {
    match: ["historic", "monument", "memorial", "castle", "ruins", "archaeological"],
    style: { glyph: "🏰", label: "Landmark", bg: "#a16207" },
  },
  {
    match: ["museum", "gallery", "arts", "theatre", "attraction", "tourism"],
    style: { glyph: "🏛", label: "Sight", bg: "#0ea5e9" },
  },
  {
    match: ["park", "garden", "leisure", "nature", "forest", "beach"],
    style: { glyph: "🌳", label: "Nature", bg: "#22c55e" },
  },
  {
    match: ["station", "airport", "bus", "subway", "tram", "motorway", "road", "highway"],
    style: { glyph: "🚉", label: "Transit", bg: "#64748b" },
  },
  {
    match: ["shop", "mall", "store", "market", "retail"],
    style: { glyph: "🛍", label: "Shop", bg: "#ec4899" },
  },
];

const DEFAULT: CategoryStyle = { glyph: "📍", label: "Place", bg: "#14b8a6" };

function styleFor(category?: string): CategoryStyle {
  const c = (category ?? "").toLowerCase();
  if (!c) return DEFAULT;
  for (const group of GROUPS) {
    if (group.match.some((m) => c.includes(m))) return group.style;
  }
  return DEFAULT;
}

export function categoryEmoji(category?: string): string {
  return styleFor(category).glyph;
}

// Short human label for the category chip, or "" when the category is unknown
// (so the chip is hidden rather than showing a meaningless default).
export function categoryLabel(category?: string): string {
  if (!category?.trim()) return "";
  return styleFor(category).label;
}

export function categoryImage(category?: string): string {
  const { glyph, bg } = styleFor(category);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stop-color='${bg}'/><stop offset='100%' stop-color='#ffffff'/></linearGradient></defs><rect width='400' height='300' fill='url(#g)'/><text x='200' y='170' font-size='120' text-anchor='middle' dominant-baseline='middle'>${glyph}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
