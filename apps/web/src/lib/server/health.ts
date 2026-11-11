import "server-only";
import { adminClient, configured } from "@/lib/supabase/server";
import { modelSchema, type ModelFamily } from "@objectscan/shared";
import { paymentMode } from "./payments";
export async function health() {
  if (!configured())
    return {
      configured: false,
      worker_online: false,
      busy: false,
      models: [],
      validated_profiles: [],
      real_gpu_validated: false,
      payments_mode: "disabled",
      payouts_enabled: false,
    };
  const db = adminClient();
  const [{ data: slot }, { data: validation }] = await Promise.all([
    db
      .from("worker_slot")
      .select("job_id,last_heartbeat,models")
      .eq("id", 1)
      .maybeSingle(),
    db
      .from("app_config")
      .select("key,value")
      .in("key", ["validated_models", "validated_profiles"]),
  ]);
  const envModels = (process.env.ENABLED_MODELS ?? "")
    .split(",")
    .filter((x) => modelSchema.safeParse(x).success) as ModelFamily[];
  const real = process.env.REAL_GPU_VALIDATED === "true";
  const validated: ModelFamily[] = Array.isArray(
    validation?.find((v) => v.key === "validated_models")?.value,
  )
    ? validation!.find((v) => v.key === "validated_models")!.value
    : [];
  return {
    configured: true,
    worker_online: Boolean(
      slot?.last_heartbeat &&
      Date.now() - new Date(slot.last_heartbeat).getTime() < 90000,
    ),
    busy: Boolean(slot?.job_id),
    models: real
      ? envModels.filter(
          (m) => validated.includes(m) && (slot?.models ?? []).includes(m),
        )
      : [],
    validated_profiles: real
      ? (validation?.find((v) => v.key === "validated_profiles")?.value ?? [])
      : [],
    real_gpu_validated: real && validated.length > 0,
    payments_mode: paymentMode(),
    payouts_enabled: false,
  };
}
