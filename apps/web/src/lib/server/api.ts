import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  projectInput,
  uploadInput,
  targetInput,
  pricingTier,
  generationGate,
  platformFee,
  type ModelFamily,
} from "@objectscan/shared";
import { adminClient, configured, userClient } from "@/lib/supabase/server";
import {
  route,
  json,
  fail,
  requireUser,
  sameOrigin,
  input,
  ownerProject,
  operator,
  rate,
  dbError,
} from "./guards";
import {
  PRIVATE_BUCKET,
  SOURCE_BUCKET,
  RESULT_BUCKET,
  signedDownload,
  downloadBounded,
  normalizeImage,
  safeFilename,
  validateGLB,
} from "./files";
import { health } from "./health";
import {
  assertCommerceAllowed,
  paymentMode,
  verifyPayment,
  refundTestPayment,
} from "./payments";
import { editorRoute } from "./editor-api";
import { cleanupUploads } from "./maintenance";
import { workerRoute } from "./worker-api";
const uuid = z.uuid();
// TEST listings must remain invisible to the existing public deployment.
const marketStatus = (status: string) =>
  paymentMode() === "test" ? `sandbox_${status}` : status;
const marketStatuses = () =>
  ["draft", "pending", "approved", "rejected", "removed"].map(marketStatus);
