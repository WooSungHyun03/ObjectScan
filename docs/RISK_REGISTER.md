# Risks and gates

| ID  | Risk                                                      | Gate / mitigation                                                                                   | Current                                 |
| --- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------- |
| R1  | RTX 4080 visible but models/extensions/weights unverified | Isolated per-model doctor and genuine dataset smoke; record peak VRAM, runtime and validated GLB    | Blocked on environment setup / datasets |
| R2  | Object-Aware/GW output is vertex-color PLY                | Explicit UV bake adapter and semantic GLB validator; fail closed                                    | Not validated                           |
| R3  | Invalid MV poses/turntable backgrounds                    | Measured COLMAP conversion/canonical front tests; block unverified turntable route                  | Required                                |
| R4  | Hosted credentials missing                                | Independent local Supabase test stack; request only hosted project/key configuration                | Not configured                          |
| R5  | Duplicate GPU execution after lease loss                  | Global DB slot + fenced lease token + process group teardown; operator reconciliation before reuse  | Required tests                          |
| R6  | Forged payment / duplicate webhook                        | Server order amount, PG re-query, idempotent transactional ledger/purchase grant                    | Test-only, no production payment        |
| R7  | Cross-user objects / original leak                        | Private bucket + RLS + server authorization, signed downloads, separate approved derivative preview | Required tests                          |
| R8  | Quota / image decompression / EXIF alignment              | Bounded decode, orientation normalization, content hash, immutable original pricing count           | Required                                |
| R9  | Deadline / scope                                          | Three tracks, complete first vertical slice, keep unverified model/payment routes disabled          | Active                                  |
