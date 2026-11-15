# Contract: optional photo diagnostics on upload (OS-07 → OWN-04)

Status: draft-list UI and key-free helper ready (MOCK). Server field not returned yet (OWNER_PENDING). Wizard display for already-uploaded photos waits for OS-01 (same file).

## Request to Owner

In the existing `upload-complete` handler, call `diagnoseImage(normalized.bytes)` from `apps/web/src/features/create/image-diagnostics.server.ts` and add the result to the response. Do not store it and do not fail the upload when it is `null`.

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `diagnostics` | object | yes | omit or `null` when not checked |
| `.sharpness` | number | yes | `sharp.stats().sharpness`, reference value only |
| `.duplicate_of` | string | yes | filename of the earlier photo with the same SHA in this project |
| `.unavailable` | boolean | yes | `true` when the helper returned `null` |

No new error codes. `entropy` is returned by the helper but not used by the UI.

## Fixture JSON

`tests/team/fixture/fixtures.tsx` → `draft-diagnostics`.

## Behaviour enforced in UI

- Warnings are advisory: upload stays enabled (`tests/team/os-07.spec.ts`).
- "Blurry" is relative: below half the median of the current selection, only with 3+ measured photos (`photo-diagnostics.ts`, marked `shortcut:`). This is a placeholder rule, not a calibrated threshold — Owner should confirm or replace it with real upload measurements.
- Helper budget: 16 MB and 40M pixels, otherwise `null`; broken input → `null` (`tests/photo-diagnostics.test.ts`).
