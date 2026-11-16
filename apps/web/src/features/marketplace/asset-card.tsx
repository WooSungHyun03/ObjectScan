"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { categoryLabels } from "./presentation";
import { Box, Images, ArrowUpRight } from "lucide-react";
import { listingPosterPath, type ListingPosterFields } from "./listing-poster";
export type Listing = ListingPosterFields & {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  license: string;
  preview_url?: string;
  public_preview_path?: string;
  seller_badge?: string;
  test_mode?: boolean;
};
export function AssetCard({
  listing: l,
  educational,
}: {
  listing: Listing;
  educational: boolean;
}) {
  const Icon = l.category === "scenes" ? Images : Box;
  const poster = listingPosterPath(l.id, l.poster_url);
  const [failedPoster, setFailedPoster] = useState<string>();
  return (
    <Link className="project-card listing-card" href={`/marketplace/${l.id}`}>
      <div
        className={`project-cover ${l.category === "scenes" ? "scene" : "object"}`}
      >
        {poster && failedPoster !== poster ? (
          <Image
            className="listing-poster"
            src={poster}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 767px) 100vw, 360px"
            onError={() => setFailedPoster(poster)}
          />
        ) : (
          <div className="listing-poster-empty">
            <Icon aria-hidden="true" size={48} strokeWidth={1} />
            <span>미리보기 이미지 없음</span>
          </div>
        )}
        <span className="status-badge">GLB</span>
      </div>
      <div className="project-info">
        <h3>{l.title}</h3>
        <p>{categoryLabels[l.category] ?? "3D 에셋"} · 크리에이터 에셋</p>
        {l.test_mode && <small>테스트 가격 · 실제 청구 없음</small>}
        <strong className="listing-price">
          {educational
            ? "공개 미리보기"
            : new Intl.NumberFormat("ko-KR", {
                style: "currency",
                currency: l.currency,
              }).format(Number(l.price))}
        </strong>
        <ArrowUpRight aria-hidden="true" size={18} />
      </div>
    </Link>
  );
}
