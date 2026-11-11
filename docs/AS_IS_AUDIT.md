# V5 as-is audit — 2026-11-11

Baseline: ade84d6, v4 live application9d10a0e. Existing auth/private uploads/SAM2 worker/editor versions and authorization are verified in v4 evidence, not newly claimed v5 passes.

| Feature                      | Actual state                                                            | Evidence / next gate                                |
| ---------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------- |
| Auth/upload/private download | working; external SMTP unverified                                       | v4 actual hosted owner/second-user checks           |
| SAM2                         | working CUDA via production pull worker                                 | systemd active, RTX4080 16376MiB                    |
| Single-image mesh            | offline real GPU textured GLB; web generation disabled                  | pixal-single-fp16.json:413.8s/12996MiB; run web E2E |
| Multi-view                   | diagnostic reduced-profile only; captured input path unverified         | full1024 OOM; do not enable                         |
| Object21+ / scene            | files valid; visual quality FAIL                                        | oal-object21.json / gw-scene32.json                 |
| Editor                       | working; geometry/UV/private versions tested                            | v4 8 browser tests                                  |
| Payments                     | disabled; provider simulation tests only                                | no local Toss keys; request real test keys          |
| Marketplace                  | publication/moderation/ledger implemented; provider purchase unverified | two-account sandbox verification needed             |
| Domain                       | existing different service, apex200/www307; Cloudflare MX               | no changes authorized; Preview only                 |

Prior design tools actually used: docs/design/TOOL_USAGE.md. V5 must distinguish reused evidence from new execution. No model family is currently production-enabled.
