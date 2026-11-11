"use client";
import { useEffect, useState, useRef } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { api } from "@/lib/client-api";
import { customerError } from "@/lib/customer-copy";
import { Button } from "@/components/ui/button";
type Order = {
  credit_units?: number;
  expires_at: string;
  id: string;
  amount: number;
  kind: string;
  status: string;
};
export function CheckoutPanel({ orderId }: { orderId: string }) {
  const [order, S] = useState<Order | null>(null),
    [error, E] = useState(""),
    [busy, B] = useState(false),
    [ready, R] = useState(false);
  const request = useRef<(() => Promise<unknown>) | null>(null);
  useEffect(() => {
    let live = true;
    void (async () => {
      const o = await api<Order>(`orders/${orderId}`);
      if (!live) return;
      S(o);
      if (new Date(o.expires_at).getTime() <= Date.now())
        throw Error(
          "주문 유효시간이 지났습니다. 크레딧 또는 에셋 화면에서 새 주문을 만들어 주세요.",
        );
      if (o.status !== "pending")
        throw Error("결제 대기 중인 주문만 결제할 수 있습니다.");
      const h = await api<{ payments_mode: string }>("health");
      if (h.payments_mode !== "test")
        throw Error("테스트 결제 연결을 준비하고 있습니다.");
      const user = await api<{ id: string }>("me"),
        key = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!key?.startsWith("test_"))
        throw Error("테스트 결제 연결을 준비하고 있습니다.");
      const toss = await loadTossPayments(key);
      if (!live) return;
      const common = {
        orderId: o.id,
        orderName:
          o.kind === "credits"
            ? "ObjectScan 크레딧 충전"
            : o.kind === "marketplace"
              ? "ObjectScan 에셋 구매"
              : "ObjectScan 3D 제작",
        successUrl: `${location.origin}/payments/success`,
        failUrl: `${location.origin}/payments/fail`,
      };
      if (key.startsWith("test_gck_")) {
        const widgets = toss.widgets({ customerKey: user.id });
        await widgets.setAmount({ currency: "KRW", value: Number(o.amount) });
        await widgets.renderPaymentMethods({
          selector: "#payment-methods",
          variantKey: "DEFAULT",
        });
        await widgets.renderAgreement({
          selector: "#payment-agreement",
          variantKey: "AGREEMENT",
        });
        request.current = () => widgets.requestPayment(common);
      } else {
        request.current = () =>
          toss.payment({ customerKey: user.id }).requestPayment({
            ...common,
            method: "CARD",
            amount: { currency: "KRW", value: Number(o.amount) },
          });
      }
      if (live) R(true);
    })().catch((e) => {
      if (live) E(customerError(undefined, e.message));
    });
    return () => {
      live = false;
      request.current = null;
    };
  }, [orderId]);
  async function pay() {
    B(true);
    E("");
    try {
      await request.current?.();
    } catch (e) {
      E(customerError(undefined, (e as Error).message));
    } finally {
      B(false);
    }
  }
  return (
    <section className="checkout-page">
      <p className="eyebrow">주문 확인</p>
      <h1>안전하게 결제하세요.</h1>
      <p className="notice warning">
        테스트 결제입니다. 실제 돈은 청구되지 않습니다. 테스트 거래는 판매
        대금으로 송금되지 않습니다.
      </p>
      <dl>
        <dt>주문 번호</dt>
        <dd>{order?.id ?? "불러오는 중…"}</dd>
        {order?.kind === "credits" && (
          <>
            <dt>충전 크레딧</dt>
            <dd>{order.credit_units} 크레딧</dd>
          </>
        )}
        <dt>결제 금액</dt>
        <dd>
          {order
            ? new Intl.NumberFormat("ko-KR", {
                style: "currency",
                currency: "KRW",
              }).format(order.amount)
            : "확인 중…"}
        </dd>
      </dl>
      <div id="payment-methods" />
      <div id="payment-agreement" />
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      <Button disabled={!ready || busy} onClick={() => void pay()}>
        {busy ? "결제창 여는 중…" : "테스트 결제하기"}
      </Button>
    </section>
  );
}
