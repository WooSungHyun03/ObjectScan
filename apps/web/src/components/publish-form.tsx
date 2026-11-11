"use client";
import { customerError } from "@/lib/customer-copy";
import { educationMode } from "@/lib/project-purpose";
import { useState } from "react";
import type { Artifact } from "@objectscan/shared";
import { post } from "@/lib/client-api";
import { Button } from "./ui/button";
export function PublishForm({
  asset,
  onComplete,
}: {
  asset: Pick<Artifact, "id" | "name">;
  onComplete: () => void;
}) {
  const [title, setTitle] = useState(asset.name),
    [description, setDescription] = useState(""),
    [price, setPrice] = useState(""),
    [license, setLicense] = useState("standard"),
    [category, setCategory] = useState("objects"),
    [consent, setConsent] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function save(status: "draft" | "pending") {
    setBusy(true);
    setError("");
    try {
      await post(`assets/${asset.id}/publish`, {
        title,
        description,
        price: Number(price),
        category,
        license,
        consent,
        status,
      });
      setMessage(
        status === "draft"
          ? "게시 초안을 저장했습니다."
          : "운영자 검토를 요청했습니다.",
      );
      onComplete();
    } catch (e) {
      setError(customerError(undefined, (e as Error).message));
    } finally {
      setBusy(false);
    }
  }
  if (educationMode())
    return (
      <div className="notice">
        교육·연구용 공개 서비스에서는 에셋 판매와 판매 게시 신청을 운영하지
        않습니다. 결과물은 개인 프로젝트에서 확인하세요.
      </div>
    );
  return (
    <form
      className="publish-form"
      onSubmit={(e) => {
        e.preventDefault();
        void save("pending");
      }}
    >
      <h3>에셋 게시 신청</h3>
      <label className="field">
        제목
        <input
          required
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="field">
        설명
        <textarea
          maxLength={1500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="field">
        카테고리
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="objects">사물</option>
          <option value="scenes">장면</option>
          <option value="furniture">가구</option>
          <option value="decor">소품</option>
          <option value="other">기타</option>
        </select>
      </label>
      <label className="field">
        이용 라이선스
        <select value={license} onChange={(e) => setLicense(e.target.value)}>
          <option value="standard">일반 이용 — 재판매·재배포 제외</option>
          <option value="cc-by-4.0">
            CC BY 4.0 — 출처 표시 후 이용·재배포
          </option>
          <option value="cc0-1.0">CC0 1.0 — 권리 포기 범위 내 자유 이용</option>
        </select>
      </label>
      <p className="muted">
        선택한 이용 조건을 제공할 권한이 있어야 합니다. 출처 표시가 필요한 경우
        설명에 저작자와 원본 링크를 기재해 주세요.
      </p>
      <label className="field">
        테스트 판매 가격 (원)
        <input
          required
          type="number"
          min={1}
          max={100000000}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>
      <label className="checkbox">
        <input
          required
          checked={consent}
          type="checkbox"
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          저작물의 판매 권리를 보유하며 검토 후 3D 미리보기 공개에 동의합니다.
          원본 사진은 공개되지 않습니다.
        </span>
      </label>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      <div className="form-actions">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!consent || !price || busy}
          onClick={() => void save("draft")}
        >
          초안 저장
        </Button>
        <Button type="submit" size="sm" disabled={!consent || busy}>
          검토 요청
        </Button>
      </div>
    </form>
  );
}
