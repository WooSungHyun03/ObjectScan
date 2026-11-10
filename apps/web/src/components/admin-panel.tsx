"use client";
import { useEffect, useState, useCallback, type FormEvent } from "react";
import { api, post, stateLabels } from "@/lib/client-api";
import { PageTitle } from "./page-title";
import { Button } from "./ui/button";
type Row = {
  amount?: number;
  id: string;
  title?: string;
  state?: keyof typeof stateLabels;
  kind?: string;
  status?: string;
  progress?: number;
  error_code?: string;
};
export function AdminPanel() {
  const [data, setData] = useState<{
      jobs: Row[];
      listings: Row[];
      reports: Row[];
      payouts: Row[];
      refund_requests: {
        id: string;
        entity_id: string;
        metadata: { reason: string };
      }[];
      health: { worker_online: boolean; real_gpu_validated: boolean };
    } | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [mode, setMode] = useState("object"),
    [tier, setTier] = useState("1"),
    [amount, setAmount] = useState(""),
    [bps, setBps] = useState(""),
    [busy, setBusy] = useState(false);
  const load = useCallback(
    () => api<NonNullable<typeof data>>("admin").then(setData),
    [],
  );
  useEffect(() => {
    void load().catch((e) => setError(e.message));
  }, [load]);
  async function action(path: string, body: object) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await post<{ deleted?: number }>(`admin/${path}`, body);
      await load();
      setMessage(
        path === "cleanup-uploads"
          ? `${result.deleted ?? 0}개 업로드 정리를 확인했습니다.`
          : "처리 결과를 반영했습니다.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function price(e: FormEvent) {
    e.preventDefault();
    void action("pricing", {
      mode,
      min_images: Number(tier),
      amount: Number(amount),
      enabled: true,
    });
  }
  return (
    <>
      <PageTitle
        title="운영 관리"
        description="요금 정책, 공개 에셋 검토 및 GPU 작업 복구를 관리합니다."
      />
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {data && (
        <p className="notice">
          Worker {data.health.worker_online ? "연결됨" : "오프라인"} · 실제 GPU
          모델 검증 {data.health.real_gpu_validated ? "통과" : "미완료"}
        </p>
      )}
      <div className="mode-grid">
        <section className="settings-card">
          <h2>사용량 요금 설정</h2>
          <form onSubmit={price}>
            <label>
              워크플로
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="object">Object Mesh</option>
                <option value="scene">Full Scene Mesh</option>
              </select>
            </label>
            <label>
              이미지 구간
              <select value={tier} onChange={(e) => setTier(e.target.value)}>
                {Array.from({ length: 10 }, (_, i) => i * 20 + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}–{n + 19}장
                  </option>
                ))}
              </select>
            </label>
            <label>
              금액 (KRW)
              <input
                required
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <Button disabled={busy}>요금 저장</Button>
          </form>
        </section>
        <section className="settings-card">
          <h2>판매 수수료</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void action("commission", { bps: Number(bps) });
            }}
          >
            <label>
              수수료 bps (100bps = 1%)
              <input
                required
                type="number"
                min="0"
                max="10000"
                value={bps}
                onChange={(e) => setBps(e.target.value)}
              />
            </label>
            <Button disabled={busy}>수수료 저장</Button>
          </form>
          <h3>만료된 GPU 슬롯 복구</h3>
          <p>서버에서 해당 프로세스가 종료된 것을 직접 확인한 뒤 실행하세요.</p>
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => {
              if (
                confirm(
                  "GPU 서버에서 이전 작업 프로세스가 완전히 종료되었음을 확인했습니까?",
                )
              )
                void action("reconcile", { confirm_gpu_stopped: true });
            }}
          >
            종료 확인 후 슬롯 복구
          </Button>
          <h3>만료된 업로드 정리</h3>
          <p>
            25시간 이상 지난 미완료·거절 업로드를 최대 25개 정리합니다. 검증된
            입력은 보관합니다.
          </p>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void action("cleanup-uploads", {})}
          >
            만료된 업로드 정리
          </Button>
        </section>
      </div>
      <section className="settings-card">
        <h2>테스트 결제 환불 검토</h2>
        <p>
          완료된 생성 작업은 자동 환불하지 않습니다. 실제 운영 결제와 송금은
          비활성 상태입니다.
        </p>
        {data?.refund_requests?.length ? (
          data.refund_requests.map((r) => (
            <div className="admin-row" key={r.id}>
              <p>
                {r.entity_id.slice(0, 8)} · {r.metadata.reason}
              </p>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  if (
                    confirm(
                      "이 테스트 결제를 전액 취소하고 구매 다운로드 권한을 해제할까요?",
                    )
                  )
                    void action("refund", {
                      order_id: r.entity_id,
                      reason: r.metadata.reason,
                    });
                }}
              >
                테스트 전액 환불
              </Button>
            </div>
          ))
        ) : (
          <p>환불 요청이 없습니다.</p>
        )}
      </section>
      <section className="settings-card">
        <h2>에셋 검토</h2>
        {data?.listings.length ? (
          data.listings.map((l) => (
            <div className="admin-row" key={l.id}>
              <p>
                {l.title} · {l.status}
              </p>
              {["approved", "rejected", "removed"].map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    void action("moderate", { listing_id: l.id, status })
                  }
                >
                  {status === "approved"
                    ? "승인"
                    : status === "rejected"
                      ? "반려"
                      : "공개 중단"}
                </Button>
              ))}
            </div>
          ))
        ) : (
          <p>검토할 게시물이 없습니다.</p>
        )}
      </section>
      <section className="settings-card">
        <h2>출금 요청 검토</h2>
        {data?.payouts?.length ? (
          data.payouts.map((p) => (
            <div className="admin-row" key={p.id}>
              <p>
                {p.id.slice(0, 8)} · ₩{Number(p.amount).toLocaleString()} ·{" "}
                {p.status}
              </p>
              {["requested", "approved"].includes(p.status ?? "") && (
                <>
                  {p.status === "requested" && (
                    <Button
                      disabled={busy}
                      onClick={() =>
                        void action("payout-review", {
                          id: p.id,
                          status: "approved",
                        })
                      }
                    >
                      검토 승인
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void action("payout-review", {
                        id: p.id,
                        status: "rejected",
                      })
                    }
                  >
                    반려 · 예약 해제
                  </Button>
                </>
              )}
            </div>
          ))
        ) : (
          <p>정산 요청이 없습니다.</p>
        )}
        <h2>작업 큐</h2>
        {data?.jobs.map((j) => (
          <p key={j.id}>
            {j.id.slice(0, 8)} · {j.kind} ·{" "}
            {j.state ? stateLabels[j.state] : ""} · {j.progress}% {j.error_code}
          </p>
        ))}
        {!data?.jobs.length && <p>등록된 작업이 없습니다.</p>}
      </section>
    </>
  );
}
