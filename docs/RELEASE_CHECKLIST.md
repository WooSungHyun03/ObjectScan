# Release gates

Implemented and tested evidence is recorded in TASKS.md. Unchecked items block the full reconstruction/commercial release. The authorized school pre-release below has a separate, narrower scope.

- [x] Independent Next.js app builds; two-user RLS and global queue concurrency tests pass locally.
- [x] No model success fabricated; generation gates default closed.
- [ ] Hosted Supabase URL/keys, SMTP and redirects configured and tested.
- [ ] Real SAM2 selection propagation and mask review on a licensed multi-view input.
- [ ] Real COLMAP/canonical-camera integration on captured object and scene inputs.
- [ ] Pixal3D1/4-view, Object-Aware Loss21+, Gaussian Wrapping20+ GPU smoke under16GB.
- [ ] Real textured GLB screenshots, peak VRAM/time and OOM recovery reports for all models.
- [ ] Commercial rights reviewed/resolved for Object-Aware Loss, Gaussian Wrapping, native dependencies and model checkpoints; current Gaussian-Splatting licenses restrict use to noncommercial research/evaluation.
- [ ] Toss hosted sandbox confirm/webhook/refund/reconciliation end-to-end.
- [ ] Marketplace purchased download + moderation + payout operator review complete.
- [ ] Production data deletion/retention and abuse handling operationally reviewed.
- [ ] Cloud preview verified at desktop/mobile sizes with independent hosted services.
- [ ] Reviewed PR merged; CI green and rollback documented.

A deployable build or a frontend preview alone does not satisfy these production gates.

## Authorized public school pre-release

- [x] User confirms exclusively noncommercial school use and requests public hosting.
- [x] Education-purpose notice and model/dependency attribution displayed.
- [x] Server disables payment calls despite test keys; sales publication, orders and payouts denied.
- [x] Dedicated hosted DB/Auth/private Storage, migrations, two-identity boundaries tested.
- [x] Persistent SAM2-only worker and actual hosted browser/upload/CUDA/private mask/review verified.
- [x] 44 Node/DB +25 Python +3 production-build browser checks pass; education public/mobile viewer smoke passes.
- [x] Public school build promoted and all public routes/viewer/mobile checked without Vercel automation credentials; final copy-only build follows the same checks.
- [ ] Hosted SMTP delivery (user is configuring directly). Email confirmation remains required.

Reconstruction stays disabled: captured multi-view Pixal workflow not qualified; OAL/GW visual quality failed. The site exposes working project/upload/mask functionality and an explicitly labeled sample viewer. It does not claim that these model generation gates or the full original scope are complete.

## V3 mascot/editor school release

- [x] Supplied mascot inventory/alpha derivatives and Korean brand/token replacement.
- [x] Customer routes/errors hide model identifiers; separate source/license notice.
- [x] Local54 Node/DB/mesh +25 Python +7 Chromium checks pass; exact build/type/format pass and0 lint errors.
- [x] Actual996k-triangle file: display-only LOD, full edited GLB/texture preservation and immutable original.
- [x] Additional migration12 applied to dedicated hosted project after schema backup.
- [x] Protected production build7413a6c: actual cloud browser private version save/reopen, original SHA and second-account API/RLS/Storage denial.
- [x] Protected cloud actual SAM2 CUDA upload/selection/mask/review and360px scene separation; disposable fixtures cleaned.
- [x] Remote push CI42942754208 green; exact staged deployment promoted/public smoke and public editor transform/download pass.
- [ ] SMTP external email delivery and reconstruction model quality gates remain open.

This release does not include face-level editing or enable commerce/reconstruction. The authenticated editor requires an existing valid artifact; /demo/edit provides a labeled working local example.
