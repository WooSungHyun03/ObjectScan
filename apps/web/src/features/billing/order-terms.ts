import { licenseLabels } from "@/features/marketplace/presentation";
// Purchase-time terms as the billing API may return them (OWN-06 contract).
// Only these whitelisted fields are read; anything else in the row is ignored.
export type OrderTermsSnapshot = {
  schema_version: 1;
  license_code: string;
  license_label?: string;
  listing_title?: string;
  source_version?: string;
  source_sha256?: string | null;
  captured_at?: string;
};
export type OrderTermsView =
  | { state: "none" }
  | { state: "unknown" }
  | {
      state: "recorded";
      license: string;
      title?: string;
      version: string;
      hash?: string;
      capturedAt?: string;
    };

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

// Never substitutes the listing's current license: a missing or unreadable
// snapshot is shown as unknown, not guessed.
export function orderTermsView(
  kind: string,
  snapshot: unknown,
): OrderTermsView {
  if (kind !== "marketplace") return { state: "none" };
  const s = snapshot as Partial<OrderTermsSnapshot> | null | undefined;
  const code = str(s?.license_code);
  if (!s || typeof s !== "object" || s.schema_version !== 1 || !code)
    return { state: "unknown" };
  const hash = str(s.source_sha256);
  return {
    state: "recorded",
    license: str(s.license_label) ?? licenseLabels[code] ?? code,
    title: str(s.listing_title),
    version:
      s.source_version === "original" || !str(s.source_version)
        ? "원본"
        : s.source_version!,
    hash: hash ? hash.slice(0, 12) : undefined,
    capturedAt: str(s.captured_at),
  };
}
