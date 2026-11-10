# Independent service architecture

Next.js App Router is deployed as apps/web on Vercel. Supabase Auth verifies identities server-side; PostgreSQL owns business transactions, RLS, orders and job leases. Supabase Storage owns private source images, masks and full GLBs. Only separately validated low-detail market derivatives enter a public bucket. No Sites hosting or APIs are used.

## Request boundaries

Browser → Next.js API: cookie identity, same-origin mutation check, Zod schemas, minute rate limits, explicit owner/entitlement lookup. Supabase RLS independently limits read access. Browser can change a project name and its own display name; it cannot change paid state, processing state, administrator role, queue or financial ledger. Upload URLs authorize one exact original-image path. A server-side completion request bounds and decodes the image, removes metadata, saves normalized RGB and atomically records a verified upload. A client filename is never a filesystem path.

Worker → HTTPS API: dedicated secret bearer, request schemas, kind-specific capabilities, lease UUID and expiry fence every result. Worker never receives service-role credentials. API produces short-lived private download links and exact output upload links; these must not enter logs. Lease-scoped output paths prevent a stale run overwriting a new attempt. Refresh manifests between input downloads and before result upload. A background heartbeat runs throughout upload and processing. Workers pin storage origin to prevent SSRF/credential forwarding.

## Reconstruction

Object Mesh requests SAM2 masks and human review. Counts 1–20 select Pixal3D; calibrated MV supports a selected 2/4/6/8 views and requires an actual canonical frame. Counts 21–200 select Object-Aware Loss with COLMAP and masks. Scene Mesh bypasses SAM2 and selects Gaussian Wrapping. Both Gaussian pipelines need actual extraction, refined source color, and UV bake. xatlas vertex-color baking is implemented as a conservative conversion; it preserves only detail present in source colors. It must not be advertised as recovered photo detail. The GLB validator requires embedded geometry, UVs and a decodable base-color image.

Models run in separate CUDA environments. An administrator-owned adapter argv invokes a pinned implementation without a shell; work manifests contain UUID file names. Adapters produce result.json and actual output files. Empty adapter configuration advertises no capability and claims no jobs. No fake result or alternate model fallback is implemented.

## Queue and recovery

A singleton worker_slot row is locked before claim; queued jobs are selected FOR UPDATE SKIP LOCKED. Exactly one global job runs. A 120-second token lease is renewed every 15 seconds. Expiry alone never clears the slot: the old GPU process could still be running. Local flock additionally prevents two worker loops sharing a work root. Each stage starts a process group. Cancellation, timeout, lease loss and failures terminate the entire group before reporting failure/stop acknowledgement. If the worker machine dies, operator recovery requires confirmation that GPU processes stopped; reconciliation locks the slot atomically. Attempts are capped at three and retry cannot reuse a stale project revision.

## Payments and marketplace

Amounts come from configured integer KRW tiers or approved listing rows. Production payments are disabled. Toss test confirmation uses server credentials and rechecks order ID, amount, currency, status and payment key. Webhooks are untrusted notifications and trigger authenticated provider requery. Idempotent PostgreSQL settlement creates payment, debit, purchase entitlement and fee entries in one transaction. Test sales never increase real withdrawable seller balances. Refund/provider reconciliation and production payouts remain release gates.

Seller publication requires rights consent. Operator approval requires a distinct GLB preview hash with at most 20k triangles and 25% of source detail. Purchasers obtain the private full GLB only after settlement. Payout requests reserve balance for manual review; no automatic bank transfer exists.

## Deployment topology

Vercel serves the independent frontend/API. Supabase hosted configuration and email redirect URLs must be supplied before cloud login works. The dedicated GPU host needs outbound HTTPS only. Long-running GPU computation does not run in a Vercel request. Local Supabase uses isolated ports 56321–56329; credentials remain ignored. See RUNBOOK.md for operations and RELEASE_CHECKLIST.md for launch gates.
