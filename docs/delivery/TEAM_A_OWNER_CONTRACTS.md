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

## OS-17 / OWN-09 — Import a local GLB into a private project

Status `OWNER_PENDING`. Bind a client-side `PrivateModelImportAdapter` to the authenticated Owner implementation once it is available. Endpoint names are for Owner to establish.

| Adapter call | Request and response                                                                                                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validate`   | `request_id: UUID`, `file_name: string` (GLB name up to 100 characters), `byte_length: integer` (1 through 67,108,864), `content_type: "model/gltf-binary"`, `rights_confirmed: true`. Returns `session_id: UUID`, `upload_required: boolean`. |
| `upload`     | Session ID and the current edited GLB bytes. The authenticated adapter manages any private upload URL internally.                                                                                                                              |
| `finalize`   | Session ID. Returns `artifact_id: UUID`, `project_id: UUID`, `can_publish: boolean` only after verified private registration.                                                                                                                  |

All fields above are required and non-null. Reuse `request_id` for the same file snapshot and metadata through retries. Bind the session to the verified owner, file metadata and intended immutable artifact. Finalization must validate container, embedded resources, type and byte limit server-side and return the same IDs on replay. Publication uses the existing project flow gated by Owner policy and saved rights.

Proposed errors `401 AUTH_REQUIRED`, `403 IMPORT_FORBIDDEN`, `409 IMPORT_MISMATCH`, `413 FILE_TOO_LARGE`, `422 INVALID_GLB`, `503 IMPORT_UNAVAILABLE`. Preserve private edited bytes and allow safe retry after an ambiguous upload or finalize result.

```json
{
  "session_id": "00000000-0000-4000-8000-000000000010",
  "upload_required": true
}
```

```json
{
  "artifact_id": "00000000-0000-4000-8000-000000000011",
  "project_id": "00000000-0000-4000-8000-000000000012",
  "can_publish": true
}
```
