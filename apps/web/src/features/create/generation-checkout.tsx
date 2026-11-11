"use client";
import { useEffect, useState } from "react";
import { api, post } from "@/lib/client-api";
import { customerError } from "@/lib/customer-copy";
import { Button } from "@/components/ui/button";
type Quote = {
  gate: { allowed: boolean; errors: string[] };
  project: { mode: string; input_image_count: number };
};
type Wallet = {
  balance: number;
  rates: { mode: string; min_images: number; credits: number }[];
};
export function GenerationCheckout({
  projectId,
  onStarted,
}: {
  projectId: string;
  onStarted: () => void;
}) {
  const [quote, setQuote] = useState<Quote | null>(null),
    [wallet, setWallet] = useState<Wallet | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void Promise.all([
      api<Quote>(`projects/${projectId}/qa`),
      api<Wallet>("wallet"),
    ])
      .then(([q, w]) => {
        if (active) {
          setQuote(q);
          setWallet(w);
        }
      })
      .catch((e) => {
        if (active) setError(customerError(undefined, e.message));
      });
    return () => {
      active = false;
    };
  }, [projectId]);
  const tier = quote
    ? Math.floor((quote.project.input_image_count - 1) / 20) * 20 + 1
    : 0;
  const rate = wallet?.rates.find(
    (r) => r.mode === quote?.project.mode && r.min_images === tier,
  );
  const ready = Boolean(
    quote?.gate.allowed && rate && wallet && wallet.balance >= rate.credits,
  );
  async function start() {
    setBusy(true);
    setError("");
    try {
      await post(`projects/${projectId}/generate`, {
        idempotency_key: crypto.randomUUID(),
      });
      onStarted();
    } catch (e) {
      setError(customerError(undefined, (e as Error).message));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="quote-box" aria-label="제작 크레딧">
      <h3>제작 확인</h3>
      <div>
        <span>보유 크레딧</span>
        <strong>
          {wallet
            ? new Intl.NumberFormat("ko-KR").format(wallet.balance)
            : "확인 중…"}
        </strong>
      </div>
      <div>
        <span>이번 작업 차감</span>
        <strong>{rate ? `${rate.credits} 크레딧` : "요금 준비 중"}</strong>
      </div>
      <p>
        {!quote
          ? "사진과 제작 조건을 확인하고 있습니다."
          : !quote.gate.allowed
            ? "이 사진 구성의 제작은 준비 중입니다. 사진과 대상 선택 내용은 안전하게 보관됩니다."
            : !rate
              ? "요금이 확정되면 제작할 수 있습니다."
              : !ready
                ? "크레딧이 부족합니다. 잔액을 확인해 주세요."
                : "작업 등록 시 한 번 차감합니다. 제작 실패 또는 취소 시 자동으로 돌려드립니다."}
      </p>
      <Button disabled={!ready || busy} onClick={() => void start()}>
        {busy ? "작업 등록 중…" : "크레딧으로 3D 만들기"}
      </Button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
