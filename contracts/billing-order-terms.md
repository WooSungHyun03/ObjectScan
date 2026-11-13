# Contract: purchase-time terms on `GET /api/billing` (OS-04 → OWN-06)

Status: UI ready (TEAM_PASS, MOCK). Server field not yet returned (OWNER_PENDING).

## Request to Owner

Add `license_snapshot` to the `orders` select in the billing handler and return it per order, **whitelisted**. Never send `seller_id`, `source_storage_path`, `listing_description` or `rights_consent_at` to the client.

| Field | Type | Nullable | Notes |
|---|---|---|---|
| `orders[].license_snapshot` | object | yes | `null` for legacy and non-marketplace orders |
| `.schema_version` | `1` | no | other values are shown as "기록 확인 중" |
| `.license_code` | string | no | `standard` / `cc-by-4.0` / `cc0-1.0` |
| `.license_label` | string | yes | purchase-time label, preferred over the code map |
| `.listing_title` | string | yes | |
| `.source_version` | string | yes | `original` → "원본" |
| `.source_sha256` | string | yes | UI shows the first 12 chars |
| `.captured_at` | ISO string | yes | |

No new error codes. A failed billing load already maps through `customerError`.

## Fixture JSON

See `tests/team/fixture/fixtures.tsx` (`billing-terms`): one recorded marketplace order, one legacy order without `license_snapshot`, one credits order.

## Behaviour already enforced in UI

- A missing or invalid snapshot is never filled from the listing's current license (`apps/web/src/features/billing/order-terms.ts`, unit test `tests/order-terms.test.ts`).
