import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
const run = (command, args) => {
  const r = spawnSync(command, args, { encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim().slice(0, 500) : "unavailable";
};
console.log(
  JSON.stringify(
    {
      node: process.version,
      gpu: run("nvidia-smi", [
        "--query-gpu=name,memory.total,memory.used",
        "--format=csv,noheader",
      ]),
      colmap: run("which", ["colmap"]),
      worker_venv: existsSync("gpu-worker/.venv/bin/python"),
      web_env: existsSync("apps/web/.env.local"),
      real_gpu_validated: false,
      notice:
        "Device inventory does not validate model inference. No secret values are printed.",
    },
    null,
    2,
  ),
);
