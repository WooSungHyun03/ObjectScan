# V4 change log

Loop1: baseline and A/B/C directions; built MagicPath A/B, inspected them and repaired missing Korean font. Built real landing/create shared components, actual model posters and semantic palette. Browser review found undersized model and weak header CTA text.

Loop2: corrected actual transparent model bounds, content-hashed poster URLs (avoids stale optimizer cache), header contrast and shared control treatment. Axe found legacy gray pricing/market/auth text and un-underlined inline signup link; repaired them. A later pricing policy text issue was separately isolated and fixed. Figma transform clipping and non-rendering WebP were inspected and corrected with PNG content.

Loop3: production school build and full regressions, typed/photo draft handoff through authentication, immutable versions and large GLB preservation. An overlapping Playwright invocation collided in the shared trace directory; reran suites serially/with isolated output. That infrastructure failure is not a product pass. Latest evidence and release state are in IMPLEMENTATION_STATUS.md.
