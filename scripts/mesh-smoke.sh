#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npx vitest run packages/mesh-editor/src/editor.test.ts tests/editor-versions.test.ts
npx playwright test tests/e2e/editor.spec.ts
