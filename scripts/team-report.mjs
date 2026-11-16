#!/usr/bin/env node
// Runs one ticket's MOCK fixture suite and writes output/playwright/<ticket>/REPORT.md.
// Usage: node scripts/team-report.mjs OS-12
import { spawnSync, execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const ticket = process.argv[2];
if (!/^OS-\d+$/.test(ticket ?? "")) {
  console.error("usage: node scripts/team-report.mjs OS-<n>");
  process.exit(2);
}
const cmd = `npx playwright test --config playwright.team.config.ts --grep ${ticket} --reporter=line`;
const run = spawnSync(cmd, { shell: true, encoding: "utf8" });
const redact = (s) =>
  s
    .replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[JWT]")
    .replace(
      /([?&](token|sig|signature|X-Amz-[\w-]+)=)[^&\s]+/gi,
      "$1[REDACTED]",
    )
    .replace(/(sk|pk|sb)_(live|test|secret)_\w+/gi, "[KEY]");
const sha = execSync("git rev-parse --short HEAD").toString().trim();
const dirty = execSync("git status --porcelain --untracked-files=no")
  .toString()
  .trim()
  ? " (uncommitted changes)"
  : "";
const exit = run.status ?? 1;
const dir = `output/playwright/${ticket}`;
mkdirSync(dir, { recursive: true });
writeFileSync(
  `${dir}/REPORT.md`,
  `# ${ticket} team fixture report

- Commit: \`${sha}\`${dirty}
- Command: \`${cmd}\`
- Exit code: ${exit}
- Data: **MOCK** (fixture shell, no keys / DB / GPU / PG)
- TEAM gate: **${exit === 0 ? "TEAM_PASS" : "TEAM_FAIL"}**
- SERVICE gate: **SERVICE_PENDING**. Real DB/RLS/GPU/PG/deploy verification is Owner-only and not claimed here. Nothing is deployed.

## Log (redacted)

\`\`\`
${redact(run.stdout + run.stderr).trim()}
\`\`\`
`,
);
console.log(`${dir}/REPORT.md — exit ${exit}`);
process.exit(exit);
