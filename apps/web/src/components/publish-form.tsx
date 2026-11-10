"use client";
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
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
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
        판매 가격 (원)
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
