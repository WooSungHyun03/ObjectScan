#!/usr/bin/env python3
"""Run the production adapter under the worker's host lock, with timeout teardown.

Use the base worker interpreter. The work directory must already contain real
images/masks and manifest.json; multi-view requires measured camera data.
This does not mark any model production-validated or enqueue a paid order.
"""

import argparse
import fcntl
import json
import signal
import sys
from pathlib import Path

from objectscan_worker.process import run_stage


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--work", type=Path, required=True)
    parser.add_argument("--worker-root", type=Path, required=True)
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--python", required=True)
    parser.add_argument("--weights", type=Path)
    parser.add_argument("--iterations", type=int, default=30000)
    parser.add_argument("--timeout", type=int, default=14400)
    args = parser.parse_args()
    work = args.work.resolve(strict=True)
    if not (work / "manifest.json").is_file():
        parser.error("Real input manifest.json required")
    args.worker_root.mkdir(parents=True, exist_ok=True)
    argv = [
        sys.executable,
        "-u",
        "-m",
        "objectscan_worker.reconstruct_adapter",
        "--work",
        str(work),
        "--repo",
        str(args.repo.resolve(strict=True)),
        "--python",
        args.python,
        "--iterations",
        str(args.iterations),
    ]
    if args.weights:
        argv += ["--weights", str(args.weights.resolve(strict=True))]
    running = [True]
    for sig in (signal.SIGINT, signal.SIGTERM):
        signal.signal(sig, lambda *_: running.__setitem__(0, False))
    with (args.worker_root / "worker.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        # A prior result cannot prove that this run succeeded.
        (work / "result.json").unlink(missing_ok=True)
        run_stage(
            argv, Path.cwd(), work / "smoke.log", lambda: running[0], args.timeout
        )
        report = json.loads((work / "result.json").read_text())["quality"]
        if not report.get("real_gpu") or report.get("gpu_peak_mib", 0) <= 0:
            raise ValueError("REAL_GPU_MEASUREMENT_REQUIRED")
        print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
