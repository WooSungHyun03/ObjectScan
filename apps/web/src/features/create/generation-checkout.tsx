"use client";
import { useState } from "react";
import { post } from "@/lib/client-api";
import { customerError } from "@/lib/customer-copy";
import { Button } from "@/components/ui/button";
import {
  blockedGenerationMessage,
  generationWalletSchema,
  quotedCredits,
  type GenerationQuote,
} from "./generation-availability";
import { useGenerationCheck } from "./use-generation-check";
export function GenerationCheckout({
  projectId,
  quote,
  quoteFailed,
  refreshQuote,
  onStarted,
}: {
  projectId: string;
  quote?: GenerationQuote;
  quoteFailed?: boolean;
  refreshQuote: () => void;
  onStarted: () => void;
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const wallet = useGenerationCheck("wallet", generationWalletSchema);
  const credits = quotedCredits(quote, wallet.data);
  const ready =
    credits !== undefined &&
    wallet.data !== undefined &&
    wallet.data.balance >= credits;
  const blocked = quote !== undefined && !quote.gate.allowed;
  const unavailable = quoteFailed || wallet.failed;
  const amount = blocked
    ? "차감 없음"
    : credits !== undefined
      ? `${credits} 크레딧`
      : unavailable
        ? "확인 불가"
        : "미확정";
  async function start() {
    if (!ready || busy) return;
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
          {wallet.data
            ? new Intl.NumberFormat("ko-KR").format(wallet.data.balance)
            : wallet.failed
              ? "확인 불가"
              : "확인 중…"}
        </strong>
      </div>
      <div>
        <span>이번 작업 차감</span>
        <strong>{amount}</strong>
      </div>
      <p role="status">
        {blocked
          ? blockedGenerationMessage(quote)
          : unavailable
            ? "제작 조건 또는 요금을 확인하지 못했습니다. 사진과 선택 내용은 그대로 유지됩니다."
            : !quote || !wallet.data
              ? "사진과 제작 조건을 확인하고 있습니다."
              : credits === undefined
                ? "요금이 확정되면 제작할 수 있습니다."
                : !ready
                  ? "크레딧이 부족합니다. 잔액을 확인해 주세요."
                  : "작업 등록 시 한 번 차감합니다. 제작 실패 또는 취소 시 자동으로 돌려드립니다."}
      </p>
      {(unavailable || quote?.gate.errors.includes("MODEL_UNAVAILABLE")) && (
        <Button
          variant="outline"
          onClick={() => {
            refreshQuote();
            wallet.retry();
          }}
        >
          제작 조건 다시 확인
        </Button>
      )}
      <Button disabled={!ready || busy} onClick={() => void start()}>
        {busy ? "작업 등록 중…" : "크레딧으로 3D 만들기"}
      </Button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
