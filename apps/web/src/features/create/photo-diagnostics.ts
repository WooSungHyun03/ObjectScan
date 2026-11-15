// Optional per-photo diagnostics (OWN-04 contract). Absent values mean "not checked", never "fine".
export type PhotoDiagnostics = {
  sharpness?: number | null;
  duplicate_of?: string | null;
  unavailable?: boolean;
};
export type PhotoWarning = "duplicate" | "blurry" | "unchecked" | null;

// shortcut: relative rule (under half the median of this selection, 3+ measured photos), not a calibrated
// absolute threshold; replace when the owner has real upload measurements.
export function photoWarnings(
  list: (PhotoDiagnostics | undefined)[],
): PhotoWarning[] {
  const measured = list
    .map((d) => d?.sharpness)
    .filter((v): v is number => typeof v === "number" && Number.isFinite(v))
    .sort((a, b) => a - b);
  const median = measured[Math.floor(measured.length / 2)];
  return list.map((d) => {
    if (!d) return null;
    if (d.duplicate_of) return "duplicate";
    if (d.unavailable || typeof d.sharpness !== "number") return "unchecked";
    return measured.length >= 3 && d.sharpness < median / 2 ? "blurry" : null;
  });
}

// Returns the same array when the move would leave the list.
export function moveItem<T>(list: T[], index: number, delta: number): T[] {
  const to = index + delta;
  if (index < 0 || index >= list.length || to < 0 || to >= list.length)
    return list;
  const next = list.slice();
  next.splice(to, 0, ...next.splice(index, 1));
  return next;
}
