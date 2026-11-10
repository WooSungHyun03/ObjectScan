import { z } from "zod";
export const MAX_IMAGES = 200;
export const modeSchema = z.enum(["object", "scene"]);
export type ReconstructionMode = z.infer<typeof modeSchema>;
export const modelSchema = z.enum([
  "pixal3d",
  "object_aware_loss",
  "gaussian_wrapping",
]);
export type ModelFamily = z.infer<typeof modelSchema>;
export const states = [
  "draft",
  "uploaded",
  "awaiting_mask_review",
  "queued",
  "preflight",
  "pose_estimation",
  "segmentation",
  "reconstruction",
  "meshing",
  "texturing",
  "validating",
  "completed",
  "failed",
  "cancelled",
] as const;
export const jobStateSchema = z.enum(states);
export type JobState = z.infer<typeof jobStateSchema>;
export const imageCountSchema = z.number().int().min(1).max(MAX_IMAGES);
export function routeModel(
  mode: ReconstructionMode,
  count: number,
): ModelFamily {
  modeSchema.parse(mode);
  imageCountSchema.parse(count);
  return mode === "scene"
    ? "gaussian_wrapping"
    : count <= 20
      ? "pixal3d"
      : "object_aware_loss";
}
export function pricingTier(count: number) {
  imageCountSchema.parse(count);
  const lower = Math.floor((count - 1) / 20) * 20 + 1;
  return { lower, upper: lower + 19, key: `${lower}-${lower + 19}` };
}
export const pricingTiers = Array.from({ length: 10 }, (_, i) => ({
  lower: i * 20 + 1,
  upper: i * 20 + 20,
  key: `${i * 20 + 1}-${i * 20 + 20}`,
}));
export const selectionSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("point"),
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
    })
    .strict(),
  z
    .object({
      kind: z.literal("box"),
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
      width: z.number().positive().max(1),
      height: z.number().positive().max(1),
    })
    .strict()
    .refine(
      (s) => s.x + s.width <= 1 && s.y + s.height <= 1,
      "Selection must fit inside the original image",
    ),
]);
export type ObjectSelection = z.infer<typeof selectionSchema>;
export const projectInput = z
  .object({
    name: z.string().trim().min(1).max(80),
    mode: modeSchema,
    capture_mode: z.enum(["camera_orbit", "turntable"]).default("camera_orbit"),
  })
  .strict();
export const targetInput = z
  .object({ image_id: z.uuid(), selection: selectionSchema })
  .strict();
