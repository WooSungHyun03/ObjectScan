"use client";
import { customerError } from "@/lib/customer-copy";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { post } from "@/lib/client-api";
export function PaymentResult({ failed = false }: { failed?: boolean }) {
  const q = useSearchParams(),
    started = useRef(false),
    [message, setMessage] = useState(
      failed
        ? "결제가 완료되지 않았습니다."
        : "서버에서 결제를 확인하고 있습니다…",
    ),
    [done, setDone] = useState(false);
  useEffect(() => {
    if (failed || started.current) return;
    started.current = true;
    const amount = Number(q.get("amount")),
      key = q.get("paymentKey"),
      id = q.get("orderId");
    if (!key || !id || !Number.isSafeInteger(amount) || amount <= 0) {
      setMessage("유효하지 않은 결제 응답입니다.");
      return;
    }
    void post("payments/confirm", { payment_key: key, order_id: id, amount })
      .then(() => {
        setDone(true);
        setMessage("테스트 결제 확인이 완료되었습니다.");
      })
      .catch((e) => setMessage(customerError(undefined, e.message)));
  }, [q, failed]);
  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>{failed ? "결제 중단" : done ? "결제 확인 완료" : "결제 확인"}</h1>
        <p role="status">{message}</p>
        {failed && <p>결제를 다시 시작하려면 원래 주문 화면으로 돌아가세요.</p>}
        <Link href={done ? "/dashboard" : "/billing"}>
          워크스페이스로 이동 →
        </Link>
        {done && <Link href="/assets">구매한 에셋 확인 →</Link>}
      </section>
    </main>
  );
}
