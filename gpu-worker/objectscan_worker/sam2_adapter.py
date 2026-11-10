"""SAM2.1 video propagation on ordered orbit photos with reviewed outputs.
Different source dimensions are letterboxed, then each mask is restored exactly.
"""

import argparse
import json
import time
from pathlib import Path

import numpy as np
from PIL import Image


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--work", type=Path, required=True)
    parser.add_argument("--checkpoint", type=Path, required=True)
    parser.add_argument("--config", default="configs/sam2.1/sam2.1_hiera_s.yaml")
    args = parser.parse_args()
    import torch
    from sam2.build_sam import build_sam2_video_predictor

    if not torch.cuda.is_available():
        raise RuntimeError("MODEL_UNAVAILABLE: CUDA is required")
    manifest = json.loads((args.work / "manifest.json").read_text())
    if manifest["mode"] != "object" or not manifest["selection"]:
        raise ValueError("TARGET_REQUIRED")
    frames = args.work / "frames"
    frames.mkdir(exist_ok=True)
    metadata = []
    target = None
    side = 1024
    for index, ref in enumerate(manifest["images"]):
        image = Image.open(args.work / "images" / (ref["image_id"] + ".jpg")).convert(
            "RGB"
        )
        w, h = image.size
        factor = min(side / w, side / h)
        rw, rh = round(w * factor), round(h * factor)
        left, top = (side - rw) // 2, (side - rh) // 2
        frame = Image.new("RGB", (side, side))
        frame.paste(image.resize((rw, rh), Image.Resampling.LANCZOS), (left, top))
        frame.save(frames / f"{index:05d}.jpg", quality=95)
        metadata.append((w, h, rw, rh, left, top))
        if ref["image_id"] == manifest["target_image_id"]:
            target = index
    if target is None:
        raise ValueError("TARGET_REQUIRED")
    w, h, rw, rh, left, top = metadata[target]
    selection = manifest["selection"]
    kwargs = {"frame_idx": target, "obj_id": 1}
    if selection["kind"] == "point":
        kwargs.update(
            points=np.array(
                [[selection["x"] * rw + left, selection["y"] * rh + top]],
                dtype=np.float32,
            ),
            labels=np.array([1], dtype=np.int32),
        )
    else:
        kwargs["box"] = np.array(
            [
                selection["x"] * rw + left,
                selection["y"] * rh + top,
                (selection["x"] + selection["width"]) * rw + left,
                (selection["y"] + selection["height"]) * rh + top,
            ],
            dtype=np.float32,
        )
    torch.cuda.reset_peak_memory_stats()
    started = time.monotonic()
    predictor = build_sam2_video_predictor(
        args.config, str(args.checkpoint), device="cuda"
    )
    output = args.work / "masks"
    output.mkdir(exist_ok=True)
    written = set()

    def save(index, logits):
        width, height, rw, rh, left, top = metadata[index]
        mask = (logits[0, 0] > 0).cpu().numpy().astype("uint8") * 255
        image = (
            Image.fromarray(mask)
            .crop((left, top, left + rw, top + rh))
            .resize((width, height), Image.Resampling.NEAREST)
        )
        ratio = np.count_nonzero(np.asarray(image)) / (width * height)
        if not 0.001 <= ratio <= 0.98:
            raise ValueError("MASK_INVALID")
        image.save(output / (manifest["images"][index]["image_id"] + ".png"))
        written.add(index)

    with torch.inference_mode(), torch.autocast("cuda", dtype=torch.bfloat16):
        state = predictor.init_state(
            str(frames), offload_video_to_cpu=True, offload_state_to_cpu=True
        )
        _, _, logits = predictor.add_new_points_or_box(state, **kwargs)
        save(target, logits)
        for index, _, logits in predictor.propagate_in_video(
            state, start_frame_idx=target
        ):
            save(index, logits)
        if target > 0:
            for index, _, logits in predictor.propagate_in_video(
                state, start_frame_idx=target, reverse=True
            ):
                save(index, logits)
    if len(written) != len(metadata):
        raise ValueError("MASK_COUNT_MISMATCH")
    torch.cuda.synchronize()
    (args.work / "result.json").write_text(
        json.dumps(
            {
                "mask_paths": [
                    {"image_id": r["image_id"], "path": r["mask_path"]}
                    for r in manifest["images"]
                ]
            }
        )
    )
    (args.work / "sam2-smoke.json").write_text(
        json.dumps(
            {
                "real_gpu": True,
                "checkpoint": args.checkpoint.name,
                "elapsed_seconds": time.monotonic() - started,
                "gpu_peak_mib": torch.cuda.max_memory_allocated() / 1024**2,
                "frames": len(written),
            }
        )
    )


if __name__ == "__main__":
    main()
