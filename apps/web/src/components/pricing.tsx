"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Images, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/client-api";
import { customerError } from "@/lib/customer-copy";
import { Button } from "./ui/button";
type PricingData = {
  tiers: {
    mode: string;
    min_images: number;
    max_images: number;
    amount: number;
  }[];
  credit_rates: { mode: string; min_images: number; credits: number }[];
  commission_bps: number | null;
  payments_mode: string;
};
export function Pricing() {
  const [data, S] = useState<PricingData | null>(null),
    [mode, M] = useState("object"),
    [singlePhoto, setSinglePhoto] = useState<boolean | null>(null),
    [error, E] = useState("");
  useEffect(() => {
    void Promise.all([
      api<PricingData>("pricing"),
      api<{ capabilities: { single_photo: boolean } }>("health"),
    ])
      .then(([pricing, health]) => {
        S(pricing);
        setSinglePhoto(health.capabilities.single_photo);
      })
      .catch((e) => E(customerError(undefined, e.message)));
  }, []);
  return (
    <>
      <div className="public-page-heading">
        <span className="section-kicker">요금 안내</span>
        <h1>
          내 작업에 맞게,
          <br />
          필요한 만큼.
        </h1>
        <p>
          크레딧을 충전하고, 제작할 때 한 번만 사용하세요.
          <br />
          사진 수와 제작 방식에 맞춰 차감량을 먼저 확인합니다.
        </p>
      </div>
      <section className="credit-packages" aria-label="크레딧 패키지">
        {[
          {
            name: "무료 체험",
            text: "처음 시작하는 나의 3D 작업",
            note: "체험 제공 시 계정에 표시됩니다.",
          },
          {
            name: "스타터",
            text: "가끔 만드는 소품과 아이디어",
            note: "충전 상품 준비 중",
          },
          {
            name: "크리에이터",
            text: "꾸준히 쌓아가는 나의 컬렉션",
            note: "충전 상품 준비 중",
          },
        ].map((p) => (
          <article key={p.name}>
            <p className="eyebrow">{p.name}</p>
            <h2>{p.text}</h2>
            <p>{p.note}</p>
            <Link href="/billing">
              내 크레딧 확인 <ArrowUpRight size={16} />
            </Link>
          </article>
        ))}
      </section>
      <p className="notice" role="status">
        {singlePhoto === null
          ? "지원되는 제작 방식을 확인하고 있습니다…"
          : singlePhoto
            ? "현재 사물 사진 1장으로 3D를 만들 수 있습니다. 여러 사진과 공간 전체 제작은 준비 중입니다."
            : "3D 제작 지원을 준비하고 있습니다. 지원되지 않는 사진 구성에는 크레딧을 차감하지 않습니다."}
      </p>
      <div className="pricing-mode-switch">
        {[
          { id: "object", name: "객체만 만들기", Icon: Box },
          { id: "scene", name: "공간 전체 만들기", Icon: Images },
        ].map(({ id, name, Icon }) => (
          <button
            key={id}
            aria-pressed={mode === id}
            className={mode === id ? "active" : ""}
            onClick={() => M(id)}
          >
            <Icon size={18} aria-hidden="true" />
            {name}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      <div className="pricing-table">
        <table>
          <caption>사진 수별 제작 차감량 · 지원되는 사진 구성에만 적용</caption>
          <thead>
            <tr>
              <th>사진 수</th>
              <th>차감 크레딧</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }, (_, i) => i * 20 + 1).map((n) => (
              <tr key={n}>
                <td>
                  {n}–{n + 19}장
                </td>
                <td>
                  {data?.credit_rates?.find(
                    (r) => r.mode === mode && r.min_images === n,
                  )?.credits ?? "요금 준비 중"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pricing-policies">
        <article>
          <h2>제작 전에 확인하세요</h2>
          <p>
            업로드한 사진 수를 기준으로 계산합니다. 처리에 사용할 사진 수는 작업
            상세에 별도로 표시합니다. 지원하지 않는 제작 방식에는 크레딧을
            차감하지 않습니다.
          </p>
        </article>
        <article>
          <h2>실패한 작업은 복구</h2>
          <p>
            크레딧으로 요청한 제작이 실패하거나 취소되면 차감한 크레딧을
            자동으로 돌려드립니다.
          </p>
        </article>
        <article>
          <h2>에셋 마켓 수수료</h2>
          <p>
            {data?.commission_bps != null
              ? `거래 금액의 ${data.commission_bps / 100}%`
              : "수수료 정책 준비 중"}
            . 결제 화면에서 구매 조건과 포함 파일을 확인하세요.
          </p>
        </article>
      </div>
      <p className="notice">
        {data?.payments_mode === "test"
          ? "테스트 결제 환경입니다. 실제 돈은 청구되지 않으며 판매 대금도 송금되지 않습니다."
          : "충전 상품은 준비 중입니다. 확정된 요금과 이용 가능한 제작 방식만 작업 화면에 표시합니다."}
      </p>
      <Button asChild>
        <Link href="/create">
          3D 모델 만들기 <ArrowUpRight size={16} />
        </Link>
      </Button>
    </>
  );
}
