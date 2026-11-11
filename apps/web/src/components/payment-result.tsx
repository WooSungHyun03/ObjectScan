"use client";
import { customerError } from "@/lib/customer-copy";
import { useCallback, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, CreditCard } from "lucide-react";
import { post } from "@/lib/client-api";
import { PublicHeader } from "./public-header";
import { Button } from "./ui/button";
export function PaymentResult({ failed = false }: { failed?: boolean }) {
  const q = useSearchParams(),
    started = useRef(false),
    [result, setResult] = useState<{ done: boolean; message: string } | null>(
      null,
    );
  const amount = Number(q.get("amount")),
    key = q.get("paymentKey"),
    id = q.get("orderId");
  const valid = Boolean(
    key && id && Number.isSafeInteger(amount) && amount > 0,
  );
  const confirm = useCallback(async () => {
    if (!valid || !key || !id) return;
    try {
      await post("payments/confirm", {
        payment_key: key,
        order_id: id,
        amount,
      });
      setResult({ done: true, message: "테스트 결제 확인이 완료되었습니다." });
    } catch (e) {
      setResult({
        done: false,
        message: customerError(undefined, (e as Error).message),
      });
    }
  }, [amount, id, key, valid]);
  useEffect(() => {
    if (failed || !valid || started.current) return;
    started.current = true;
    void confirm();
  }, [confirm, failed, valid]);
  const done = result?.done === true;
  const message = failed
    ? "결제가 완료되지 않았습니다. 주문 내역에서 상태를 확인해 주세요."
    : !valid
      ? "유효하지 않은 결제 응답입니다. 주문 내역에서 상태를 확인해 주세요."
      : (result?.message ?? "서버에서 결제를 확인하고 있습니다…");
  const Icon = done ? CheckCircle2 : CreditCard;
  return (
    <>
      <PublicHeader />
      <main id="main" className="payment-result-page">
        <section
          className="payment-result-panel"
          aria-busy={!failed && valid && result === null}
        >
          <Icon size={36} aria-hidden="true" />
          <p className="eyebrow">주문 확인</p>
          <h1>
            {failed ? "결제 중단" : done ? "결제 확인 완료" : "결제 확인"}
          </h1>
          <p role="status">{message}</p>
          <p className="muted">테스트 환경으로 실제 돈은 청구되지 않습니다.</p>
          <div className="payment-result-actions">
            {!failed && valid && result && !done && (
              <Button
                onClick={() => {
                  setResult(null);
                  void confirm();
                }}
              >
                결제 상태 다시 확인
              </Button>
            )}
            {done && (
              <Button asChild>
                <Link href="/assets">내 에셋 확인</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/billing">주문 내역 확인</Link>
            </Button>
          </div>
          {!failed && valid && !done && (
            <p className="muted">
              같은 주문을 다시 확인해도 중복 결제되지 않습니다.
            </p>
          )}
        </section>
      </main>
    </>
  );
}
