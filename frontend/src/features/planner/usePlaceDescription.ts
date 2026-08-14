import { useEffect, useState } from "react";
import { resolvePlaceSummary } from "../trips/resolveDestinationImage";

// Resolves a short blurb for a place by title via Wikipedia. If `cached` is
// present it's used directly; otherwise the lookup runs once and the result is
// reported via `onResolved` so it can be persisted on the event.
export function usePlaceDescription(
  title: string,
  cached?: string,
  onResolved?: (description: string) => void,
): string | undefined {
  const [resolved, setResolved] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;
    void resolvePlaceSummary(title).then(({ description }) => {
      if (cancelled || !description) return;
      setResolved(description);
      onResolved?.(description);
    });
    return () => {
      cancelled = true;
    };
    // onResolved intentionally omitted: it's a stable store setter and we only
    // want to resolve once per title.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, cached]);

  return cached ?? resolved;
}
