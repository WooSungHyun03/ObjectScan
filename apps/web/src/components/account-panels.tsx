"use client";
import { customerError } from "@/lib/customer-copy";
import { educationMode } from "@/lib/project-purpose";
import { useEffect, useState, useCallback, type FormEvent } from "react";
import { api, post, date } from "@/lib/client-api";
import { Button } from "./ui/button";
import { PageTitle } from "./page-title";
import { CreditWallet } from "@/features/billing/credit-wallet";
type Entry = {
  id: string;
  kind: string;
  amount: number;
  created_at: string;
  status?: string;
};
export function BillingPanel() {
  const [data, setData] = useState<{
      ledger: Entry[];
      balance: { available: number; reserved: number };
      payouts: Entry[];
      orders: Entry[];
      payments_mode: string;
    } | null>(null),
    [error, setError] = useState(""),
    [amount, setAmount] = useState(""),
    [busy, setBusy] = useState(false);
  const [refundOrder, setRefundOrder] = useState(""),
    [reason, setReason] = useState(""),
    [message, setMessage] = useState("");
  const load = useCallback(
    () => api<NonNullable<typeof data>>("billing").then(setData),
    [],
  );
  useEffect(() => {
    void load().catch((e) => setError(customerError(undefined, e.message)));
  }, [load]);
  async function payout(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await post("payouts", { amount: Number(amount) });
      await load();
      setAmount("");
    } catch (e) {
      setError(customerError(undefined, (e as Error).message));
    } finally {
      setBusy(false);
    }
  }
  async function requestRefund(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await post(`orders/${refundOrder}/refund-request`, { reason });
      setMessage(
        "환불 검토 요청을 접수했습니다. 승인 후 결제 제공사에서 취소를 확인합니다.",
      );
      setReason("");
    } catch (e) {
      setError(customerError(undefined, (e as Error).message));
    } finally {
      setBusy(false);
    }
  }
  if (educationMode())
    return (
      <>
        <PageTitle
          title="이용 안내"
          description="학교 프로젝트의 비상업 교육·연구용 서비스입니다."
        />
        <div className="notice">
          결제·판매·정산을 운영하지 않으며 이용 금액을 청구하지 않습니다.
        </div>
      </>
    );
  return (
    <>
      <PageTitle
        title="크레딧과 결제 내역"
        description="사용량별 주문과 판매 내역을 확인하세요."
      />
      <CreditWallet />
      <div className="notice warning">
        현재 테스트 결제 준비 단계입니다. 테스트 거래는 출금 가능한 판매 잔액에
        반영되지 않습니다.
      </div>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      <div className="mode-grid">
        <article className="settings-card">
          <small>정산 가능 잔액</small>
          <h2>₩{Number(data?.balance.available ?? 0).toLocaleString()}</h2>
          <p>
            검토 중인 출금: ₩
            {Number(data?.balance.reserved ?? 0).toLocaleString()}
          </p>
          <form onSubmit={payout}>
            <label>
              출금 요청 금액
              <input
                type="number"
                required
                min="1"
                max={data?.balance.available ?? 0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <Button disabled={busy || !data?.balance.available}>
              관리자 검토 요청
            </Button>
          </form>
          <p>자동 송금은 지원하지 않습니다. 지급 여부는 관리자가 확인합니다.</p>
        </article>
        <article className="settings-card">
          <h3>출금 요청</h3>
          {data?.payouts.length ? (
            data.payouts.map((p) => (
              <p key={p.id}>
                {date(p.created_at)} · ₩{Number(p.amount).toLocaleString()} ·{" "}
                {p.status}
              </p>
            ))
          ) : (
            <p>출금 요청이 없습니다.</p>
          )}
        </article>
      </div>
      <section className="settings-card">
        <h2>주문과 환불 검토</h2>
        {data?.orders.length ? (
          data.orders.map((o) => (
            <p key={o.id}>
              {date(o.created_at)} · {o.id.slice(0, 8)} ·{" "}
              {o.kind === "credits"
                ? "크레딧 충전"
                : o.kind === "generation"
                  ? "3D 생성"
                  : "에셋 구매"}{" "}
              · ₩{Number(o.amount).toLocaleString()} · {o.status}
            </p>
          ))
        ) : (
          <p>주문이 없습니다.</p>
        )}
        {data?.orders.some((o) => o.status === "paid") && (
          <form onSubmit={requestRefund}>
            <label>
              환불 검토할 주문
              <select
                required
                value={refundOrder}
                onChange={(e) => setRefundOrder(e.target.value)}
              >
                <option value="">주문 선택</option>
                {data.orders
                  .filter((o) => o.status === "paid")
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id.slice(0, 8)} · ₩{Number(o.amount).toLocaleString()}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              환불 요청 사유
              <textarea
                required
                minLength={5}
                maxLength={200}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <Button disabled={busy || !refundOrder}>환불 검토 요청</Button>
          </form>
        )}
      </section>
      <section className="settings-card">
        <h2>거래 원장</h2>
        {!data ? (
          <p>불러오는 중…</p>
        ) : data.ledger.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>일시</th>
                  <th>구분</th>
                  <th>금액</th>
                </tr>
              </thead>
              <tbody>
                {data.ledger.map((l) => (
                  <tr key={l.id}>
                    <td>{date(l.created_at)}</td>
                    <td>{l.kind}</td>
                    <td>₩{Number(l.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>결제 내역이 없습니다.</p>
        )}
      </section>
    </>
  );
}
export function SettingsPanel() {
  const [me, setMe] = useState<{ name: string; email: string } | null>(null),
    [name, setName] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    void api<NonNullable<typeof me>>("me")
      .then((v) => {
        setMe(v);
        setName(v.name);
      })
      .catch((e) => setMessage(customerError(undefined, e.message)));
  }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("settings", {
        method: "PATCH",
        body: JSON.stringify({ display_name: name }),
      });
      setMessage("이름을 저장했습니다.");
    } catch (e) {
      setMessage(customerError(undefined, (e as Error).message));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        title="계정 설정"
        description="개인정보와 데이터 처리 요청을 관리하세요."
      />
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <section className="settings-card">
        <h2>프로필</h2>
        <form onSubmit={save}>
          <label>
            이메일
            <input readOnly value={me?.email ?? ""} />
          </label>
          <label>
            표시 이름
            <input
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <Button disabled={busy || !me}>변경 저장</Button>
        </form>
      </section>
      <section className="settings-card">
        <h2>데이터 삭제 요청</h2>
        <p>
          업로드 원본과 결과물은 비공개로 보관합니다. 삭제 요청은 주문 및 구매자
          권한 확인 후 관리자가 처리합니다.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            if (confirm("계정 및 업로드 데이터 삭제 검토를 요청할까요?"))
              void post("data-deletion")
                .then(() => setMessage("삭제 검토 요청을 접수했습니다."))
                .catch((e) => setMessage(customerError(undefined, e.message)));
          }}
        >
          삭제 검토 요청
        </Button>
      </section>
    </>
  );
}
