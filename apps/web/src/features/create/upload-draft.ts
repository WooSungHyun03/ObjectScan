// Memory-only handoff: private File objects never enter browser storage or analytics.
const empty: File[] = [];
let pending = empty;
let created = 0;
const listeners = new Set<() => void>();
export function putDraft(files: File[]) {
  pending = files;
  created = Date.now();
  listeners.forEach((fn) => fn());
}
export function peekDraft() {
  return Date.now() - created < 15 * 60 * 1000 ? pending : empty;
}
export function subscribeDraft(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
export function serverDraft() {
  return empty;
}
