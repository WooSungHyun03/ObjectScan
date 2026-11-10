import "server-only";
import { timingSafeEqual } from "node:crypto";
import { currentUser, adminClient } from "@/lib/supabase/server";
import { z } from "zod";
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public message: string,
  ) {
    super(message);
  }
}
export function fail(status: number, code: string, message = code): never {
  throw new ApiError(status, code, message);
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) fail(401, "AUTH_REQUIRED", "로그인이 필요합니다.");
  return user;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = new Set(
    [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ]
      .filter(Boolean)
      .map((value) => new URL(value!).origin),
  );
  if (!origin || !allowed.has(origin))
    fail(403, "ORIGIN_REJECTED", "동일 출처 요청만 허용됩니다.");
}
export async function input<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  if (Number(req.headers.get("content-length") ?? 0) > 100000)
    fail(413, "BODY_TOO_LARGE");
  const reader = req.body?.getReader();
  if (!reader) fail(400, "BODY_REQUIRED");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.length;
    if (size > 100000) {
      await reader.cancel();
      fail(413, "BODY_TOO_LARGE");
    }
    chunks.push(part.value);
  }
  let value: unknown;
  try {
    value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    fail(400, "INVALID_JSON");
  }
  return schema.parse(value);
}
export async function rate(key: string, max = 60) {
  const { data, error } = await adminClient().rpc("check_rate", {
    p_key: key,
    p_max: max,
  });
  if (error) fail(503, "RATE_LIMIT_UNAVAILABLE");
  if (!data)
    fail(429, "RATE_LIMITED", "요청이 많습니다. 잠시 후 다시 시도하세요.");
}
export async function ownerProject(id: string, owner: string) {
  const { data, error } = await adminClient()
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("owner_id", owner)
    .maybeSingle();
  if (error) fail(503, "DATABASE_UNAVAILABLE");
  if (!data) fail(404, "PROJECT_NOT_FOUND", "프로젝트를 찾을 수 없습니다.");
  return data;
}
export async function operator() {
  const user = await requireUser();
  const { data } = await adminClient()
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (data?.role !== "admin") fail(404, "NOT_FOUND");
  return user;
}
export function workerAuth(req: Request) {
  const expected = process.env.OBJECTSCAN_WORKER_TOKEN;
  if (!expected) fail(503, "WORKER_NOT_CONFIGURED");
  const provided = req.headers.get("authorization") ?? "";
  const a = Buffer.from(provided),
    b = Buffer.from(`Bearer ${expected}`);
  if (a.length !== b.length || !timingSafeEqual(a, b))
    fail(401, "WORKER_UNAUTHORIZED");
}
export function dbError(error: { message: string; code?: string } | null) {
  if (!error) return;
  const code = error.message.match(
    /(?:PROJECT_BUSY|ORDER_PENDING|IMAGE_LIMIT|STORAGE_LIMIT|NO_INPUTS|QUEUE_FULL|TARGET_REQUIRED|MODEL_NOT_VALIDATED|PAID_ORDER_REQUIRED|POSE_REQUIRED|MASK_REVIEW_REQUIRED|LEASE_INVALID|STATE_INVALID|JOB_TERMINAL|AMOUNT_MISMATCH|PAYMENT_MISMATCH|ORDER_STATE_INVALID|BALANCE_INSUFFICIENT|TURNTABLE_NOT_VALIDATED|SCENE_EXPERIMENTAL|ARTIFACT_REQUIRED|TEST_PAYMENT_REQUIRED|LISTING_INVALID|ALREADY_OWNED)/,
  )?.[0];
  if (code) fail(409, code);
  if (error.code === "23505")
    fail(409, "ALREADY_EXISTS", "이미 처리한 요청이거나 중복 데이터입니다.");
  fail(500, "DATABASE_ERROR", "데이터 처리 중 오류가 발생했습니다.");
}
export async function route(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ApiError)
      return json({ error: e.message, code: e.code }, e.status);
    if (e instanceof z.ZodError)
      return json(
        {
          error: "입력값을 확인하세요.",
          code: "VALIDATION_ERROR",
          issues: e.issues,
        },
        400,
      );
    if (e instanceof SyntaxError)
      return json(
        { error: "유효하지 않은 JSON입니다.", code: "INVALID_JSON" },
        400,
      );
    if (e instanceof Error && e.message === "SUPABASE_NOT_CONFIGURED")
      return json(
        { error: "데이터 서비스 연결 설정이 필요합니다.", code: e.message },
        503,
      );
    console.error(
      "ObjectScan request failed",
      e instanceof Error ? e.name : "Unknown",
    );
    return json(
      { error: "요청을 처리하지 못했습니다.", code: "INTERNAL_ERROR" },
      500,
    );
  }
}
export function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
