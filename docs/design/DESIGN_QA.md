# V4 design QA / repeated loop

Scale0=poor,5=strong. Reviewed actual screenshots, not a style-lint-only claim.

| Loop                    | Brand | Hierarchy | Korean | Product | CTA | Mobile | Interaction | A11y | Performance | Consistency | Evidence / fixes                                                                                                                       |
| ----------------------- | ----- | --------- | ------ | ------- | --- | ------ | ----------- | ---- | ----------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline                | 3     | 3         | 4      | 2       | 3   | 4      | 4           | 3    | 3           | 3           | V3 large mascot, indirect creation entry, several legacy low-contrast grays                                                            |
| Initial V4              | 4     | 4         | 4      | 3       | 4   | 4      | 4           | 3    | 4           | 4           | pass1 captures: model too small, header button text weak; fixed real canvas bounds, immutable content hashes and on-accent color       |
| Revised V4              | 4     | 4         | 4      | 4       | 4   | 4      | 4           | 4    | 4           | 4           | 25 route/width captures,10 axe audits; pricing/market/auth low contrast and inline link distinction repaired; post-fix0 axe violations |
| School production build | 4     | 4         | 4      | 4       | 4   | 4      | 4           | 4    | 4           | 4           | Actual1440 hero and390 create captures opened;8 browser regressions pass, original/texture/version boundaries preserved                |

Actual widths1440×900 /1280×900 /768×1024 /390×844 /360×844.All5 public routes also have supplementary actual1280×800 and360×800 captures at artifacts/design-v4/required-*.png. Screenshots: artifacts/design-v4/final-{home,create,marketplace,pricing,login}-{width}.png; hero-final-desktop.png, hero-final-mobile.png, create-final-mobile.png; actual private editor/mobile captures remain under artifacts/mascot-redesign. Tests use real software WebGL rendering and actual GLB exports, not fabricated completion.

Vercel audit findings fixed:

- premium.css: header CTA uses on-accent instead of inherited muted text.
- premium.css: workspace notice, pricing table/policy and auth caption use readable semantic muted token.
- auth-form.tsx: inline signup/help links underlined, input names/autocomplete/spellcheck; decorative aside heading is h2, form remains h1.
- create-entry.tsx: keyboard file picker alongside drop target, type/count/size error and selected filenames; files remain memory-only until explicit authenticated upload.
- capture.tsx: development-only capture loads solely for an explicit capture hash; production /design-preview returns404.
- CSS: explicit mobile reflow, focus-visible and reduced motion preserved; UI control boundary token is brighter than structural border.

No live-user or hardware speed benchmark is claimed. Homepage has no WebGL canvas and uses optimized actual poster; 3D stays opt-in in existing viewer/editor. Self-host font subsets avoid render-time Google requests. Real new-user SMTP and reconstruction image→3D quality remain pre-existing blockers; tests do not pretend those end-to-end paths succeed.

Figma QA: inspected desktop and mobile/editor specs; initial transformed image clipping corrected, unsupported WebP preview replaced with PNG and rechecked. Other native specs are semantic editable design intent, not falsely reported as pixel-identical code captures. MagicPath A/B Korean font tofu repaired and final rendered revisions inspected; A selected.

Final polish: preview toggles have44px touch height; Next viewport theme-color and manifest match the canvas token. Production build and all8 browser regressions pass again in49.8s. Additional Figma captures16/17/18/19 are not fully reconciled because the Starter MCP quota was reached; reviewed native/source-reconciled frames remain available.
