import "server-only";
import { z } from "zod";
import {
  workerProgressSchema,
  workerFailureSchema,
  workerResultSchema,
  poseReportSchema,
  assertTransition,
  safeObjectPath,
  type JobState,
} from "@objectscan/shared";
import { adminClient } from "@/lib/supabase/server";
import { workerAuth, fail, input, json, dbError, rate } from "./guards";
import {
  PRIVATE_BUCKET,
  RESULT_BUCKET,
  signedDownload,
  downloadBounded,
  validateMask,
  validateGLB,
} from "./files";
async function manifest(job: Record<string, unknown>) {
  const db = adminClient();
  const { data: p, error } = await db
    .from("projects")
    .select("*")
    .eq("id", job.project_id)
    .single();
  dbError(error);
  if (!p || p.revision !== job.project_revision) fail(409, "PROJECT_CHANGED");
  const { data: images, error: ie } = await db
    .from("project_images")
    .select("*")
    .eq("project_id", p.id)
    .eq("status", "verified")
    .eq("excluded", false)
    .order("position");
  dbError(ie);
  const { data: masks } = await db
    .from("object_masks")
    .select("image_id,storage_path")
    .eq("project_id", p.id)
    .eq("revision", p.revision);
  const prefix = `${job.owner_id}/${job.project_id}/jobs/${job.id}/${job.lease_token}`;
  const refs = await Promise.all(
    (images ?? []).map(async (im) => {
      const mask = masks?.find((m) => m.image_id === im.id),
        maskPath = `${prefix}/masks/${im.id}.png`,
        { data: up, error: ue } = await db.storage
          .from(PRIVATE_BUCKET)
          .createSignedUploadUrl(maskPath, { upsert: true });
      dbError(ue);
      return {
        image_id: im.id,
        filename: `${im.id}.jpg`,
        width: im.width,
        height: im.height,
        download_url: await signedDownload(im.normalized_path),
        mask_url: mask ? await signedDownload(mask.storage_path) : null,
        mask_upload_url: up?.signedUrl,
        mask_path: maskPath,
      };
    }),
  );
  const artifactPath = `${prefix}/mesh.glb`,
    previewPath = `${prefix}/preview.glb`;
  const [{ data: artifact, error: ae }, { data: preview, error: pe }] =
    await Promise.all([
      db.storage
        .from(RESULT_BUCKET)
        .createSignedUploadUrl(artifactPath, { upsert: true }),
      db.storage
        .from(RESULT_BUCKET)
        .createSignedUploadUrl(previewPath, { upsert: true }),
    ]);
  dbError(ae);
  dbError(pe);
  return {
    schema_version: 1,
    job_id: job.id,
    lease_token: job.lease_token,
    lease_expires_at: job.lease_expires_at,
    kind: job.kind,
    mode: p.mode,
    model: job.model,
    input_image_count: p.input_image_count,
    project_revision: p.revision,
    selection: p.target_selection,
    target_image_id: p.target_image_id,
    capture_mode: p.capture_mode,
    pose_report: p.pose_report,
    images: refs,
    artifact_upload_url: artifact?.signedUrl,
    artifact_path: artifactPath,
    preview_upload_url: preview?.signedUrl,
    preview_path: previewPath,
    real_gpu_required: job.kind === "generation",
  };
}
export async function workerRoute(req: Request, path: string[]) {
  if (req.method !== "POST") fail(405, "POST_REQUIRED");
  workerAuth(req);
  await rate("gpu-worker", 240);
  const db = adminClient(),
    op = path[0];
  if (op === "heartbeat-idle") {
    const v = await input(
      req,
      z
        .object({
          worker_id: z.string().min(1).max(80),
          models: z
            .array(
              z.enum([
                "sam2",
                "colmap",
                "pixal3d",
                "object_aware_loss",
                "gaussian_wrapping",
              ]),
            )
            .max(5),
        })
        .strict(),
    );
    const { error } = await db
      .from("worker_slot")
      .update({
        last_heartbeat: new Date().toISOString(),
        worker_id: v.worker_id,
        models: v.models,
      })
      .eq("id", 1)
      .is("job_id", null);
    dbError(error);
    return json({ ok: true });
  }
  if (op === "claim") {
    const v = await input(
      req,
      z
        .object({
          worker_id: z.string().min(1).max(80),
          models: z
            .array(
              z.enum([
                "sam2",
                "colmap",
                "pixal3d",
                "object_aware_loss",
                "gaussian_wrapping",
              ]),
            )
            .max(5),
        })
        .strict(),
    );
    const { data, error } = await db.rpc("claim_job", {
      p_worker: v.worker_id,
      p_models: v.models,
    });
    dbError(error);
    if (!data?.id) return json({ job: null });
    return json({ job: await manifest(data) });
  }
  const raw = await input(
    req,
    z.object({ job_id: z.uuid(), lease_token: z.uuid() }).passthrough(),
  );
  const { data: job, error } = await db
    .from("jobs")
    .select("*")
    .eq("id", raw.job_id)
    .eq("lease_token", raw.lease_token)
    .maybeSingle();
  dbError(error);
  if (
    !job ||
    !job.lease_expires_at ||
    new Date(job.lease_expires_at).getTime() <= Date.now()
  )
    fail(409, "LEASE_INVALID");
  const { data: slot } = await db
    .from("worker_slot")
    .select("id")
    .eq("id", 1)
    .eq("job_id", job.id)
    .eq("lease_token", raw.lease_token)
    .maybeSingle();
  if (!slot) fail(409, "LEASE_INVALID");
  if (op === "heartbeat") {
    const { data, error } = await db.rpc("worker_heartbeat", {
      p_job: job.id,
      p_token: raw.lease_token,
    });
    dbError(error);
    if (!data) fail(409, "JOB_CANCELLED_OR_LEASE_LOST");
    return json({ ok: true, state: job.state });
  }
  if (op === "stop-ack") {
    if (job.state !== "cancelled") fail(409, "JOB_NOT_CANCELLED");
    const v = z
      .object({
        job_id: z.uuid(),
        lease_token: z.uuid(),
        gpu_stopped: z.literal(true),
      })
      .strict()
      .parse(raw);
    const { error } = await db.rpc("finish_job", {
      p_job: job.id,
      p_token: v.lease_token,
      p_state: "cancelled",
    });
    dbError(error);
    return json({ ok: true });
  }
  if (["cancelled", "failed", "completed"].includes(job.state))
    fail(409, "JOB_TERMINAL");
  if (op === "manifest") return json({ job: await manifest(job) });
  if (op === "progress") {
    const v = workerProgressSchema.parse(raw);
    if (
      [
        "completed",
        "failed",
        "cancelled",
        "queued",
        "draft",
        "uploaded",
        "awaiting_mask_review",
      ].includes(v.state)
    )
      fail(409, "PROGRESS_STATE_INVALID");
    if (v.state !== job.state) {
      try {
        assertTransition(job.state as JobState, v.state);
      } catch {
        fail(409, "STATE_INVALID");
      }
    }
    if (v.progress < job.progress) fail(409, "PROGRESS_REVERSED");
    const { data, error } = await db
      .from("jobs")
      .update({
        state: v.state,
        progress: v.progress,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id)
      .eq("state", job.state)
      .eq("lease_token", v.lease_token)
      .select("id")
      .maybeSingle();
    dbError(error);
    if (!data) fail(409, "STATE_CHANGED");
    await db.from("job_events").insert({
      job_id: job.id,
      owner_id: job.owner_id,
      stage: v.state,
      progress: v.progress,
      message: v.message,
    });
    return json({ ok: true });
  }
  if (op === "failure") {
    const v = workerFailureSchema.parse(raw);
    const { error } = await db.rpc("finish_job", {
      p_job: job.id,
      p_token: v.lease_token,
      p_state: "failed",
      p_error: v.error_code,
    });
    dbError(error);
    return json({ ok: true });
  }
  if (op === "result") {
    const v = workerResultSchema
      .extend({ preview_path: z.string().max(240).optional() })
      .parse(raw);
    if (job.state !== "validating") fail(409, "VALIDATING_REQUIRED");
    const prefix = `${job.owner_id}/${job.project_id}/jobs/${job.id}/${job.lease_token}`;
    if (job.kind === "masks") {
      if (
        !v.mask_paths?.length ||
        new Set(v.mask_paths.map((m) => m.image_id)).size !==
          v.mask_paths.length
      )
        fail(422, "MASKS_REQUIRED");
      const { data: images } = await db
        .from("project_images")
        .select("id,width,height")
        .eq("project_id", job.project_id)
        .eq("status", "verified")
        .eq("excluded", false);
      if (images?.length !== v.mask_paths.length)
        fail(422, "MASK_COUNT_MISMATCH");
      const results = [];
      for (const m of v.mask_paths) {
        const im = images?.find((i) => i.id === m.image_id);
        if (
          !im ||
          !safeObjectPath(m.path, prefix) ||
          m.path !== `${prefix}/masks/${im.id}.png`
        )
          fail(422, "MASK_PATH_INVALID");
        const bytes = await downloadBounded(m.path, 16 * 1024 * 1024),
          ratio = await validateMask(bytes, im.width, im.height);
        results.push({ ...m, ratio });
      }
      const { error } = await db.rpc("commit_masks", {
        p_job: job.id,
        p_token: v.lease_token,
        p_masks: results,
      });
      dbError(error);
      return json({ ok: true });
    }
    if (job.kind === "poses") {
      const pose = poseReportSchema.parse(v.pose);
      const { data: p } = await db
          .from("projects")
          .select("mode,input_image_count")
          .eq("id", job.project_id)
          .single(),
        { data: images } = await db
          .from("project_images")
          .select("id")
          .eq("project_id", job.project_id)
          .eq("status", "verified")
          .eq("excluded", false);
      const ids = new Set(images?.map((i) => i.id));
      if (
        pose.registered !== pose.cameras.length ||
        pose.candidate_count !== images?.length ||
        new Set(pose.cameras.map((c) => c.image_id)).size !==
          pose.cameras.length ||
        new Set(pose.selected_view_ids).size !==
          pose.selected_view_ids.length ||
        pose.selected_view_ids.some(
          (id) => !pose.cameras.some((c) => c.image_id === id),
        ) ||
        pose.cameras.some((c) => !ids.has(c.image_id))
      )
        fail(422, "POSE_INVALID");
      if (
        p?.mode === "object" &&
        p.input_image_count <= 20 &&
        (!pose.canonical_front_verified ||
          ![2, 4, 6, 8].includes(pose.selected_view_ids.length))
      )
        fail(422, "MV_POSE_INVALID");
      const { error } = await db.rpc("commit_poses", {
        p_job: job.id,
        p_token: v.lease_token,
        p_report: pose,
      });
      dbError(error);
      return json({ ok: true });
    }
    if (process.env.REAL_GPU_VALIDATED !== "true")
      fail(503, "REAL_GPU_NOT_VALIDATED");
    if (
      !v.quality ||
      !v.artifact_path ||
      v.artifact_path !== `${prefix}/mesh.glb` ||
      !safeObjectPath(v.artifact_path, prefix)
    )
      fail(422, "ARTIFACT_REQUIRED");
    const bytes = await downloadBounded(v.artifact_path),
      quality = await validateGLB(bytes);
    if (
      quality.sha256 !== v.quality.sha256 ||
      quality.size_bytes !== v.quality.size_bytes ||
      quality.triangles !== v.quality.triangles
    )
      fail(422, "ARTIFACT_REPORT_MISMATCH");
    let preview: string | null = null;
    if (v.preview_path) {
      if (v.preview_path !== `${prefix}/preview.glb`)
        fail(422, "PREVIEW_PATH_INVALID");
      const previewBytes = await downloadBounded(
          v.preview_path,
          16 * 1024 * 1024,
        ),
        q = await validateGLB(previewBytes);
      if (q.triangles > Math.min(20000, quality.triangles * 0.25))
        fail(422, "PREVIEW_TOO_DETAILED");
      preview = v.preview_path;
    }
    const { data, error } = await db.rpc("commit_artifact", {
      p_job: job.id,
      p_token: v.lease_token,
      p_path: v.artifact_path,
      p_quality: { ...v.quality, ...quality },
      p_preview: preview,
    });
    dbError(error);
    return json({ ok: true, artifact_id: data });
  }
  fail(404, "NOT_FOUND");
}
