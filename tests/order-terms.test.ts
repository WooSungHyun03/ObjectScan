import { expect, test } from "vitest";
import { orderTermsView } from "@/features/billing/order-terms";
test("orderTermsView shows recorded terms and never backfills legacy orders", () => {
  expect(orderTermsView("credits", null)).toEqual({ state: "none" });
  for (const legacy of [
    null,
    undefined,
    {},
    { schema_version: 2, license_code: "cc0-1.0" },
    { schema_version: 1 },
    "x",
  ])
    expect(orderTermsView("marketplace", legacy)).toEqual({ state: "unknown" });
  expect(
    orderTermsView("marketplace", {
      schema_version: 1,
      license_code: "cc-by-4.0",
      listing_title: "의자",
      source_version: "original",
      source_sha256: "abcdef0123456789",
      captured_at: "2026-11-12T03:00:00Z",
      source_storage_path: "private/x.glb",
      seller_id: "u1",
    }),
  ).toEqual({
    state: "recorded",
    license: "CC BY 4.0",
    title: "의자",
    version: "원본",
    hash: "abcdef012345",
    capturedAt: "2026-11-12T03:00:00Z",
  });
  expect(
    orderTermsView("marketplace", {
      schema_version: 1,
      license_code: "standard",
      license_label: "구매 당시 문구",
    }),
  ).toMatchObject({ license: "구매 당시 문구" });
});
