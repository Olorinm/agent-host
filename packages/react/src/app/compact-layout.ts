import { useSyncExternalStore } from "react";

// Dialogs switch to compact presentation at the same width as OpenGrove's app shell.
export const COMPACT_LAYOUT_QUERY = "(max-width: 900px)";
const subscribe = (notify: () => void) => {
  const query = window.matchMedia(COMPACT_LAYOUT_QUERY);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const snapshot = () => window.matchMedia(COMPACT_LAYOUT_QUERY).matches;

export function useCompactLayout(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
