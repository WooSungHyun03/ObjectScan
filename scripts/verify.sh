#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npx prettier --check apps packages scripts tests
npm run lint
npm run typecheck
npx supabase migration up --local
npm test
npm run build
if [[ -x gpu-worker/.venv/bin/python ]]; then
  gpu-worker/.venv/bin/python -m pytest gpu-worker/tests
else
  python3 -m pytest gpu-worker/tests
fi
if [[ "${OBJECTSCAN_E2E:-0}" == "1" ]]; then npm run test:e2e; fi
