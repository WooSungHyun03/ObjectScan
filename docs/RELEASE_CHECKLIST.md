# Release gates

Implemented and tested evidence is recorded in TASKS.md. Unchecked items block production launch.

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
