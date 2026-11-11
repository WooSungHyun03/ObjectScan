#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npx playwright test tests/e2e/visual.spec.ts
