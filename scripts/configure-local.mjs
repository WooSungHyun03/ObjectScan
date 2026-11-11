import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
const s = JSON.parse(readFileSync(process.argv[2], "utf8"));
if (!new URL(s.API_URL).hostname.match(/^(127\.0\.0\.1|localhost)$/))
  throw Error("Local services only");
const key = s.PUBLISHABLE_KEY ?? s.ANON_KEY,
  service = s.SERVICE_ROLE_KEY;
if (!key || !service || !s.DB_URL)
  throw Error("Local Supabase keys unavailable");
writeFileSync(
  "apps/web/.env.local",
  `NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000\nNEXT_PUBLIC_PROJECT_PURPOSE=education\nNEXT_PUBLIC_SUPABASE_URL=${s.API_URL}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${key}\nSUPABASE_SERVICE_ROLE_KEY=${service}\nOBJECTSCAN_WORKER_TOKEN=${randomBytes(32).toString("hex")}\nREAL_GPU_VALIDATED=false\nENABLED_MODELS=\nPAYMENTS_MODE=disabled\nMARKETPLACE_PAYOUTS_ENABLED=false\n`,
  { mode: 0o600 },
);
writeFileSync(
  ".env.test.local",
  `TEST_EDUCATION_MODE=true\nTEST_DATABASE_URL=${s.DB_URL}\nTEST_SUPABASE_URL=${s.API_URL}\nTEST_SUPABASE_KEY=${key}\nTEST_SERVICE_KEY=${service}\n`,
  { mode: 0o600 },
);
console.log("Isolated local environment files configured; values hidden.");
