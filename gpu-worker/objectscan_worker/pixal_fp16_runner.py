"""Experimental single-view Pixal runner with only NAF precision changed.

Loads the original, pinned inference module without editing its source. All
runtime remote dependencies must already be cached at recorded revisions.
"""

import argparse
import hashlib
import importlib
import json
import os
import sys
from pathlib import Path

os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--image", type=Path, required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--model_path", required=True)
    parser.add_argument("--low_vram", action="store_true")
    parser.add_argument("--resolution", type=int, default=1024)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    if not args.low_vram or args.resolution != 1024:
        parser.error("Only experimental single-view low_vram 1024 is supported")
    import torch
    from huggingface_hub.constants import HF_HUB_CACHE
    from PIL import Image
    from pixal_precision import HalfPrecisionNAF

    image = Image.open(args.image)
    if image.mode != "RGBA" or image.getchannel("A").getextrema()[0] == 255:
        raise ValueError("SAM2_ALPHA_REQUIRED")
    lock = json.loads((Path(__file__).parent.parent / "models.lock.json").read_text())
    root = Path(torch.hub.get_dir()) / "valeoai_NAF_main"
    digest = hashlib.sha256()
    for path in [root / "hubconf.py", *sorted((root / "src").rglob("*.py"))]:
        digest.update(str(path.relative_to(root)).encode())
        digest.update(b"\0")
        digest.update(path.read_bytes())
    if digest.hexdigest() != lock["naf"]["source_sha256"]:
        raise ValueError("NAF_SOURCE_MISMATCH")
    checkpoint = Path(torch.hub.get_dir()) / "checkpoints/naf_release.pth"
    if (
        hashlib.sha256(checkpoint.read_bytes()).hexdigest()
        != lock["naf"]["checkpoint_sha256"]
    ):
        raise ValueError("NAF_WEIGHTS_MISMATCH")
    for name in ("rmbg2", "dinov3", "moge2_weights"):
        pin = lock[name]
        ref = (
            Path(HF_HUB_CACHE)
            / ("models--" + pin["repo"].replace("/", "--"))
            / "refs/main"
        )
        if ref.read_text().strip() != pin["revision"]:
            raise ValueError("DEPENDENCY_REVISION_MISMATCH")
    sys.path.insert(0, str(args.repo.resolve()))
    upstream = importlib.import_module("inference")
    original_init = upstream.init_pipeline

    def init_with_naf_precision(*a, **kw):
        pipeline = original_init(*a, **kw)
        for name in ("shape_512", "shape_1024", "tex_1024"):
            extractor = getattr(pipeline, "image_cond_model_" + name)
            extractor.naf_model = HalfPrecisionNAF(extractor.naf_model)
        return pipeline

    upstream.init_pipeline = init_with_naf_precision
    print(
        "Experimental execution profile: naf_fp16; upstream model and camera estimation unchanged",
        flush=True,
    )
    upstream.run_inference(
        image_path=str(args.image),
        output_path=args.output,
        seed=args.seed,
        model_path=args.model_path,
        low_vram=True,
        resolution=args.resolution,
    )


if __name__ == "__main__":
    main()
