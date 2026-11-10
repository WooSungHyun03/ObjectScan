"use client";
import Link from "next/link";
import { educationMode } from "@/lib/project-purpose";
import { useEffect, useState } from "react";
import { pricingTiers, type ReconstructionMode } from "@objectscan/shared";
import { api } from "@/lib/client-api";
import { Button } from "./ui/button";
import { Box, Globe2, ArrowUpRight, ShieldCheck } from "lucide-react";
type Pricing = {
  tiers: {
    mode: ReconstructionMode;
    min_images: number;
    max_images: number;
    amount: number;
    currency: string;
  }[];
  commission_bps: number | null;
  payments_mode: string;
};
export function Pricing() {
  const [data, setData] = useState<Pricing | null>(null),
    [mode, setMode] = useState<ReconstructionMode>("object"),
    [error, setError] = useState("");
  useEffect(() => {
    void api<Pricing>("pricing")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <>
      <div className="public-page-heading">
        <span className="section-kicker">
          {educationMode() ? "교육·연구 이용 안내" : "제작 요금"}
        </span>
        <h1>
          {educationMode() ? "사진으로 배우는" : "사용한 만큼."}
          <br />
          {educationMode() ? "3D 재구성." : "확인한 금액으로."}
        </h1>
        <p>
          {educationMode()
            ? "학교 프로젝트의 비상업 교육·연구용 서비스입니다. 결제와 에셋 판매를 운영하지 않습니다. 생성은 실제 검증을 통과한 경로에 한해 제공됩니다."
            : "사진 업로드 수 기준 20장 단위 요금입니다. 객체와 전체 장면을 별도로 계산합니다."}
        </p>
      </div>
      <div className="pricing-mode-switch">
        <button
          className={mode === "object" ? "active" : ""}
          onClick={() => setMode("object")}
          aria-pressed={mode === "object"}
        >
          <Box size={18} />
          Object Mesh
        </button>
        <button
          className={mode === "scene" ? "active" : ""}
          onClick={() => setMode("scene")}
          aria-pressed={mode === "scene"}
        >
          <Globe2 size={18} />
          Full Scene Mesh
        </button>
      </div>
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      <div className="pricing-table">
        <table>
          <thead>
            <tr>
              <th>업로드한 사진 수</th>
              <th>복원 방식</th>
              <th>제작 금액</th>
            </tr>
          </thead>
          <tbody>
            {pricingTiers.map((t) => {
              const p = data?.tiers.find(
                (p) => p.mode === mode && p.min_images === t.lower,
              );
              return (
                <tr key={t.key}>
                  <td>
                    {t.lower}–{t.upper}장
                  </td>
                  <td>
                    {mode === "scene"
                      ? "Gaussian Wrapping"
                      : t.upper <= 20
                        ? "Pixal3D"
                        : "Object-Aware Loss"}
                  </td>
                  <td>
                    {educationMode() ? (
                      "과금 없음"
                    ) : p ? (
                      `₩${Number(p.amount).toLocaleString()}`
                    ) : (
                      <span className="muted">가격 설정 대기</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!educationMode() && (
        <div className="pricing-policies">
          <article>
            <ShieldCheck size={23} />
            <h2>견적 확인 후 결제</h2>
            <p>
              서버에 저장된 요금표로 금액을 확정합니다. 모델 가용성 및 입력
              검증에 실패하면 결제하지 않습니다.
            </p>
          </article>
          <article>
            <Box size={23} />
            <h2>원본 수와 입력 시점 구분</h2>
            <p>
              20장 업로드가 20개 모델 입력 시점을 의미하지 않습니다. 제외한
              사진도 업로드 요금 구간에는 포함됩니다.
            </p>
          </article>
          <article>
            <Globe2 size={23} />
            <h2>마켓 수수료</h2>
            <p>
              {data?.commission_bps != null
                ? `검증된 구매 금액의 ${(data.commission_bps / 100).toFixed(2)}%입니다.`
                : "수수료율 설정 대기 중입니다. 임의의 수수료를 부과하지 않습니다."}{" "}
              판매자 자동 송금은 별도 지급대행 연결 전 비활성화됩니다.
            </p>
          </article>
        </div>
      )}
      <div className="notice warning">
        {educationMode()
          ? "사진 업로드·객체 선택·마스크 검토와 샘플 3D 뷰어를 사용할 수 있습니다. 전체 장면과 21장 이상 객체 생성은 품질 검증 중입니다. 과금 없음은 모든 모델의 생성 개방을 의미하지 않습니다."
          : data?.payments_mode === "test"
            ? "토스페이먼츠 테스트 모드입니다. 실제 돈이 청구되지 않습니다."
            : "현재 유료 제작과 구매는 비활성화되어 있습니다. 모델 검증과 결제 연결을 준비하고 있습니다."}
      </div>
      <Button asChild>
        <Link href="/reconstruct/new">
          프로젝트 준비하기 <ArrowUpRight size={16} />
        </Link>
      </Button>
    </>
  );
}
