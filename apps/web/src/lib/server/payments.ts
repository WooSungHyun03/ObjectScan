import "server-only";
import { adminClient } from "@/lib/supabase/server";
import { dbError, fail } from "./guards";
import { educationMode } from "@/lib/project-purpose";
export function assertCommerceAllowed() {
  if (educationMode())
    fail(
      403,
      "NONCOMMERCIAL_ONLY",
      "학교 교육·연구용 서비스에서는 결제·판매·정산을 지원하지 않습니다.",
    );
}
export function paymentMode() {
  if (educationMode()) return "disabled";
  const mode = process.env.PAYMENTS_MODE ?? "disabled",
    secret = process.env.TOSS_SECRET_KEY,
    client = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (
    mode === "test" &&
    (secret?.startsWith("test_sk_") || secret?.startsWith("test_gsk_")) &&
    (client?.startsWith("test_ck_") || client?.startsWith("test_gck_"))
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
  if (!r.ok) {
    // Provider diagnostics may contain infrastructure addresses; keep them off customer screens.
    console.warn("TOSS_PROVIDER_ERROR", { status: r.status, code: data.code });
    fail(
      502,
      "PROCESSOR_ERROR",
      "결제사 연결을 확인하지 못했습니다. 잠시 후 다시 확인해 주세요.",
    );
  }
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
  if ((confirm && order.status === "refunded") || order.status === "failed")
    fail(409, "ORDER_STATE_INVALID");
  if (
    !["paid", "refunded"].includes(order.status) &&
    new Date(order.expires_at).getTime() < Date.now()
  )
    fail(409, "ORDER_EXPIRED");
  if (
    order.kind === "generation" &&
    !["paid", "refunded"].includes(order.status)
  ) {
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
    paid.orderId !== order.id ||
    Number(paid.totalAmount) !== Number(order.amount) ||
    paid.currency !== "KRW" ||
    paid.paymentKey !== paymentKey
  )
    fail(409, "PAYMENT_NOT_VERIFIED");
  if (paid.status === "CANCELED") {
    const cancellations = Array.isArray(paid.cancels)
      ? paid.cancels.filter(
          (c: { cancelStatus: string }) => c.cancelStatus === "DONE",
        )
      : [];
    const cancelled = cancellations.reduce(
      (total: number, c: { cancelAmount: number }) =>
        total + Number(c.cancelAmount),
      0,
    );
    const transaction = cancellations.at(-1)?.transactionKey;
    if (order.status !== "paid" && order.status !== "refunded")
      fail(409, "ORDER_STATE_INVALID");
    if (
      Number(paid.balanceAmount) !== 0 ||
      cancelled !== Number(order.amount) ||
      typeof transaction !== "string" ||
      !transaction
    )
      fail(409, "REFUND_NOT_VERIFIED");
    const { data, error } = await db.rpc("settle_test_refund", {
      p_order: order.id,
      p_key: paymentKey,
      p_amount: Number(order.amount),
      p_transaction: transaction,
    });
    dbError(error);
    return data;
  }
  if (paid.status !== "DONE" || order.status === "refunded")
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

export async function refundTestPayment(orderId: string, reason: string) {
  if (paymentMode() !== "test") fail(503, "PAYMENTS_DISABLED");
  const db = adminClient();
  const { data: order, error } = await db
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  dbError(error);
  if (!order || !["paid", "refunded"].includes(order.status))
    fail(409, "ORDER_STATE_INVALID");
  const { data: payment, error: pe } = await db
    .from("payments")
    .select("payment_key,test_mode")
    .eq("order_id", orderId)
    .single();
  dbError(pe);
  if (!payment?.test_mode) fail(409, "TEST_PAYMENT_REQUIRED");
  if (order.status === "refunded") return order;
  if (order.kind === "generation") {
    const { data: jobs, error: je } = await db
      .from("jobs")
      .select("id,state")
      .eq("order_id", order.id);
    dbError(je);
    if (jobs?.some((j) => !["failed", "cancelled"].includes(j.state)))
      fail(409, "GENERATION_REFUND_REVIEW_REQUIRED");
  }
  if (order.kind === "credits") {
    const { error: reserveError } = await db.rpc("reserve_credit_refund", {
      p_order: order.id,
    });
    dbError(reserveError);
  }
  await toss(`payments/${encodeURIComponent(payment.payment_key)}/cancel`, {
    method: "POST",
    headers: { "Idempotency-Key": `${order.id}:full-refund` },
    body: JSON.stringify({ cancelReason: reason }),
  });
  // Requery is authoritative even when the cancel request was retried after a network interruption.
  return verifyPayment(
    payment.payment_key,
    order.id,
    Number(order.amount),
    false,
  );
}
