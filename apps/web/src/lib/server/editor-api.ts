import "server-only";
import { z } from "zod";
import { createHash } from "node:crypto";
import {
  operationSchema,
  inspectContainer,
  MAX_EDIT_BYTES,
} from "@objectscan/mesh-editor/contracts";
import { adminClient } from "@/lib/supabase/server";
import { dbError, fail, input, json, ownerProject } from "./guards";
import { signedDownload, validateGLB } from "./files";
const bucket = "asset-versions";
export async function editorRoute(req: Request, path: string[], owner: string) {
  const db = adminClient();
  if (path[0] === "projects" && path[2] === "editor" && req.method === "GET") {
    const project = await ownerProject(z.uuid().parse(path[1]), owner);
    const { data: artifact, error } = await db
      .from("artifacts")
      .select("id,name,storage_path,quality")
      .eq("project_id", project.id)
      .eq("owner_id", owner)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    dbError(error);
    if (!artifact)
      fail(
        409,
        "NO_EDITABLE_MODEL",
        "아직 편집할 모델이 없습니다. 완성된 모델이 생기면 이곳에서 편집할 수 있습니다.",
      );
    const { data: versions, error: ve } = await db
      .from("artifact_versions")
      .select("id,version_number,created_at,size_bytes,sha256,parent_id")
      .eq("artifact_id", artifact.id)
      .eq("owner_id", owner)
      .eq("status", "ready")
      .order("version_number", { ascending: false });
    dbError(ve);
    return json({
      artifact_id: artifact.id,
      name: artifact.name,
      source_url: await signedDownload(artifact.storage_path),
      quality: artifact.quality,
      versions,
    });
  }
  if (path[0] !== "assets" || path[2] !== "versions") return null;
  const aid = z.uuid().parse(path[1]);
  const { data: a, error: ae } = await db
    .from("artifacts")
    .select("id")
    .eq("id", aid)
    .eq("owner_id", owner)
    .maybeSingle();
  dbError(ae);
  if (!a) fail(404, "ASSET_NOT_FOUND");
  if (req.method === "POST" && !path[3]) {
    const v = await input(
      req,
      z
        .object({
          idempotency_key: z.uuid(),
          sha256: z.string().regex(/^[0-9a-f]{64}$/),
          parent_id: z.uuid().nullable(),
          size: z.number().int().min(28).max(MAX_EDIT_BYTES),
          operations: z.array(operationSchema).max(80),
        })
        .strict(),
    );
    const { data: reserved, error } = await db.rpc("reserve_artifact_version", {
      p_artifact: aid,
      p_owner: owner,
      p_key: v.idempotency_key,
      p_parent: v.parent_id,
      p_size: v.size,
      p_operations: v.operations,
      p_sha: v.sha256,
    });
    dbError(error);
    if (reserved.status === "ready")
      return json({
        id: reserved.id,
        status: "ready",
        version_number: reserved.version_number,
      });
    const { data, error: se } = await db.storage
      .from(bucket)
      .createSignedUploadUrl(reserved.storage_path, { upsert: false });
    dbError(se);
    if (!data) fail(503, "STORAGE_UNAVAILABLE");
    return json(
      { id: reserved.id, status: "pending", upload_url: data.signedUrl },
      201,
    );
  }
  const vid = z.uuid().parse(path[3]);
  const { data: v, error: ve } = await db
    .from("artifact_versions")
    .select("*")
    .eq("id", vid)
    .eq("artifact_id", aid)
    .eq("owner_id", owner)
    .maybeSingle();
  dbError(ve);
  if (!v) fail(404, "VERSION_NOT_FOUND");
  if (req.method === "GET" && v.status === "ready") {
    const { data, error } = await db.storage
      .from(bucket)
      .createSignedUrl(v.storage_path, 120);
    dbError(error);
    if (!data) fail(404, "FILE_NOT_FOUND");
    return json({
      id: v.id,
      url: data.signedUrl,
      sha256: v.sha256,
      version_number: v.version_number,
    });
  }
  if (req.method === "POST" && path[4] === "complete") {
    if (v.status === "ready")
      return json({ id: v.id, version_number: v.version_number });
    const { data, error } = await db.storage
      .from(bucket)
      .download(v.storage_path);
    dbError(error);
    if (!data) fail(404, "FILE_NOT_FOUND");
    if (data.size !== Number(v.declared_bytes) || data.size > MAX_EDIT_BYTES)
      fail(413, "FILE_TOO_LARGE");
    const bytes = new Uint8Array(await data.arrayBuffer());
    try {
      inspectContainer(bytes);
    } catch {
      fail(
        422,
        "MODEL_IMPORT_INVALID",
        "텍스처를 포함한 지원 가능한 GLB 파일이 필요합니다.",
      );
    }
    const quality = await validateGLB(bytes);
    const sha = createHash("sha256").update(bytes).digest("hex");
    const { data: ready, error: re } = await db.rpc(
      "finalize_artifact_version",
      {
        p_id: v.id,
        p_owner: owner,
        p_size: bytes.byteLength,
        p_sha: sha,
        p_quality: quality,
      },
    );
    dbError(re);
    return json({ id: ready.id, version_number: ready.version_number });
  }
  fail(404, "VERSION_NOT_FOUND");
}
