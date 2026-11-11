# Editor contract

GET /api/projects/:id/editor: owner-only source artifact URL + ready version metadata.409 when no finished model. URLs expire120s.
POST /api/assets/:id/versions: strict idempotency_key,parent_id,size,sha256,operations[0..80]. Authenticated owner only; reserves a unique private path,64MB transport allowance. Owner total version quota256MB and100 entries; unresolved uploads keep their reservation. Returns exact signed upload URL, no upsert.
POST /api/assets/:id/versions/:version/complete: downloads reserved object from private asset-versions bucket; checks exact declared size, embedded GLB restrictions, semantic geometry/UV/decoded texture and SHA256 before atomic ready transition/number assignment. Duplicate completion returns existing version.
GET /api/assets/:id/versions/:version: owner-only ready version signed URL,120s expiry. Buyers/public previews do not authorize editing originals. No direct client insert/update or RPC execution.

Model editing runs in a browser Web Worker; server functions only validate/store. No user scripts, subprocesses, GPU jobs, payment settlement or original writes are triggered. Orphan pending versions retain quota and need operator inspection after signed-upload expiry; no unverified automated deletion of user assets. Verified version retention follows account deletion review.
