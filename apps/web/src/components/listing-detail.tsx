"use client";
import { customerError } from "@/lib/customer-copy";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, Flag, Box } from "lucide-react";
import { api, post } from "@/lib/client-api";
import type { Listing } from "./marketplace";
import { Viewer } from "./viewer";
import { CheckoutButton } from "./checkout-button";
import { Button } from "./ui/button";
export function ListingDetail({ id }: { id: string }) {
  const [listing, setListing] = useState<Listing | null>(null),
    [error, setError] = useState(""),
    [report, setReport] = useState(false),
    [reason, setReason] = useState(""),
    [message, setMessage] = useState("");
  useEffect(() => {
    void api<Listing>(`listings/${id}`)
      .then(setListing)
      .catch((e) => setError(customerError(undefined, e.message)));
  }, [id]);
  return (
    <>
      <Link href="/marketplace" className="back-link">
        <ArrowLeft size={14} />
        에셋 마켓
      </Link>
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {listing ? (
        <div className="listing-detail-layout">
          <div>
            {listing.preview_url ? (
              <Viewer url={listing.preview_url} demo={false} />
            ) : (
              <div className="result-placeholder">
                <Box size={40} />
                <p>3D 미리보기 준비 중</p>
              </div>
            )}
            <p className="preview-disclosure">
              미리보기는 별도의 경량 모델입니다. 구매 후 검증된 원본 에셋을
              다운로드할 수 있습니다.
            </p>
          </div>
          <section className="listing-description">
            <span className="subtle-badge">{listing.category}</span>
            <h1>{listing.title}</h1>
            <p className="seller-badge">
              <ShieldCheck size={15} />
              {listing.seller_badge}
            </p>
            <p>{listing.description}</p>
            <div className="listing-amount">
              ₩{Number(listing.price).toLocaleString()}
              <small>KRW · 일회성 구매</small>
            </div>
            <CheckoutButton listingId={listing.id} label="에셋 테스트 구매" />
            <dl className="detail-list">
              <div>
                <dt>라이선스</dt>
                <dd>{listing.license}</dd>
              </div>
              <div>
                <dt>다운로드</dt>
                <dd>텍스처 GLB</dd>
              </div>
              <div>
                <dt>원본 사진</dt>
                <dd>판매자 비공개</dd>
              </div>
            </dl>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReport(!report)}
            >
              <Flag size={14} />
              콘텐츠 신고
            </Button>
            {report && (
              <form
                className="report-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void post(`listings/${listing.id}/report`, { reason })
                    .then(() => {
                      setMessage("신고가 등록되었습니다. 운영자가 검토합니다.");
                      setReport(false);
                    })
                    .catch((e) =>
                      setError(customerError(undefined, e.message)),
                    );
                }}
              >
                <label className="field">
                  신고 사유
                  <textarea
                    required
                    minLength={5}
                    maxLength={1000}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </label>
                <Button type="submit" size="sm">
                  신고 제출
                </Button>
              </form>
            )}
            {message && <p role="status">{message}</p>}
          </section>
        </div>
      ) : (
        !error && <div className="loading-state">에셋 불러오는 중…</div>
      )}
    </>
  );
}
