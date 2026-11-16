import { describe, expect, it } from "vitest";
import {
  availabilityMessage,
  blockedGenerationMessage,
  generationHealthSchema,
  generationQuoteSchema,
  generationWalletSchema,
  quotedCredits,
} from "../apps/web/src/features/create/generation-availability";

const health = generationHealthSchema.parse({
  configured: true,
  worker_online: true,
  real_gpu_validated: true,
  capabilities: { single_photo: true },
});
const wallet = generationWalletSchema.parse({
  balance: 9,
  rates: [
    { mode: "scene", min_images: 1, credits: 7 },
    { mode: "object", min_images: 1, credits: 3 },
    { mode: "object", min_images: 21, credits: 8 },
  ],
});

describe("OS-01 generation availability", () => {
  it("shows only advertised public input support and distinguishes an unavailable service", () => {
    expect(availabilityMessage(health, "object", 1)).toContain(
      "한 장으로 제작할 수",
    );
    expect(availabilityMessage(health, "scene", 1)).toContain("업로드 후");
    expect(availabilityMessage(health, "object", 2)).toContain("업로드 후");
    expect(
      availabilityMessage({ ...health, worker_online: false }, "object", 1),
    ).toContain("연결할 수 없습니다");
    expect(
      availabilityMessage({ ...health, capabilities: undefined }, "object", 1),
    ).toContain("업로드 후");
    expect(availabilityMessage(undefined, "object", 1)).toContain(
      "확인하고 있습니다",
    );
    expect(generationHealthSchema.safeParse({}).success).toBe(false);
  });

  it.each(["object", "scene"])(
    "explains rejected %s inputs without exposing internal codes or a charge",
    (mode) => {
      const quote = generationQuoteSchema.parse({
        project: { mode, input_image_count: 20 },
        gate: {
          allowed: false,
          errors: ["INPUT_PROFILE_NOT_VALIDATED", "MODEL_UNAVAILABLE"],
        },
      });
      expect(blockedGenerationMessage(quote)).toContain(
        "제작을 지원하지 않습니다",
      );
      expect(blockedGenerationMessage(quote)).not.toMatch(/[A-Z_]+/);
      expect(quotedCredits(quote, wallet)).toBeUndefined();
    },
  );

  it("uses the server rate by mode and count with confirmed conditions", () => {
    const quote = generationQuoteSchema.parse({
      project: { mode: "object", input_image_count: 1 },
      gate: { allowed: true, errors: [] },
    });
    expect(quotedCredits(quote, wallet)).toBe(3);
    expect(quotedCredits(quote, undefined)).toBeUndefined();
    expect(quotedCredits(undefined, wallet)).toBeUndefined();
    expect(
      generationQuoteSchema.safeParse({ gate: { allowed: true } }).success,
    ).toBe(false);
  });
});
