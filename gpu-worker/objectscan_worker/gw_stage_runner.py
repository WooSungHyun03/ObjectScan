"""Opt-in headless GW rasterization using the upstream CUDA context switch.

Preserves training, cameras, extraction and loss code in the pinned checkout.
Only the MeshRasterizer constructor's supported use_opengl option changes.
"""

import argparse
import functools
import json
import runpy
import subprocess
import sys
from pathlib import Path


def use_cuda_context(rasterizer):
    original = rasterizer.__init__

    @functools.wraps(original)
    def initialize(self, *args, **kwargs):
        if len(args) > 2 or kwargs.get("use_opengl") is True:
            raise ValueError("RASTERIZER_CONFIGURATION_CONFLICT")
        kwargs["use_opengl"] = False
        return original(self, *args, **kwargs)

    rasterizer.__init__ = initialize


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument(
        "--stage",
        choices=["pivot_based_mesh_extraction.py", "texture_mesh.py"],
        required=True,
    )
    parser.add_argument("args", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    repo = args.repo.resolve(strict=True)
    lock = json.loads((Path(__file__).parent.parent / "models.lock.json").read_text())
    if (
        subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=repo, text=True
        ).strip()
        != lock["gaussian_wrapping"]["commit"]
    ):
        raise ValueError("MODEL_COMMIT_MISMATCH")
    sys.path.insert(0, str(repo))
    sys.path.insert(0, str(repo / "gaussian_wrapping"))
    from scene.mesh import MeshRasterizer

    use_cuda_context(MeshRasterizer)
    stage = repo / "gaussian_wrapping" / args.stage
    arguments = args.args[1:] if args.args[:1] == ["--"] else args.args
    sys.argv = [str(stage), *arguments]
    print(
        "Execution profile: gw_cuda_rasterizer (upstream use_opengl=False)", flush=True
    )
    runpy.run_path(str(stage), run_name="__main__")


if __name__ == "__main__":
    main()
