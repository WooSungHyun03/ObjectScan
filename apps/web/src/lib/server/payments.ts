import "server-only";
import { adminClient } from "@/lib/supabase/server";
import { dbError, fail } from "./guards";
export function paymentMode() {
  const mode = process.env.PAYMENTS_MODE ?? "disabled",
    secret = process.env.TOSS_SECRET_KEY,
    client = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (
    mode === "test" &&
    secret?.startsWith("test_sk_") &&
    client?.startsWith("test_ck_")
  )
    return "test";
  return "disabled";
}
async function toss(path: string, options: RequestInit = {}) {
  if (paymentMode() === "disabled")
    fail(503, "PAYMENTS_DISABLED", "토스페이먼츠 테스트 키 설정이 필요합니다.");
  const r = await fetch(`https://api.tosspayments.com/v1/${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64")}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  });
  const data = await r.json();
  if (!r.ok)
    fail(
      502,
      "PROCESSOR_ERROR",
      typeof data.message === "string"
        ? data.message
        : "결제 제공사 확인에 실패했습니다.",
    );
  return data;
}
export async function verifyPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
  confirm: boolean,
) {
  const db = adminClient(),
    { data: order, error } = await db
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();
  dbError(error);
  if (!order || Number(order.amount) !== amount)
    fail(409, "AMOUNT_MISMATCH", "서버 주문 금액과 일치하지 않습니다.");
  if (order.status === "refunded" || order.status === "failed")
    fail(409, "ORDER_STATE_INVALID");
  if (
    order.status !== "paid" &&
    new Date(order.expires_at).getTime() < Date.now()
  )
    fail(409, "ORDER_EXPIRED");
  if (order.kind === "generation") {
    const { data: project } = await db
      .from("projects")
      .select("revision")
      .eq("id", order.project_id)
      .single();
    if (project?.revision !== order.project_revision)
      fail(409, "PROJECT_CHANGED");
  }
  const paid =
    confirm && order.status !== "paid"
      ? await toss("payments/confirm", {
          method: "POST",
          headers: { "Idempotency-Key": order.id },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(order.amount),
          }),
        })
      : await toss(`payments/${encodeURIComponent(paymentKey)}`);
  if (
    paid.status !== "DONE" ||
    paid.orderId !== order.id ||
    Number(paid.totalAmount) !== Number(order.amount) ||
    paid.currency !== "KRW" ||
    paid.paymentKey !== paymentKey
  )
    fail(409, "PAYMENT_NOT_VERIFIED");
  const { data: settled, error: settleError } = await db.rpc("settle_payment", {
    p_order: order.id,
    p_key: paymentKey,
    p_amount: Number(order.amount),
    p_test: paymentMode() === "test",
  });
  dbError(settleError);
  return settled;
}
