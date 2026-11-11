import Link from "next/link";
import { categoryLabels } from "./presentation";
import { Box, Images, ArrowUpRight } from "lucide-react";
export type Listing = {
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
  return (
    <Link className="project-card listing-card" href={`/marketplace/${l.id}`}>
      <div
        className={`project-cover ${l.category === "scenes" ? "scene" : "object"}`}
      >
        <Icon aria-hidden="true" size={60} strokeWidth={1} />
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
