# V3 implementation plan

| ID         | Owner | Priority | Dependencies    | State                           | Acceptance / evidence                                                                      |
| ---------- | ----- | -------- | --------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| V3-ASSET   | A     | P0       | supplied assets | locally verified                | all images visually audited, alpha/size/hash inventory, optimized manifest                 |
| V3-BRAND   | A     | P0       | V3-ASSET        | locally verified                | new tokens/Korean landing, actual360/390/768/1440 screenshots                              |
| V3-COPY    | A/C   | P0       | audit           | locally verified                | customer routes/events/errors contain no internal identifiers; separate legal notice       |
| V3-EDITOR  | B     | P0       | private GLB     | locally verified                | transforms/parts/undo/redo/normalize/simplify/export/reimport preserve UV/material/texture |
| V3-VERSION | C     | P0       | V3-EDITOR       | locally verified                | authenticated owner-only new immutable versions, idempotent save and signed download       |
| V3-HARNESS | C     | P0       | all             | remote verification in progress | doctor/verify/visual/mesh smoke and CI pass, exact evidence and remaining gates            |

Three tracks,14 days: A D1–2 assets/brand,D3–5 auth/upload,D6–9 editor UI,D10–14 responsive QA. B D1–2 feasibility,D3–5 typed contracts,D6–9 editor engine,D10–14 GLB/security/performance. C D1–2 auth/schema,D3–5 APIs,D6–9 versions,D10–14 integration/CI/release. Preserve prior GPU reports, actual service and school/no-commerce decisions.
