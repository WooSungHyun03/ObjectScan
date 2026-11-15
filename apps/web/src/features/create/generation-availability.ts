import { z } from "zod";
import {
  imageCountSchema,
  modeSchema,
  pricingTier,
  type ReconstructionMode,
} from "@objectscan/shared";
import { customerError } from "@/lib/customer-copy";

export const generationHealthSchema = z.object({
  configured: z.boolean(),
  worker_online: z.boolean(),
  real_gpu_validated: z.boolean(),
  capabilities: z.object({ single_photo: z.boolean().optional() }).optional(),
});

export const generationQuoteSchema = z.object({
  project: z.object({ mode: modeSchema, input_image_count: imageCountSchema }),
  gate: z.object({ allowed: z.boolean(), errors: z.array(z.string()) }),
});

export const generationWalletSchema = z.object({
  balance: z.number().int().nonnegative(),
  rates: z.array(
    z.object({
      mode: modeSchema,
      min_images: imageCountSchema,
      credits: z.number().int().nonnegative(),
    }),
  ),
});

export type GenerationQuote = z.infer<typeof generationQuoteSchema>;

export function availabilityMessage(
  health: z.infer<typeof generationHealthSchema> | undefined,
  mode: ReconstructionMode,
  count: number,
) {
  if (!health) return "현재 제작 지원 범위를 확인하고 있습니다.";
  if (!health.configured || !health.real_gpu_validated)
    return "현재 3D 제작을 준비 중입니다. 사진 선택과 업로드는 계속할 수 있습니다.";
  if (!health.worker_online)
    return "현재 제작 서비스에 연결할 수 없습니다. 잠시 후 다시 확인해 주세요.";
  if (mode === "object" && count <= 1) {
    if (health.capabilities?.single_photo === true)
      return "물체 사진 한 장으로 제작할 수 있습니다. 업로드 후 최종 조건을 확인해 주세요.";
    if (health.capabilities?.single_photo === false)
      return "일반 공개 제작에서 물체 사진 한 장은 아직 지원하지 않습니다. 업로드 후 현재 프로젝트의 지원 여부를 확인할 수 있습니다.";
  }
  return "이 사진 구성의 지원 여부는 업로드 후 프로젝트에서 확인할 수 있습니다.";
}

export function blockedGenerationMessage(quote: GenerationQuote) {
  const { errors } = quote.gate;
  if (errors.includes("INPUT_PROFILE_NOT_VALIDATED")) {
    return quote.project.mode === "scene"
      ? "현재 이 공간 사진 구성은 제작을 지원하지 않습니다. 물체 한 장의 지원 여부를 확인하거나 나중에 다시 확인해 주세요."
      : "현재 이 물체 사진 구성은 제작을 지원하지 않습니다. 사진 한 장의 지원 여부를 확인하거나 나중에 다시 확인해 주세요.";
  }
  if (errors.includes("MODEL_UNAVAILABLE"))
    return "현재 이 사진을 처리할 제작 서비스에 연결할 수 없습니다. 잠시 후 다시 확인해 주세요.";
  if (errors.includes("SCENE_EXPERIMENTAL"))
    return "공간 제작에는 서로 겹치는 사진이 20장 이상 필요합니다.";
  return customerError(errors[0]);
}

export function quotedCredits(
  quote: GenerationQuote | undefined,
  wallet: z.infer<typeof generationWalletSchema> | undefined,
) {
  if (!quote?.gate.allowed) return undefined;
  const tier = pricingTier(quote.project.input_image_count);
  return wallet?.rates.find(
    (rate) =>
      rate.mode === quote.project.mode && rate.min_images === tier.lower,
  )?.credits;
}
