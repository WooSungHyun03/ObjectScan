# Risks and gates

| ID  | Risk                                                      | Gate / mitigation                                                                                                                | Current                                                                                   |
| --- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| R1  | RTX 4080 visible but models/extensions/weights unverified | Isolated per-model doctor and genuine dataset smoke; record peak VRAM, runtime and validated GLB                                 | SAM2/SV/MV512 artifacts pass; captured MV workflow and OAL/GW visual quality remain gates |
| R2  | Object-Aware/GW output is vertex-color PLY                | Explicit UV bake adapter and semantic GLB validator; fail closed                                                                 | OAL/GW UV/semantic/private viewer pass; GW public derivative unavailable                  |
| R3  | Invalid MV poses/turntable backgrounds                    | Measured COLMAP conversion/canonical front tests; block unverified turntable route                                               | Required                                                                                  |
| R4  | Hosted credentials missing                                | Independent local Supabase test stack; request only hosted project/key configuration                                             | Hosted keys/migrations verified; SMTP unverified                                          |
| R5  | Duplicate GPU execution after lease loss                  | Global DB slot + fenced lease token + process group teardown; operator reconciliation before reuse                               | Local DB/process and remote CI pass                                                       |
| R6  | Forged payment / duplicate webhook                        | Server order amount, PG re-query, idempotent transactional ledger/purchase grant                                                 | User requested payments stay disabled                                                     |
| R7  | Cross-user objects / original leak                        | Private bucket + RLS + server authorization, signed downloads, separate approved derivative preview                              | Hosted owner/second-user/anonymous checks and local GLB preview moderation pass           |
| R8  | Quota / image decompression / EXIF alignment              | Bounded decode, orientation normalization, content hash, immutable original pricing count                                        | Required                                                                                  |
| R9  | Deadline / scope                                          | Three tracks, complete first vertical slice, keep unverified model/payment routes disabled                                       | Active                                                                                    |
| R10 | OAL/GW commercial license restrictions                    | Audit pinned LICENSE.md and dependencies/checkpoints; obtain applicable rights before paid launch; research smoke only meanwhile | School-only public hosting authorized; commercial operation prohibited by project policy  |

V3 risks: baked checkerboard originals excluded; external glTF resources rejected to prevent remote fetch/SSRF; edited version quota/owner checks required; browser memory bounded and editing worker asynchronous; unknown units never labeled as metres. New branding must not silently activate generation or payments.

## V5 launch revision

- Existing be-celeb.org is attached to Vercel project sw-system and returns an existing service. DNS/association takeover is blocked until explicit approval and zone rollback snapshot. Cloudflare mail MX/SPF must survive.
- Prior school-only presentation/payment preference is superseded for an isolated test service. Live financial operation is still OFF. Original OAL/GW noncommercial license restrictions remain an actual commercial release gate; source notices cannot be erased.
- Single Pixal offline pass is not multi-view qualification. New validated_profiles and credit enqueue checks enforce exact input ranges; fail closed until configured.
- Credit refunds reserve units atomically before provider cancellation. Uncertain provider outcomes retain the reservation for requery/operator recovery; never release on network timeout alone. Replay settlement and retry cycles preserve append-only credit movements. Actual local credit and hosted marketplace provider refund/requery checks now pass; live financial operation remains unqualified.
- Figma Starter MCP quota still rejects frame reads. New v5 changes are verified by local actual browser captures, not falsely described as Figma-synced.

- V5 actual single-photo hosted reconstruction now passes; multiple-photo and scene quality remain blocked. Exact profile gates prevent extrapolating this success.
- Vercel default US region triggered Toss API_KEY_ACCESS_DENIED. Actual Seoul approval/refund passes with unchanged key policy. Keep runtime in icn1 and verify before any future region migration.
- TEST listings and commission are segregated from existing public inventory/config. Fixture transactions are refunded; audit ledgers are retained and test users/roles quarantined.
