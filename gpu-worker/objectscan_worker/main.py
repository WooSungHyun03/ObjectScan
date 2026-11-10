"""Polls HTTPS API; no public worker port and no service-role database key."""

import fcntl
import json
import os
import threading
import time
from pathlib import Path

import httpx

from .contracts import Manifest, checked_storage_url
from .process import JobStopped, ProcessFailure, run_stage


class Worker:
    def __init__(self):
        self.base = os.environ["OBJECTSCAN_API_URL"].rstrip("/")
        if not self.base.startswith("https://") and not self.base.startswith(
            "http://127.0.0.1:"
        ):
            raise ValueError("HTTPS_REQUIRED")
        self.storage = os.environ["OBJECTSCAN_STORAGE_ORIGIN"]
        self.root = Path(os.environ.get("OBJECTSCAN_WORK_ROOT", "./work")).resolve()
        self.root.mkdir(parents=True, exist_ok=True, mode=0o700)
        self.client = httpx.Client(
            timeout=30,
            follow_redirects=False,
            headers={
                "Authorization": "Bearer " + os.environ["OBJECTSCAN_WORKER_TOKEN"]
            },
        )
        # A model is advertised only after an operator has supplied a pinned, isolated adapter and real smoke report.
        self.adapters = json.loads(
            Path(os.environ["OBJECTSCAN_ADAPTER_CONFIG"]).read_text()
        )
        self.models = list(self.adapters)
        self.identity = {
            "worker_id": os.environ.get("OBJECTSCAN_WORKER_ID", "rtx4080-01"),
            "models": self.models,
        }

    def api(self, op, data):
        response = self.client.post(self.base + "/api/internal/" + op, json=data)
        response.raise_for_status()
        return response.json()

    def download(self, url, path):
        checked_storage_url(url, self.storage)
        # Storage URLs must never receive worker authentication; URLs themselves are temporary capabilities.
        with httpx.stream("GET", url, timeout=60, follow_redirects=False) as response:
            response.raise_for_status()
            size = 0
            with path.open("wb") as f:
                for chunk in response.iter_bytes():
                    size += len(chunk)
                    if size > 32 * 1024 * 1024:
                        raise ProcessFailure("DATASET_INVALID")
                    f.write(chunk)

    def job(self, raw):
        manifest = Manifest.model_validate(raw)
        adapter_key = (
            "sam2"
            if manifest.kind == "masks"
            else "colmap"
            if manifest.kind == "poses"
            else manifest.model
        )
        config = self.adapters.get(adapter_key)
        if not config:
            raise ValueError("UNADVERTISED_MODEL")
        work = self.root / str(manifest.job_id) / str(manifest.lease_token)
        work.mkdir(parents=True, exist_ok=False, mode=0o700)
        token = {
            "job_id": str(manifest.job_id),
            "lease_token": str(manifest.lease_token),
        }
        stop = threading.Event()
        lost = threading.Event()

        def heartbeat():
            while not stop.wait(15):
                try:
                    self.api("heartbeat", token)
                except (httpx.HTTPError, ValueError):
                    lost.set()
                    return

        pulse = threading.Thread(target=heartbeat, daemon=True)
        pulse.start()
        offset = 0
        stage = (
            "segmentation"
            if manifest.kind == "masks"
            else "pose_estimation"
            if manifest.kind == "poses"
            else "preflight"
        )

        def tick():
            nonlocal offset, stage
            if lost.is_set():
                return False
            events = work / "stage-events.jsonl"
            if events.exists():
                with events.open() as f:
                    f.seek(offset)
                    while True:
                        start = f.tell()
                        line = f.readline()
                        if not line or not line.endswith("\n"):
                            f.seek(start)
                            break
                        event = json.loads(line)
                        try:
                            self.api("progress", {**token, **event})
                            stage = event["state"]
                        except httpx.HTTPError:
                            lost.set()
                            return False
                    offset = f.tell()
            return True

        try:
            # Refresh short-lived download URLs for every batch; never log or persist signed URLs.
            local = manifest.model_dump(mode="json")
            for index, image in enumerate(manifest.images):
                fresh = Manifest.model_validate(self.api("manifest", token)["job"])
                remote = next(i for i in fresh.images if i.image_id == image.image_id)
                image_dir = work / "images"
                image_dir.mkdir(exist_ok=True)
                self.download(
                    remote.download_url, image_dir / (str(image.image_id) + ".jpg")
                )
                if remote.mask_url:
                    mask_dir = work / "masks"
                    mask_dir.mkdir(exist_ok=True)
                    self.download(
                        remote.mask_url, mask_dir / (str(image.image_id) + ".png")
                    )
                if not tick():
                    raise JobStopped()
            for im in local["images"]:
                for key in ("download_url", "mask_url", "mask_upload_url"):
                    im.pop(key, None)
            for key in ("artifact_upload_url", "preview_upload_url"):
                local.pop(key, None)
            (work / "manifest.json").write_text(json.dumps(local))
            # Explicit argv only, administrator-owned config. Never interpolate user names or shell commands.
            argv = [str(arg).replace("{work}", str(work)) for arg in config["argv"]]
            if manifest.kind != "generation":
                self.api(
                    "progress",
                    {
                        **token,
                        "state": stage,
                        "progress": 0,
                        "message": "독립 GPU 프로세스에서 처리 중",
                    },
                )
            run_stage(
                argv,
                Path(config["cwd"]),
                work / "adapter.log",
                tick,
                config.get("timeout_seconds", 7200),
            )
            if not tick():
                raise JobStopped()
            result = json.loads((work / "result.json").read_text())
            fresh = Manifest.model_validate(self.api("manifest", token)["job"])

            def upload(url, path, mime):
                checked_storage_url(url, self.storage)
                with path.open("rb") as f:
                    r = httpx.put(
                        url,
                        content=f,
                        headers={"Content-Type": mime},
                        timeout=180,
                        follow_redirects=False,
                    )
                    r.raise_for_status()

            if manifest.kind == "masks":
                for im in fresh.images:
                    upload(
                        im.mask_upload_url,
                        work / "masks" / (str(im.image_id) + ".png"),
                        "image/png",
                    )
                result = {
                    "mask_paths": [
                        {"image_id": str(i.image_id), "path": i.mask_path}
                        for i in fresh.images
                    ]
                }
            elif manifest.kind == "generation":
                # Adapter reports must include actual measured peak VRAM, elapsed time and real_gpu=true.
                upload(
                    fresh.artifact_upload_url, work / "mesh.glb", "model/gltf-binary"
                )
                result["artifact_path"] = fresh.artifact_path
                if (work / "preview.glb").exists():
                    upload(
                        fresh.preview_upload_url,
                        work / "preview.glb",
                        "model/gltf-binary",
                    )
                    result["preview_path"] = fresh.preview_path
            if manifest.kind == "generation":
                if stage in ("preflight", "pose_estimation"):
                    self.api(
                        "progress",
                        {
                            **token,
                            "state": "reconstruction",
                            "progress": 75,
                            "message": "복원 결과 확인",
                        },
                    )
                if stage != "texturing":
                    self.api(
                        "progress",
                        {
                            **token,
                            "state": "meshing",
                            "progress": 80,
                            "message": "메시 추출 결과 확인",
                        },
                    )
                    self.api(
                        "progress",
                        {
                            **token,
                            "state": "texturing",
                            "progress": 90,
                            "message": "UV 텍스처 베이크 결과 확인",
                        },
                    )
            self.api(
                "progress",
                {
                    **token,
                    "state": "validating",
                    "progress": 95,
                    "message": "서버에서 결과 파일을 검증합니다",
                },
            )
            self.api("result", {**result, **token})
        except JobStopped:
            # run_stage has already killed the process group. A lost/expired lease must not be released blindly.
            try:
                self.api("stop-ack", {**token, "gpu_stopped": True})
            except httpx.HTTPError:
                pass
        except Exception as error:
            code = error.code if isinstance(error, ProcessFailure) else "WORKER_ERROR"
            try:
                self.api("failure", {**token, "error_code": code, "retryable": False})
            except httpx.HTTPError:
                pass
            print("Job failed:", str(manifest.job_id), code, flush=True)
        finally:
            stop.set()
            pulse.join(timeout=35)

    def run(self):
        with (self.root / "worker.lock").open("w") as lock:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            while True:
                try:
                    self.api("heartbeat-idle", self.identity)
                    job = self.api("claim", self.identity).get("job")
                    if job:
                        self.job(job)
                except (httpx.HTTPError, ValueError):
                    print("Worker API unavailable; retrying safely", flush=True)
                time.sleep(5)


def main():
    Worker().run()


if __name__ == "__main__":
    main()
