"use client";
import { useEffect, useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { CreditCard, LockKeyhole, AlertCircle } from "lucide-react";
import { api, post } from "@/lib/client-api";
import { Button } from "./ui/button";
type Order = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  kind: string;
  project_id?: string;
  listing_id?: string;
};
export function CheckoutButton({
  orderId,
  listingId,
  label = "테스트 결제",
}: {
  orderId?: string;
  listingId?: string;
  label?: string;
}) {
  const [enabled, setEnabled] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    void api<{ payments_mode: string }>("health")
      .then((h) => setEnabled(h.payments_mode === "test"))
      .catch(() => setEnabled(false));
  }, []);
  async function checkout() {
    setBusy(true);
    setError("");
    try {
      const order = orderId
        ? await api<Order>(`orders/${orderId}`)
        : await post<Order>("orders", {
            kind: "marketplace",
            listing_id: listingId,
            idempotency_key: crypto.randomUUID(),
          });
      if (order.status !== "pending")
        throw Error("결제 대기 중인 주문만 사용할 수 있습니다.");
      const { id } = await api<{ id: string }>("me"),
        key = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!key?.startsWith("test_ck_"))
        throw Error("테스트 결제 키 설정이 필요합니다.");
      const toss = await loadTossPayments(key);
      await toss.payment({ customerKey: id }).requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: Number(order.amount) },
        orderId: order.id,
        orderName:
          order.kind === "generation"
            ? "ObjectScan 3D 제작"
            : "ObjectScan 에셋 구매",
        successUrl: `${location.origin}/payments/success`,
        failUrl: `${location.origin}/payments/fail`,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="checkout-control">
      <Button
        className="full-width"
        disabled={!enabled || busy}
        onClick={() => void checkout()}
      >
        {enabled ? <CreditCard size={16} /> : <LockKeyhole size={16} />}{" "}
        {busy
          ? "결제 페이지 여는 중…"
          : enabled
            ? label
            : "결제 제공사 연결 대기"}
      </Button>
      <p>
        {enabled
          ? "Toss Payments 테스트 모드 · 실제 돈이 청구되지 않습니다."
          : "결제 제공사 테스트 키를 연결한 뒤 사용할 수 있습니다."}
      </p>
      {error && (
        <div className="notice error" role="alert">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
