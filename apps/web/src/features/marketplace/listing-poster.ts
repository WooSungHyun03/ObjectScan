export type ListingPosterFields = {
  poster_url?: string | null;
  artifact_version_id?: string | null;
};

const listingIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function listingPosterPath(
  listingId: string,
  posterUrl?: string | null,
) {
  if (!listingIdPattern.test(listingId)) return undefined;
  const path = `/api/listings/${listingId}/poster`;
  return posterUrl === path ? path : undefined;
}
