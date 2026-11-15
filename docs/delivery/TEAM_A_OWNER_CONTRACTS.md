# Team A Owner handoffs

## OS-09 / OWN-08 — Listing posters

Status `TEAM_PARTIAL / OWNER_PENDING`. Card rendering and fallback can run on fixtures. The publication preview using a viewer capture waits for Team B OS-19. The endpoint below is a proposal for OWN-08.

- Listing list response adds optional `poster_url: string | null` and `artifact_version_id: string | null`. A legacy listing may omit both fields. A provided poster path is relative `/api/listings/<listing-id>/poster` and belongs to that listing only. A version ID identifies the immutable editor version used by the approved derivative. `null` permits an approved original artifact poster or legacy data.
- `GET /api/listings/:id/poster` should return an approved derivative as `image/png`. `404 POSTER_NOT_FOUND` covers unavailable and unapproved posters. An operational read failure may return `503 POSTER_UNAVAILABLE`. The card falls back in either case. Authorization and publication checks at the endpoint belong to the Owner.
- `public_preview_path` remains the existing GLB field. Poster publishing needs an authenticated upload/finalize contract from OWN-08, with image type and size validation, source artifact/version binding, owner authorization, approval, and a private default before public publication.

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "poster_url": "/api/listings/00000000-0000-4000-8000-000000000001/poster",
  "artifact_version_id": null
}
```
