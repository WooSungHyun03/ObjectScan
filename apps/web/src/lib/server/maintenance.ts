import "server-only";
import { adminClient } from "@/lib/supabase/server";
import { dbError, fail } from "./guards";
import { PRIVATE_BUCKET, SOURCE_BUCKET } from "./files";

export async function cleanupUploads(owner?: string) {
  const db = adminClient();
  const { data, error } = await db.rpc("claim_upload_cleanup", {
    p_owner: owner ?? null,
    p_limit: 25,
  });
  dbError(error);
  let deleted = 0,
    failed = 0;
  for (const image of data ?? []) {
    // Only server-issued exact UUID keys are eligible; never delete a supplied arbitrary prefix.
    const prefix = `${image.owner_id}/${image.project_id}/${image.id}/`;
    if (
      !["original.jpg", "original.png", "original.webp"].some(
        (name) => image.original_path === prefix + name,
      )
    ) {
      failed++;
      continue;
    }
    const original = await db.storage
      .from(SOURCE_BUCKET)
      .remove([image.original_path]);
    const normalized = await db.storage
      .from(PRIVATE_BUCKET)
      .remove([prefix + "normalized.jpg"]);
    if (original.error || normalized.error) {
      failed++;
      continue;
    }
    const { error: markError } = await db
      .from("project_images")
      .update({ storage_deleted_at: new Date().toISOString() })
      .eq("id", image.id)
      .eq("status", "rejected")
      .not("cleanup_started_at", "is", null);
    dbError(markError);
    deleted++;
  }
  if (failed)
    fail(
      503,
      "CLEANUP_INCOMPLETE",
      `${deleted}개 정리, ${failed}개 재시도 대기. 저장공간 예약은 삭제 확인까지 유지됩니다.`,
    );
  return { deleted };
}
