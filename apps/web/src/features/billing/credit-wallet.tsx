"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, post } from "@/lib/client-api";
import { customerError } from "@/lib/customer-copy";
import { Button } from "@/components/ui/button";
type Pack = { id: string; name: string; credits: number; amount: number };
export function CreditWallet() {
  const router = useRouter();
  const [balance, S] = useState<number | null>(null),
    [trial, T] = useState(false),
    [packs, P] = useState<Pack[]>([]),
    [error, E] = useState(""),
    [busy, B] = useState(false);
  useEffect(() => {
    void Promise.all([
      api<{ balance: number; trial_available: boolean }>("wallet"),
      api<{ packages: Pack[] }>("pricing"),
    ])
      .then(([w, p]) => {
        S(w.balance);
        T(w.trial_available);
        P(p.packages ?? []);
      })
      .catch((e) => E(customerError(undefined, e.message)));
  }, []);
  async function buy(id: string) {
    B(true);
    E("");
    try {
      const o = await post<{ id: string }>("orders", {
        kind: "credits",
        package_id: id,
        idempotency_key: crypto.randomUUID(),
      });
      router.push(`/checkout/${o.id}`);
    } catch (e) {
      E(customerError(undefined, (e as Error).message));
    } finally {
      B(false);
    }
  }
  return (
    <section aria-label="내 크레딧" className="wallet-panel">
      <h2>보유 크레딧</h2>
      <strong className="wallet-balance">
        {balance === null
          ? "확인 중…"
          : new Intl.NumberFormat("ko-KR").format(balance)}
      </strong>
      {trial && (
        <Button
          disabled={busy}
          onClick={() => {
            B(true);
            void post<{ balance: number }>("wallet/trial")
              .then((w) => {
                S(w.balance);
                T(false);
              })
              .catch((e) => E(customerError(undefined, e.message)))
              .finally(() => B(false));
          }}
        >
          체험 크레딧 받기
        </Button>
      )}
      {packs.length ? (
        <div className="credit-packages">
          {packs.map((p) => (
            <article key={p.id}>
              <h3>{p.name}</h3>
              <p>
                {p.credits} 크레딧 ·{" "}
                {new Intl.NumberFormat("ko-KR", {
                  style: "currency",
                  currency: "KRW",
                }).format(p.amount)}
              </p>
              <Button disabled={busy} onClick={() => void buy(p.id)}>
                테스트 충전
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <p>충전 상품을 준비하고 있습니다. 확정된 상품만 이곳에 표시합니다.</p>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
