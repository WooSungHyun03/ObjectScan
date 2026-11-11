"use client";
import { customerError } from "@/lib/customer-copy";
import { educationMode } from "@/lib/project-purpose";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
      router.push(`/checkout/${order.id}`);
    } catch (e) {
      setError(customerError(undefined, (e as Error).message));
    } finally {
      setBusy(false);
    }
  }
  if (educationMode())
    return (
      <div className="notice">
        비상업 교육·연구용 서비스로 결제와 구매를 지원하지 않습니다.
      </div>
    );
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
