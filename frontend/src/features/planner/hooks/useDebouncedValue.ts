import { useEffect, useState } from "react";

// Returns `value` delayed by `delayMs`; each change resets the timer so only the
// last value in a burst propagates. Used to debounce type-ahead place search so
// we fire one request after the user pauses, not one per keystroke.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
