"""Opt-in NAF FP16 execution; preserves the upstream feature-output dtype.

The unchanged upstream FP32 NAF exhausted this host's 16GB GPU at 1024.
This changes numerical precision, so it needs separate output/visual validation.
It does not change the selected reconstruction model, cameras or alpha masks.
"""

import torch


class HalfPrecisionNAF(torch.nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model.to(dtype=torch.float16)
        # RoPE constructs its coordinate grid from this explicit dtype, rather
        # than its buffers' dtype. Without it FP32 sin/cos promote Q/K again.
        self.model.image_encoder.rope.dtype = torch.float16
        self.model.image_encoder.rope._cached_coords = None
        self.model.image_encoder.rope._cached_hw = None
        self.eval()

    def forward(self, image, features, output_size):
        result = self.model(
            image.to(dtype=torch.float16),
            features.to(dtype=torch.float16),
            output_size,
        )
        return result.to(dtype=features.dtype)
