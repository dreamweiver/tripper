// English-first display names for a place. Locale support is a later phase; for
// now we always lead with the English equivalent when OSM has one, keeping the
// local name as a secondary subtitle for reference. `local` is undefined when
// there's no distinct English name, so callers can simply skip the subtitle.
export function placeNames(title: string, nameEn?: string): { primary: string; local?: string } {
  const en = nameEn?.trim();
  const primary = en || title;
  const local = en && en !== title ? title : undefined;
  return local ? { primary, local } : { primary };
}
