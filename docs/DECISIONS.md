# Engineering decisions

- 2026-11-09: New repository implementation; no import of legacy Sites project. Independent Next.js 16 / React 19 / Supabase / Vercel; Node 22 pinned on hosting.
- Model commits pinned by MODEL_AUDIT; adapters isolated because upstream Python/CUDA/native extension requirements differ.
- PostgreSQL queue instead of a separate Redis dependency for a single 4080; explicit global slot and lease fencing, no TTL-only automatic recycling.
- Private exact-path signed storage instead of proxying large originals through Vercel.
- Human mask review and conservative generation gates prevent charging for unsupported captures/model readiness.
- Provider sandbox only; no invented HMAC validation of Toss notifications. Authenticated provider requery is authoritative.
- No invented pricing, benchmark, pose or model success. REAL_GPU_VALIDATED remains false.
- xatlas rasterization converts refined vertex colors to an embedded UV texture; source-detail limitations are explicit. Real per-model output inspection is still mandatory.
- Existing unrelated GPU/conda/Docker projects are never modified. Dedicated local DB ports and model environments are used.

- 2026-11-10: Keep paid generation disabled after a single experimental Pixal pass: model-wide validation would also open untested multi-view routes. Upstream FP32 NAF OOM is retained as evidence; opt-in NAF FP16 changes precision only and requires pinned offline dependency caches.
- 2026-11-10: Public previews are bounded derivatives (at most 15k triangles and 25% of source faces, 512px baseColor atlas). Simplify welded geometry and transfer measured source colors by closest-surface barycentric projection. Reject excessive geometry distance; never publish the private full mesh as a fallback. PBR detail in the original is preserved privately.
- 2026-11-10: Abandoned uploads are tombstoned after 25h before exact-key Storage deletion, covering documented resumable URL lifetime. Failed deletion holds quota and remains retryable; verified input retention is separate.
- 2026-11-10: OAL/GW Gaussian-Splatting license restrictions are an unresolved commercial launch gate. Continue internal evaluation; do not enable paid deployment on the assumption that a public fork grants commercial rights.
