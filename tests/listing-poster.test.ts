import { expect, test } from "vitest";
import { listingPosterPath } from "../apps/web/src/features/marketplace/listing-poster";

test("OS-09 accepts only the own listing's same-origin poster endpoint", () => {
  const id = "00000000-0000-4000-8000-000000000001";
  const allowed = `/api/listings/${id}/poster`;
  expect(listingPosterPath(id, allowed)).toBe(allowed);
  for (const url of [
    null,
    undefined,
    `${allowed}?internal=secret`,
    `//fixture.invalid${allowed}`,
    `https://fixture.invalid${allowed}`,
    `/api/listings/${id}/preview.glb`,
    `/api/listings/00000000-0000-4000-8000-000000000002/poster`,
  ]) {
    expect(listingPosterPath(id, url)).toBeUndefined();
  }
  expect(
    listingPosterPath("../asset", "/api/listings/../asset/poster"),
  ).toBeUndefined();
});
