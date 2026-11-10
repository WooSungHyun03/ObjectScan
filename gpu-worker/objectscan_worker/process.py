"""Supervise an entire process group; never release a lease before children stop."""

import os
import signal
import subprocess
import time
from collections.abc import Callable
from pathlib import Path


class JobStopped(RuntimeError):
    pass


class ProcessFailure(RuntimeError):
    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


def terminate_group(proc: subprocess.Popen, grace: float = 8) -> None:
    # Kill the group even when the leader already exited: CUDA descendants may live.
    try:
        os.killpg(proc.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    until = time.monotonic() + grace
    while time.monotonic() < until:
        try:
            os.killpg(proc.pid, 0)
        except ProcessLookupError:
            proc.wait()
            return
        time.sleep(0.05)
    try:
        os.killpg(proc.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    proc.wait()


def run_stage(
    argv: list[str],
    cwd: Path,
    log: Path,
    tick: Callable[[], bool],
    timeout: float = 7200,
) -> None:
    if not argv or not all(isinstance(a, str) and a for a in argv):
        raise ValueError("argv must contain nonempty strings; shell is forbidden")
    with log.open("ab") as output:
        stage_start = output.tell()
        child_env = os.environ.copy()
        for name in (
            "OBJECTSCAN_WORKER_TOKEN",
            "OBJECTSCAN_VERCEL_BYPASS_SECRET",
            "OBJECTSCAN_VERCEL_OIDC_TOKEN",
            "VERCEL_OIDC_TOKEN",
            "SUPABASE_SERVICE_ROLE_KEY",
            "TOSS_SECRET_KEY",
        ):
            child_env.pop(name, None)
        proc = subprocess.Popen(
            argv,
            cwd=cwd,
            stdout=output,
            stderr=subprocess.STDOUT,
            start_new_session=True,
            env=child_env,
        )
        started = time.monotonic()
        try:
            while proc.poll() is None:
                if not tick():
                    raise JobStopped("LEASE_LOST_OR_CANCELLED")
                if time.monotonic() - started > timeout:
                    raise ProcessFailure("TIMEOUT")
                time.sleep(0.2)
            if proc.returncode:
                with log.open("rb") as captured:
                    captured.seek(stage_start)
                    carry = b""
                    oom = False
                    while chunk := captured.read(65536):
                        text = carry + chunk.lower()
                        if b"out of memory" in text:
                            oom = True
                            break
                        carry = text[-32:]
                raise ProcessFailure("GPU_OOM" if oom else "WORKER_ERROR")
        finally:
            terminate_group(proc)