async function mutable(pid: string) {
  const { error } = await adminClient().rpc("check_project_mutable", {
    p_project: pid,
  });
  dbError(error);
}
async function downloadable(id: string, owner: string) {
  const db = adminClient(),
    { data: asset, error } = await db
      .from("artifacts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
  dbError(error);
  if (!asset) fail(404, "ASSET_NOT_FOUND");
  if (asset.owner_id !== owner) {
    const { data: purchase } = await db
      .from("asset_purchases")
      .select("id")
      .eq("artifact_id", asset.id)
      .eq("buyer_id", owner)
      .is("revoked_at", null)
      .maybeSingle();
    if (!purchase) fail(404, "ASSET_NOT_FOUND");
  }
  return asset;
}
async function gateProject(pid: string, owner: string) {
  const project = await ownerProject(pid, owner),
    db = adminClient();
  const [{ data: images, error: ie }, { data: masks, error: me }, h] =
    await Promise.all([
      db
        .from("project_images")
        .select("id")
        .eq("project_id", pid)
        .eq("status", "verified")
        .eq("excluded", false),
      db
        .from("object_masks")
        .select("image_id,reviewed,revision")
        .eq("project_id", pid),
      health(),
    ]);
  dbError(ie);
  dbError(me);
  const pose = project.pose_report;
  const gate = generationGate({
    mode: project.mode,
    count: project.input_image_count,
    included: images?.length ?? 0,
    capture: project.capture_mode,
    masksReviewed: (images ?? []).every((i) =>
      masks?.some(
        (m) =>
          m.image_id === i.id && m.reviewed && m.revision === project.revision,
      ),
    ),
    posesValid: Boolean(
      project.mode === "scene"
        ? pose?.registered >= 20
        : project.input_image_count <= 20
          ? pose?.canonical_front_verified
          : pose?.registered >= 21,
    ),
    selected:
      pose?.selected_view_ids?.length ??
      (project.input_image_count === 1 ? 1 : 0),
    realGpuValidated: h.real_gpu_validated,
    workerOnline: h.worker_online,
    availableModels: h.models as ModelFamily[],
    validatedProfiles: h.validated_profiles,
    ownerId: owner,
  });
  return { project, gate, health: h };
}
export function handle(req: Request) {
  return route(async () => {
    const path = new URL(req.url).pathname
        .replace(/^\/api\/?/, "")
        .split("/")
        .filter(Boolean),
      method = req.method,
      dbReady = configured();
    if (path[0] === "internal") return workerRoute(req, path.slice(1));
    if (path[0] === "health") {
      const { models, validated_profiles, ...status } = await health();
      return json({
        ...status,
        capabilities: {
          single_photo:
            models.includes("pixal3d") &&
            validated_profiles.some(
              (p: {
                model: string;
                min_images: number;
                max_images: number;
                owner_ids?: string[];
              }) =>
                p.model === "pixal3d" &&
                p.min_images <= 1 &&
                p.max_images >= 1 &&
                !p.owner_ids,
            ),
        },
      });
    }
    if (method === "POST" && path[0] === "payments" && path[1] === "webhook") {
      if (paymentMode() === "disabled") fail(503, "PAYMENTS_DISABLED");
      const v = await input(
        req,
        z
          .object({
            eventType: z.string(),
            data: z
              .object({
                paymentKey: z.string().min(1).max(200),
                orderId: z.uuid(),
              })
              .passthrough(),
          })
          .passthrough(),
      );
      // Toss standard payment webhooks are notifications, never proof of payment: authenticated re-query is authoritative.
      const { data: o } = await adminClient()
        .from("orders")
        .select("amount,status")
        .eq("id", v.data.orderId)
        .maybeSingle();
      if (!o) fail(404, "ORDER_NOT_FOUND");
      await verifyPayment(
        v.data.paymentKey,
        v.data.orderId,
        Number(o.amount),
        false,
      );
      return json({ received: true });
    }
    if (!["GET", "HEAD"].includes(method)) sameOrigin(req);
    if (["pricing", "listings"].includes(path[0]) && method === "GET") {
      if (!dbReady) fail(503, "SUPABASE_NOT_CONFIGURED");
      const db = adminClient();
      if (path[0] === "pricing") {
        const [{ data: tiers, error }, { data: fee }] = await Promise.all([
          db
            .from("pricing_tiers")
            .select("mode,min_images,max_images,amount,currency")
            .eq("enabled", true)
            .order("min_images"),
          db
            .from("app_config")
            .select("value")
            .eq("key", "commission_bps")
            .single(),
        ]);
        dbError(error);
        return json({
          tiers,
          packages:
            (
              await db
                .from("credit_packages")
                .select("id,name,credits,amount")
                .eq("enabled", true)
            ).data ?? [],
          credit_rates:
            (
              await db
                .from("generation_credit_rates")
                .select("mode,min_images,credits")
                .eq("enabled", true)
            ).data ?? [],
          commission_bps: fee?.value ?? null,
          payments_mode: paymentMode(),
        });
      }
      let q = db
        .from("marketplace_listings")
        .select(
          "id,title,description,category,price,currency,license,public_preview_path,created_at",
        )
        .eq("status", marketStatus("approved"));
      if (path[1]) {
        const { data, error } = await q
          .eq("id", uuid.parse(path[1]))
          .maybeSingle();
        dbError(error);
        if (!data) fail(404, "LISTING_NOT_FOUND");
        return json({
          ...data,
          preview_url: data.public_preview_path
            ? db.storage
                .from("market-previews")
                .getPublicUrl(data.public_preview_path).data.publicUrl
            : null,
          seller_badge: "검토된 크리에이터",
        });
      }
      const url = new URL(req.url),
        search = (url.searchParams.get("search") ?? "")
          .replace(/[%_,()]/g, "")
          .slice(0, 80),
        category = url.searchParams.get("category");
      if (search) q = q.ilike("title", `%${search}%`);
      if (category && category !== "all") q = q.eq("category", category);
      q =
        url.searchParams.get("sort") === "price"
          ? q.order("price")
          : q.order("created_at", { ascending: false });
      const { data, error } = await q.limit(100);
      dbError(error);
      return json(data);
    }
    const user = await requireUser();
    await rate(user.id, method === "GET" ? 240 : 60);
    const db = adminClient();
    if (
      (path[0] === "projects" && path[2] === "editor") ||
      (path[0] === "assets" && path[2] === "versions")
    ) {
      const result = await editorRoute(req, path, user.id);
      if (result) return result;
    }
    if (path[0] === "settings" && method === "PATCH") {
      const v = await input(
          req,
          z.object({ display_name: z.string().trim().min(1).max(80) }).strict(),
        ),
        { error } = await (
          await userClient()
        )
          .from("profiles")
          .update(v)
          .eq("id", user.id);
      dbError(error);
      return json({ ok: true });
    }
    if (path[0] === "data-deletion" && method === "POST") {
      const { error } = await db.from("audit_logs").insert({
        actor_id: user.id,
        action: "data_deletion_requested",
        metadata: { status: "pending_operator_review" },
      });
      dbError(error);
      return json({ status: "requested" });
    }
    if (path[0] === "me") {
      const { data: p } = await db
        .from("profiles")
        .select("display_name,role")
        .eq("id", user.id)
        .single();
      return json({
        id: user.id,
        email: user.email,
        name: p?.display_name ?? "",
        admin: p?.role === "admin",
      });
    }
    if (path[0] === "projects") {
      if (!path[1]) {
        if (method === "GET") {
          const { data, error } = await (
            await userClient()
          )
            .from("projects")
            .select("*")
            .order("updated_at", { ascending: false })
            .limit(100);
          dbError(error);
          return json(data);
        }
        if (method === "POST") {
          const v = await input(req, projectInput);
          const { count } = await db
            .from("projects")
            .select("id", { count: "exact", head: true })
            .eq("owner_id", user.id);
          if ((count ?? 0) >= 100) fail(409, "PROJECT_LIMIT");
          const { data, error } = await (
            await userClient()
          )
            .from("projects")
            .insert({ ...v, owner_id: user.id })
            .select("*")
            .single();
          dbError(error);
          return json(data, 201);
        }
      }
      const pid = uuid.parse(path[1]),
        project = await ownerProject(pid, user.id),
        op = path[2];
      if (!op && method === "GET") {
        const [im, ma, jo, ar] = await Promise.all([
          db
            .from("project_images")
            .select("*")
            .eq("project_id", pid)
            .eq("status", "verified")
            .order("position"),
          db
            .from("object_masks")
            .select("image_id,reviewed,revision,storage_path")
            .eq("project_id", pid),
          db
            .from("jobs")
            .select(
              "id,project_id,kind,model,state,progress,error_code,created_at,updated_at",
            )
            .eq("project_id", pid)
            .order("created_at", { ascending: false }),
          db
            .from("artifacts")
            .select("id,name,quality,created_at")
            .eq("project_id", pid),
        ]);
        [im, ma, jo, ar].forEach((x) => dbError(x.error));
        const images = await Promise.all(
          (im.data ?? []).map(async (i) => {
            const m = ma.data?.find(
              (m) => m.image_id === i.id && m.revision === project.revision,
            );
            return {
              ...i,
              url: await signedDownload(i.normalized_path ?? i.original_path),
              mask_url: m ? await signedDownload(m.storage_path) : null,
              mask_reviewed: m?.reviewed ?? false,
            };
          }),
        );
        return json({ ...project, images, jobs: jo.data, artifacts: ar.data });
      }
      if (!op && method === "PATCH") {
        const v = await input(
          req,
          z.object({ name: z.string().trim().min(1).max(80) }).strict(),
        );
        const { error } = await (
          await userClient()
        )
          .from("projects")
          .update(v)
          .eq("id", pid);
        dbError(error);
        return json({ ok: true });
      }
      if (op === "upload-init" && method === "POST") {
        const v = await input(req, uploadInput);
        const iid = randomUUID(),
          ext =
            v.mime === "image/jpeg"
              ? "jpg"
              : v.mime === "image/png"
                ? "png"
                : "webp",
          path = `${user.id}/${pid}/${iid}/original.${ext}`;
        const { error } = await db.rpc("reserve_image", {
          p_project: pid,
          p_owner: user.id,
          p_filename: safeFilename(v.filename),
          p_mime: v.mime,
          p_bytes: v.bytes,
          p_id: iid,
          p_path: path,
        });
        dbError(error);
        const { data, error: se } = await db.storage
          .from(SOURCE_BUCKET)
          .createSignedUploadUrl(path, { upsert: false });
        if (se || !data) fail(503, "UPLOAD_UNAVAILABLE");
        return json(
          {
            image_id: iid,
            path,
            token: data.token,
            signed_url: data.signedUrl,
          },
          201,
        );
      }
      if (op === "upload-complete" && method === "POST") {
        const v = await input(req, z.object({ image_id: z.uuid() }).strict());
        await mutable(pid);
        const { data: im, error } = await db
          .from("project_images")
          .select("*")
          .eq("id", v.image_id)
          .eq("project_id", pid)
          .eq("owner_id", user.id)
          .single();
        dbError(error);
        if (!im) fail(404, "IMAGE_NOT_FOUND");
        if (im.cleanup_started_at) fail(410, "IMAGE_EXPIRED");
        if (im.status === "verified") return json({ ok: true });
        try {
          const bytes = await downloadBounded(
            im.original_path,
            16 * 1024 * 1024,
          );
          if (bytes.length !== im.size_bytes) fail(422, "IMAGE_SIZE_MISMATCH");
          const normalized = await normalizeImage(bytes, im.mime),
            normalizedPath = `${user.id}/${pid}/${im.id}/normalized.jpg`;
          const { error: up } = await db.storage
            .from(PRIVATE_BUCKET)
            .upload(normalizedPath, normalized.bytes, {
              contentType: "image/jpeg",
              upsert: true,
            });
          if (up) fail(503, "STORAGE_UNAVAILABLE");
          const { error: fe } = await db.rpc("finalize_image", {
            p_id: im.id,
            p_owner: user.id,
            p_width: normalized.width,
            p_height: normalized.height,
            p_sha: normalized.sha256,
            p_normalized: normalizedPath,
          });
          dbError(fe);
          return json({
            ok: true,
            width: normalized.width,
            height: normalized.height,
          });
        } catch (e) {
          const { data: rejected } = await db
            .from("project_images")
            .update({ status: "rejected" })
            .eq("id", im.id)
            .neq("status", "verified")
            .select("id")
            .maybeSingle();
          if (rejected)
            await db.storage
              .from(PRIVATE_BUCKET)
              .remove([`${user.id}/${pid}/${im.id}/normalized.jpg`]);
          throw e;
        }
      }
      if (op === "images" && method === "PATCH") {
        const iid = uuid.parse(path[3]),
          v = await input(
            req,
            z
              .object({
                excluded: z.boolean().optional(),
                position: z.number().int().min(0).max(199).optional(),
              })
              .strict(),
          );
        const { data: i } = await db
          .from("project_images")
          .select("id")
          .eq("id", iid)
          .eq("project_id", pid)
          .eq("owner_id", user.id)
          .maybeSingle();
        if (!i) fail(404, "IMAGE_NOT_FOUND");
        const { error } = await db.rpc("mutate_image", {
          p_id: iid,
          p_owner: user.id,
          p_excluded: v.excluded ?? null,
          p_position: v.position ?? null,
        });
        dbError(error);
        return json({ ok: true });
      }
      if (op === "target" && method === "POST") {
        if (project.mode !== "object") fail(409, "SCENE_HAS_NO_MASK_STAGE");
        const v = await input(req, targetInput);
        const { error } = await db.rpc("record_target", {
          p_project: pid,
          p_owner: user.id,
          p_image: v.image_id,
          p_selection: v.selection,
        });
        dbError(error);
        return json({ ok: true });
      }
      if (op === "masks" && path[3] && method === "PATCH") {
        await mutable(pid);
        const iid = uuid.parse(path[3]),
          v = await input(req, z.object({ reviewed: z.boolean() }).strict());
        const { data, error } = await db
          .from("object_masks")
          .update({ reviewed: v.reviewed })
          .eq("image_id", iid)
          .eq("project_id", pid)
          .eq("owner_id", user.id)
          .eq("revision", project.revision)
          .select("id")
          .maybeSingle();
        dbError(error);
        if (!data) fail(404, "MASK_NOT_FOUND");
        return json({ ok: true });
      }
      if (["masks", "poses"].includes(op) && method === "POST") {
        const v = await input(
          req,
          z.object({ idempotency_key: z.uuid() }).strict(),
        );
        if (!process.env.OBJECTSCAN_WORKER_TOKEN)
          fail(
            503,
            "WORKER_NOT_CONFIGURED",
            "GPU 작업자 연결을 준비하고 있습니다.",
          );
        if (project.capture_mode === "turntable")
          fail(409, "TURNTABLE_NOT_VALIDATED");
        if (op === "masks" && project.mode !== "object")
          fail(409, "SCENE_HAS_NO_MASK_STAGE");
        if (op === "poses" && project.mode === "object") {
          const { data: images } = await db
              .from("project_images")
              .select("id")
              .eq("project_id", pid)
              .eq("excluded", false)
              .eq("status", "verified"),
            { data: masks } = await db
              .from("object_masks")
              .select("image_id,reviewed,revision")
              .eq("project_id", pid);
          if (
            images?.some(
              (i) =>
                !masks?.some(
                  (m) =>
                    m.image_id === i.id &&
                    m.reviewed &&
                    m.revision === project.revision,
                ),
            )
          )
            fail(409, "MASK_REVIEW_REQUIRED");
        }
        const { data, error } = await db.rpc("enqueue_job", {
          p_project: pid,
          p_owner: user.id,
          p_kind: op,
          p_key: v.idempotency_key,
        });
        dbError(error);
        return json({ id: data.id }, 201);
      }
      if (op === "qa" && method === "GET") {
        const { project, gate } = await gateProject(pid, user.id);
        return json({
          project: {
            mode: project.mode,
            input_image_count: project.input_image_count,
          },
          gate: { allowed: gate.allowed, errors: gate.errors },
        });
      }
      if (op === "generate" && method === "POST") {
        const v = await input(
            req,
            z
              .object({
                order_id: z.uuid().optional(),
                idempotency_key: z.uuid(),
              })
              .strict(),
          ),
          g = await gateProject(pid, user.id);
        if (!g.gate.allowed)
          fail(409, g.gate.errors[0], "생성 준비 조건을 확인하세요.");
        const { data, error } = await db.rpc("enqueue_job", {
          p_project: pid,
          p_owner: user.id,
          p_kind: "generation",
          p_key: v.idempotency_key,
          p_order: v.order_id ?? null,
        });
        dbError(error);
        return json({ id: data.id }, 201);
      }
    }
    if (path[0] === "wallet" && path[1] === "trial" && method === "POST") {
      await rate(`trial:${user.id}`, 5);
      const { data, error } = await adminClient().rpc("claim_trial_credits", {
        p_owner: user.id,
      });
      dbError(error);
      return json({ balance: data });
    }
    if (path[0] === "wallet" && method === "GET") {
      const db = adminClient();
      const [wallet, rates, entries] = await Promise.all([
        db
          .from("credit_wallets")
          .select("balance")
          .eq("user_id", user.id)
          .maybeSingle(),
        db.from("generation_credit_rates").select("*").eq("enabled", true),
        db
          .from("wallet_entries")
          .select("id,kind,credits,created_at")
          .eq("user_id", user.id)
          .order("id", { ascending: false })
          .limit(50),
      ]);
      for (const r of [wallet, rates, entries]) dbError(r.error);
      return json({
        trial_available:
          (
            await db
              .from("app_config")
              .select("value")
              .eq("key", "trial_credits")
              .maybeSingle()
          ).data?.value?.enabled === true,
        balance: wallet.data?.balance ?? 0,
        rates: rates.data ?? [],
        entries: entries.data ?? [],
      });
    }
    if (path[0] === "jobs") {
      if (path[2] === "retry" && method === "POST") {
        const { data: j } = await db
          .from("jobs")
          .select("kind,project_id")
          .eq("id", uuid.parse(path[1]))
          .eq("owner_id", user.id)
          .maybeSingle();
        if (!j) fail(404, "JOB_NOT_FOUND");
        if (j.kind === "generation") {
          const g = await gateProject(j.project_id, user.id);
          if (!g.gate.allowed) fail(409, g.gate.errors[0]);
        }
        const { data, error } = await db.rpc("retry_job", {
          p_job: path[1],
          p_owner: user.id,
        });
        dbError(error);
        return json({ id: data.id });
      }

      const jid = uuid.parse(path[1]),
        { data: job, error } = await db
          .from("jobs")
          .select(
            "id,project_id,owner_id,kind,model,state,progress,error_code,created_at,updated_at,attempts",
          )
          .eq("id", jid)
          .eq("owner_id", user.id)
          .maybeSingle();
      dbError(error);
      if (!job) fail(404, "JOB_NOT_FOUND");
      if (method === "GET") {
        const { data: events, error: e } = await db
          .from("job_events")
          .select("id,stage,message,progress,created_at")
          .eq("job_id", jid)
          .order("created_at")
          .limit(200);
        dbError(e);
        return json({ ...job, events });
      }
      if (path[2] === "cancel" && method === "POST") {
        if (["completed", "failed", "cancelled"].includes(job.state))
          fail(409, "JOB_TERMINAL");
        const { error } = await db
          .from("jobs")
          .update({ state: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", jid)
          .not("state", "in", "(completed,failed,cancelled)");
        dbError(error);
        await db.from("job_events").insert({
          job_id: jid,
          owner_id: user.id,
          stage: "cancelled",
          progress: job.progress,
          message:
            "사용자 취소: 작업자가 GPU 종료를 확인할 때까지 슬롯이 유지됩니다.",
        });
        return json({ ok: true });
      }
    }
    if (path[0] === "assets") {
      if (!path[1] && method === "GET") {
        const client = await userClient(),
          { data, error } = await client
            .from("artifacts")
            .select("id,owner_id,project_id,name,quality,created_at")
            .order("created_at", { ascending: false });
        dbError(error);
        return json(
          data?.map((a) => ({
            ...a,
            project_id: a.owner_id === user.id ? a.project_id : null,
            owner_id: undefined,
            can_publish: a.owner_id === user.id,
          })),
        );
      }
      const a = await downloadable(uuid.parse(path[1]), user.id);
      if (!path[2] && method === "GET")
        return json({
          id: a.id,
          name: a.name,
          quality: a.quality,
          created_at: a.created_at,
          project_id: a.owner_id === user.id ? a.project_id : null,
          can_publish: a.owner_id === user.id,
        });
      if (path[2] === "download" && method === "GET")
        return json({
          url: await signedDownload(a.storage_path),
          expires_in: 120,
        });
      if (path[2] === "publish" && method === "POST") {
        assertCommerceAllowed();
        if (a.owner_id !== user.id) fail(404, "ASSET_NOT_FOUND");
        const v = await input(
          req,
          z
            .object({
              title: z.string().trim().min(1).max(100),
              description: z.string().max(1500),
              category: z.enum([
                "objects",
                "scenes",
                "furniture",
                "decor",
                "other",
              ]),
              price: z.number().int().min(1).max(100000000),
              consent: z.literal(true),
              status: z.enum(["draft", "pending"]).default("pending"),
            })
            .strict(),
        );
        if (v.status === "pending" && !a.preview_path)
          fail(
            409,
            "PREVIEW_REQUIRED",
            "공개용 경량 미리보기 검증이 필요합니다. 초안을 저장하고 관리자에게 재생성을 요청하세요.",
          );
        const { data: existing } = await db
          .from("marketplace_listings")
          .select("status")
          .eq("artifact_id", a.id)
          .maybeSingle();
        if (existing && !marketStatuses().includes(existing.status))
          fail(
            409,
            "LISTING_ENVIRONMENT_MISMATCH",
            "다른 판매 환경에 등록된 에셋입니다.",
          );
        const { data, error } = await db
          .from("marketplace_listings")
          .upsert(
            {
              artifact_id: a.id,
              seller_id: user.id,
              title: v.title,
              description: v.description,
              category: v.category,
              price: v.price,
              status: marketStatus(v.status),
              rights_consent_at: new Date().toISOString(),
            },
            { onConflict: "artifact_id" },
          )
          .select("id,status")
          .single();
        dbError(error);
        return json(data);
      }
      if (method === "DELETE") {
        if (a.owner_id !== user.id) fail(404, "ASSET_NOT_FOUND");
        const { data: l } = await db
          .from("marketplace_listings")
          .select("id,status")
          .eq("artifact_id", a.id)
          .maybeSingle();
        if (l && !marketStatuses().includes(l.status))
          fail(
            409,
            "LISTING_ENVIRONMENT_MISMATCH",
            "다른 판매 환경에 등록된 에셋입니다.",
          );
        if (l) {
          const { count } = await db
            .from("orders")
            .select("id", { count: "exact", head: true })
            .eq("listing_id", l.id)
            .in("status", ["pending", "confirming", "paid"]);
          if (count) fail(409, "ASSET_HAS_PURCHASES");
          await db.from("marketplace_listings").delete().eq("id", l.id);
        }
        const { error } = await db
          .from("artifacts")
          .delete()
          .eq("id", a.id)
          .eq("owner_id", user.id);
        dbError(error);
        await db.storage
          .from(RESULT_BUCKET)
          .remove([
            a.storage_path,
            ...(a.preview_path ? [a.preview_path] : []),
          ]);
        return json({ ok: true });
      }
    }
    if (path[0] === "orders") {
      if (method === "POST" && !path[2]) assertCommerceAllowed();
      if (path[2] === "refund-request" && method === "POST") {
        const id = uuid.parse(path[1]),
          v = await input(
            req,
            z.object({ reason: z.string().trim().min(5).max(200) }).strict(),
          );
        const { data: o, error: orderError } = await db
          .from("orders")
          .select("id,status")
          .eq("id", id)
          .eq("buyer_id", user.id)
          .maybeSingle();
        dbError(orderError);
        if (!o) fail(404, "ORDER_NOT_FOUND");
        if (o.status !== "paid") fail(409, "ORDER_STATE_INVALID");
        const { error } = await db.from("audit_logs").insert({
          actor_id: user.id,
          action: "refund_requested",
          entity_id: id,
          metadata: v,
        });
        dbError(error);
        return json({ status: "requested" });
      }

      if (path[1] && method === "GET") {
        const { data, error } = await db
          .from("orders")
          .select(
            "id,kind,amount,currency,status,project_id,listing_id,expires_at",
          )
          .eq("id", uuid.parse(path[1]))
          .eq("buyer_id", user.id)
          .maybeSingle();
        dbError(error);
        if (!data) fail(404, "ORDER_NOT_FOUND");
        return json(data);
      }

      if (method === "GET") {
        const { data, error } = await (
          await userClient()
        )
          .from("orders")
          .select("id,kind,amount,currency,status,created_at")
          .order("created_at", { ascending: false });
        dbError(error);
        return json(data);
      }
      if (method === "POST") {
        if (paymentMode() === "disabled")
          fail(
            503,
            "PAYMENTS_DISABLED",
            "결제 제공사의 테스트 키 설정이 필요합니다.",
          );
        const v = await input(
          req,
          z.discriminatedUnion("kind", [
            z
              .object({
                kind: z.literal("credits"),
                package_id: z.string().regex(/^[a-z0-9-]{1,40}$/),
                idempotency_key: z.uuid(),
              })
              .strict(),
            z
              .object({
                kind: z.literal("generation"),
                project_id: z.uuid(),
                idempotency_key: z.uuid(),
              })
              .strict(),
            z
              .object({
                kind: z.literal("marketplace"),
                listing_id: z.uuid(),
                idempotency_key: z.uuid(),
              })
              .strict(),
          ]),
        );
        const { data: existing } = await db
          .from("orders")
          .select("*")
          .eq("idempotency_key", v.idempotency_key)
          .eq("buyer_id", user.id)
          .maybeSingle();
        if (existing) return json(existing);
        let values: Record<string, unknown>;
        if (v.kind === "credits") {
          const { data: pack, error: pe } = await db
            .from("credit_packages")
            .select("credits,amount")
            .eq("id", v.package_id)
            .eq("enabled", true)
            .maybeSingle();
          dbError(pe);
          if (!pack) fail(409, "PRICE_NOT_CONFIGURED");
          values = {
            credit_units: pack.credits,
            amount: pack.amount,
            currency: "KRW",
          };
        } else if (v.kind === "generation") {
          const g = await gateProject(v.project_id, user.id);
          if (!g.gate.allowed)
            fail(
              409,
              g.gate.errors[0],
              "모델과 입력 검증 후 결제할 수 있습니다.",
            );
          const tier = pricingTier(g.project.input_image_count),
            { data: p } = await db
              .from("pricing_tiers")
              .select("amount,currency")
              .eq("mode", g.project.mode)
              .eq("min_images", tier.lower)
              .eq("enabled", true)
              .maybeSingle();
          if (!p) fail(503, "PRICE_NOT_CONFIGURED");
          values = {
            project_id: g.project.id,
            project_revision: g.project.revision,
            image_count: g.project.input_image_count,
            mode: g.project.mode,
            amount: p.amount,
            currency: p.currency,
          };
        } else {
          const { data: l } = await db
            .from("marketplace_listings")
            .select("*")
            .eq("id", v.listing_id)
            .eq("status", marketStatus("approved"))
            .maybeSingle();
          if (!l || l.seller_id === user.id) fail(404, "LISTING_NOT_FOUND");
          const { data: owned } = await db
            .from("asset_purchases")
            .select("id")
            .eq("artifact_id", l.artifact_id)
            .eq("buyer_id", user.id)
            .is("revoked_at", null)
            .maybeSingle();
          if (owned) fail(409, "ALREADY_OWNED");
          const { data: config } = await db
            .from("app_config")
            .select("value")
            .eq("key", "commission_bps")
            .single();
          if (!Number.isInteger(config?.value))
            fail(503, "COMMISSION_NOT_CONFIGURED");
          values = {
            listing_id: l.id,
            amount: l.price,
            currency: l.currency,
            fee: platformFee(Number(l.price), config!.value),
          };
        }
        const { data, error } = await db
          .from("orders")
          .insert({
            ...values,
            kind: v.kind,
            buyer_id: user.id,
            idempotency_key: v.idempotency_key,
          })
          .select("*")
          .single();
        dbError(error);
        return json(data, 201);
      }
    }
    if (path[0] === "payments" && path[1] === "confirm" && method === "POST") {
      const v = await input(
        req,
        z
          .object({
            payment_key: z.string().min(1).max(200),
            order_id: z.uuid(),
            amount: z.number().int().positive(),
          })
          .strict(),
      );
      const { data: o } = await db
        .from("orders")
        .select("id")
        .eq("id", v.order_id)
        .eq("buyer_id", user.id)
        .maybeSingle();
      if (!o) fail(404, "ORDER_NOT_FOUND");
      return json(
        await verifyPayment(v.payment_key, v.order_id, v.amount, true),
      );
    }
    if (path[0] === "billing" && method === "GET") {
      const [
        { data: ledger, error },
        { data: balance },
        { data: payouts },
        orders,
      ] = await Promise.all([
        db
          .from("credit_ledger")
          .select("id,kind,amount,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100),
        db
          .from("seller_balances")
          .select("available,reserved")
          .eq("seller_id", user.id)
          .maybeSingle(),
        db
          .from("payout_requests")
          .select("id,amount,status,created_at")
          .eq("seller_id", user.id),
        db
          .from("orders")
          .select("id,kind,amount,status,created_at")
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
      dbError(error);
      dbError(orders.error);
      return json({
        orders: orders.data,
        ledger,
        balance: balance ?? { available: 0, reserved: 0 },
        payouts,
        payments_mode: paymentMode(),
        automatic_payouts: false,
      });
    }
    if (path[0] === "payouts" && method === "POST") {
      assertCommerceAllowed();
      const v = await input(
          req,
          z.object({ amount: z.number().int().positive() }).strict(),
        ),
        { data, error } = await db.rpc("request_payout", {
          p_seller: user.id,
          p_amount: v.amount,
        });
      dbError(error);
      return json(data, 201);
    }
    if (path[0] === "listings" && path[2] === "report" && method === "POST") {
      const v = await input(
          req,
          z.object({ reason: z.string().trim().min(5).max(1000) }).strict(),
        ),
        lid = uuid.parse(path[1]);
      const { data: l } = await db
        .from("marketplace_listings")
        .select("id")
        .eq("id", lid)
        .eq("status", marketStatus("approved"))
        .maybeSingle();
      if (!l) fail(404, "LISTING_NOT_FOUND");
      const { error } = await db.from("audit_logs").insert({
        actor_id: user.id,
        action: "listing_report",
        entity_id: lid,
        metadata: v,
      });
      dbError(error);
      return json({ ok: true });
    }
    if (path[0] === "admin") {
      await operator();
      if (path[1] === "cleanup-uploads" && method === "POST") {
        const result = await cleanupUploads();
        const { error } = await db.from("audit_logs").insert({
          actor_id: user.id,
          action: "upload_cleanup",
          metadata: result,
        });
        dbError(error);
        return json(result);
      }
      if (method === "GET") {
        const [jobs, listings, tiers, reports, payouts, refunds] =
          await Promise.all([
            db
              .from("jobs")
              .select(
                "id,kind,model,state,progress,error_code,attempts,lease_expires_at,created_at",
              )
              .order("created_at", { ascending: false })
              .limit(100),
            db
              .from("marketplace_listings")
              .select("*")
              .in("status", marketStatuses())
              .order("created_at", { ascending: false })
              .limit(100),
            db.from("pricing_tiers").select("*").order("min_images"),
            db
              .from("audit_logs")
              .select("*")
              .eq("action", "listing_report")
              .limit(100),
            db
              .from("payout_requests")
              .select("id,seller_id,amount,status,created_at")
              .order("created_at", { ascending: false })
              .limit(100),
            db
              .from("audit_logs")
              .select("id,entity_id,metadata,created_at")
              .eq("action", "refund_requested")
              .order("created_at", { ascending: false })
              .limit(100),
          ]);
        for (const result of [jobs, listings, tiers, reports, payouts, refunds])
          dbError(result.error);
        return json({
          refund_requests: refunds.data,
          payouts: payouts.data,
          jobs: jobs.data,
          listings: listings.data,
          tiers: tiers.data,
          reports: reports.data,
          health: await health(),
        });
      }
      if (path[1] === "payout-review" && method === "POST") {
        assertCommerceAllowed();
        const v = await input(
          req,
          z
            .object({
              id: z.uuid(),
              status: z.enum(["approved", "rejected", "paid"]),
              reference: z.string().max(200).optional(),
            })
            .strict(),
        );
        if (
          v.status === "paid" &&
          process.env.MARKETPLACE_PAYOUTS_ENABLED !== "true"
        )
          fail(503, "MANUAL_PAYOUTS_DISABLED");
        const { data, error } = await db.rpc("review_payout", {
          p_actor: user.id,
          p_id: v.id,
          p_status: v.status,
          p_reference: v.reference ?? null,
        });
        dbError(error);
        return json(data);
      }
      if (path[1] === "refund" && method === "POST") {
        const v = await input(
          req,
          z
            .object({
              order_id: z.uuid(),
              reason: z.string().trim().min(5).max(200),
            })
            .strict(),
        );
        return json(await refundTestPayment(v.order_id, v.reason));
      }
      if (path[1] === "pricing" && method === "POST") {
        const v = await input(
          req,
          z
            .object({
              mode: z.enum(["object", "scene"]),
              min_images: z.number().int().min(1).max(181),
              amount: z.number().int().positive().max(100000000),
              enabled: z.boolean(),
            })
            .strict(),
        );
        if ((v.min_images - 1) % 20) fail(400, "TIER_INVALID");
        const { error } = await db
          .from("pricing_tiers")
          .upsert(
            { ...v, max_images: v.min_images + 19, currency: "KRW" },
            { onConflict: "mode,min_images" },
          );
        dbError(error);
        return json({ ok: true });
      }
      if (path[1] === "commission" && method === "POST") {
        const v = await input(
            req,
            z.object({ bps: z.number().int().min(0).max(10000) }).strict(),
          ),
          { error } = await db
            .from("app_config")
            .update({ value: v.bps })
            .eq("key", "commission_bps");
        dbError(error);
        return json({ ok: true });
      }
      if (path[1] === "moderate" && method === "POST") {
        const v = await input(
          req,
          z
            .object({
              listing_id: z.uuid(),
              status: z.enum(["approved", "rejected", "removed"]),
            })
            .strict(),
        );
        const { data: l } = await db
          .from("marketplace_listings")
          .select("*,artifacts(*)")
          .eq("id", v.listing_id)
          .in("status", marketStatuses())
          .single();
        if (!l) fail(404, "LISTING_NOT_FOUND");
        let preview: string | null = l.public_preview_path;
        if (v.status === "approved") {
          const a = l.artifacts;
          if (!a?.preview_path || a.preview_path === a.storage_path)
            fail(
              409,
              "PREVIEW_REQUIRED",
              "별도 경량 미리보기 파일이 필요합니다.",
            );
          const bytes = await downloadBounded(a.preview_path, 16 * 1024 * 1024),
            quality = await validateGLB(bytes);
          if (
            quality.triangles > Math.min(20000, a.quality.triangles * 0.25) ||
            quality.sha256 === a.quality.sha256
          )
            fail(409, "PREVIEW_TOO_DETAILED");
          preview = `approved/${l.id}/preview.glb`;
          const { error } = await db.storage
            .from("market-previews")
            .upload(preview, bytes, {
              contentType: "model/gltf-binary",
              upsert: true,
            });
          dbError(error);
        } else if (preview) {
          await db.storage.from("market-previews").remove([preview]);
          preview = null;
        }
        const { error } = await db
          .from("marketplace_listings")
          .update({
            status: marketStatus(v.status),
            public_preview_path: preview,
          })
          .eq("id", l.id);
        dbError(error);
        await db.from("audit_logs").insert({
          actor_id: user.id,
          action: "listing_moderation",
          entity_id: l.id,
          metadata: { status: v.status },
        });
        return json({ ok: true });
      }
      if (path[1] === "reconcile" && method === "POST") {
        const v = await input(
          req,
          z.object({ confirm_gpu_stopped: z.literal(true) }).strict(),
        );
        void v;
        const { error } = await db.rpc("reconcile_worker", {
          p_actor: user.id,
        });
        dbError(error);
        return json({ ok: true });
      }
    }
    fail(404, "NOT_FOUND", "요청한 항목을 찾을 수 없습니다.");
  });
}