export const cameraSchema = z
  .object({
    image_id: z.uuid(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    fx: z.number().positive(),
    fy: z.number().positive(),
    cx: z.number().nonnegative(),
    cy: z.number().nonnegative(),
    c2w: z.array(z.number().finite()).length(16),
    convention: z.literal("opengl_z_up"),
  })
  .strict();
export const poseReportSchema = z
  .object({
    registered: z.number().int().positive(),
    candidate_count: z.number().int().positive(),
    selected_view_ids: z.array(z.uuid()).min(1).max(200),
    cameras: z.array(cameraSchema).min(1).max(200),
    canonical_front_verified: z.boolean(),
    reprojection_error: z.number().nonnegative(),
    provenance: z.literal("colmap"),
  })
  .strict();
export const uploadInput = z
  .object({
    filename: z.string().min(1).max(160),
    mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
    bytes: z
      .number()
      .int()
      .positive()
      .max(16 * 1024 * 1024),
  })
  .strict();
export const workerProgressSchema = z
  .object({
    job_id: z.uuid(),
    lease_token: z.uuid(),
    state: jobStateSchema,
    progress: z.number().int().min(0).max(99),
    message: z.string().max(300),
  })
  .strict();
export const workerFailureSchema = z
  .object({
    job_id: z.uuid(),
    lease_token: z.uuid(),
    error_code: z.enum([
      "GPU_OOM",
      "DATASET_INVALID",
      "POSE_UNAVAILABLE",
      "MASK_INVALID",
      "TEXTURE_BAKE_FAILED",
      "TIMEOUT",
      "MODEL_UNAVAILABLE",
      "WORKER_ERROR",
    ]),
    retryable: z.boolean().default(false),
  })
  .strict();
export const artifactReportSchema = z
  .object({
    triangles: z.number().int().positive(),
    vertices: z.number().int().positive(),
    uv_count: z.number().int().positive(),
    texture_bytes: z.number().int().positive(),
    watertight: z.boolean(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    size_bytes: z
      .number()
      .int()
      .positive()
      .max(128 * 1024 * 1024),
    gpu_peak_mib: z.number().positive(),
    elapsed_seconds: z.number().positive(),
    real_gpu: z.literal(true),
  })
  .strict();
export const workerResultSchema = z
  .object({
    job_id: z.uuid(),
    lease_token: z.uuid(),
    artifact_path: z.string().max(240).optional(),
    quality: artifactReportSchema.optional(),
    pose: poseReportSchema.optional(),
    mask_paths: z
      .array(
        z.object({ image_id: z.uuid(), path: z.string().max(240) }).strict(),
      )
      .max(200)
      .optional(),
  })
  .strict();
const next: Record<JobState, readonly JobState[]> = {
  draft: ["uploaded", "cancelled"],
  uploaded: ["awaiting_mask_review", "queued", "cancelled"],
  awaiting_mask_review: ["queued", "cancelled"],
  queued: ["preflight", "cancelled"],
  preflight: [
    "pose_estimation",
    "segmentation",
    "reconstruction",
    "failed",
    "cancelled",
  ],
  pose_estimation: [
    "segmentation",
    "reconstruction",
    "validating",
    "failed",
    "cancelled",
  ],
  segmentation: ["validating", "failed", "cancelled"],
  reconstruction: ["meshing", "failed", "cancelled"],
  meshing: ["texturing", "failed", "cancelled"],
  texturing: ["validating", "failed", "cancelled"],
  validating: ["completed", "failed", "cancelled"],
  completed: [],
  failed: [],
  cancelled: [],
};
export function canTransition(from: JobState, to: JobState) {
  return next[from].includes(to);
}
export function assertTransition(from: JobState, to: JobState) {
  if (!canTransition(from, to))
    throw new Error(`ILLEGAL_TRANSITION:${from}:${to}`);
  return to;
}
export function sceneWarnings(count: number) {
  imageCountSchema.parse(count);
  return count < 20
    ? [
        "장면 전체 복원은 최소 20장의 겹치는 사진을 권장합니다. 적은 장수는 실험 기능으로 제한됩니다.",
      ]
    : [];
}
export function representativeViewCounts(count: number) {
  imageCountSchema.parse(count);
  return count === 1 ? [1] : [2, 4, 6, 8].filter((n) => n <= count);
}
export function safeObjectPath(path: string, prefix: string) {
  return (
    path.startsWith(`${prefix}/`) &&
    !path.includes("..") &&
    !path.includes("\\") &&
    !path.includes("//") &&
    !path.startsWith("/") &&
    /^[a-zA-Z0-9/_\-.]+$/.test(path)
  );
}
export function platformFee(gross: number, bps: number) {
  if (
    !Number.isSafeInteger(gross) ||
    gross < 0 ||
    !Number.isInteger(bps) ||
    bps < 0 ||
    bps > 10000
  )
    throw new Error("INVALID_AMOUNT");
  return Math.floor((gross * bps) / 10000);
}
export function generationGate(input: {
  mode: ReconstructionMode;
  count: number;
  included: number;
  capture: "camera_orbit" | "turntable";
  masksReviewed: boolean;
  posesValid: boolean;
  selected: number;
  realGpuValidated: boolean;
  workerOnline: boolean;
  availableModels: ModelFamily[];
}) {
  const family = routeModel(input.mode, input.count),
    errors: string[] = [];
  if (!input.realGpuValidated) errors.push("REAL_GPU_NOT_VALIDATED");
  if (!input.workerOnline || !input.availableModels.includes(family))
    errors.push("MODEL_UNAVAILABLE");
  if (input.included < 1) errors.push("NO_INCLUDED_IMAGES");
  if (input.capture === "turntable") errors.push("TURNTABLE_NOT_VALIDATED");
  if (input.mode === "object" && !input.masksReviewed)
    errors.push("MASK_REVIEW_REQUIRED");
  if (input.mode === "scene" && input.count < 20)
    errors.push("SCENE_EXPERIMENTAL");
  if (!(input.mode === "object" && input.count === 1) && !input.posesValid)
    errors.push("POSE_UNAVAILABLE");
  if (
    family === "pixal3d" &&
    input.count > 1 &&
    ![2, 4, 6, 8].includes(input.selected)
  )
    errors.push("INVALID_VIEW_COUNT");
  return {
    allowed: errors.length === 0,
    errors,
    family,
    tier: pricingTier(input.count),
  };
}
export type Project = {
  id: string;
  name: string;
  mode: ReconstructionMode;
  capture_mode: "camera_orbit" | "turntable";
  status: JobState;
  input_image_count: number;
  created_at: string;
  updated_at: string;
  target_image_id?: string | null;
  target_selection?: ObjectSelection | null;
  pose_report?: z.infer<typeof poseReportSchema> | null;
};
export type ProjectImage = {
  id: string;
  project_id: string;
  filename: string;
  original_path: string;
  normalized_path?: string | null;
  position: number;
  excluded: boolean;
  width: number;
  height: number;
  size_bytes: number;
  status: string;
  url?: string;
  mask_url?: string;
  mask_reviewed?: boolean;
};
export type Job = {
  id: string;
  project_id: string;
  kind: "masks" | "poses" | "generation";
  state: JobState;
  progress: number;
  model: ModelFamily;
  error_code?: string;
  created_at: string;
  updated_at: string;
  events?: {
    id: string;
    stage: string;
    message: string;
    progress: number;
    created_at: string;
  }[];
};
export type Artifact = {
  can_publish?: boolean;
  id: string;
  project_id: string;
  name: string;
  storage_path: string;
  quality: z.infer<typeof artifactReportSchema>;
  created_at: string;
};
