"use client";
import { educationMode } from "@/lib/project-purpose";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  Store,
  Box,
  ArrowUpRight,
  Globe2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/client-api";
import { Button } from "./ui/button";
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
};
export function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [sort, setSort] = useState("recent"),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    const controller = new AbortController(),
      t = setTimeout(() => {
        setLoading(true);
        api<Listing[]>(
          `listings?search=${encodeURIComponent(query)}&category=${category}&sort=${sort}`,
          { signal: controller.signal },
        )
          .then((v) => {
            if (alive) {
              setListings(v);
              setError("");
            }
          })
          .catch((e) => {
            if (alive && e.name !== "AbortError") setError(e.message);
          })
          .finally(() => {
            if (alive) setLoading(false);
          });
      }, 200);
    return () => {
      alive = false;
      clearTimeout(t);
      controller.abort();
    };
  }, [query, category, sort]);
  return (
    <>
      <div className="market-hero">
        <div>
          <span className="section-kicker">3D Asset Marketplace</span>
          <h1>
            다음 창작의 재료를
            <br />
            발견하세요.
          </h1>
          <p>사물부터 공간까지. 크리에이터가 만든 3D 에셋을 만나보세요.</p>
        </div>
        <div className="market-hero-art" aria-hidden="true">
          <Box size={90} strokeWidth={0.7} />
          <Globe2 size={100} strokeWidth={0.7} />
        </div>
      </div>
      {educationMode() && (
        <p className="notice">
          학교 교육·연구용 서비스에서는 에셋 판매·구매를 운영하지 않습니다. 이
          화면에는 승인된 미리보기만 표시됩니다.
        </p>
      )}
      <div className="market-controls">
        <label className="market-search">
          <Search size={18} />
          <input
            value={query}
            placeholder="에셋 검색"
            aria-label="에셋 검색"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="sort-control">
          <span className="sr-only">정렬</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recent">최신 등록순</option>
            <option value="price">낮은 가격순</option>
          </select>
        </label>
      </div>
      <div className="category-tabs" aria-label="에셋 카테고리">
        {[
          { id: "all", label: "전체" },
          { id: "objects", label: "사물" },
          { id: "scenes", label: "장면" },
          { id: "furniture", label: "가구" },
          { id: "decor", label: "소품" },
          { id: "other", label: "기타" },
        ].map((c) => (
          <button
            key={c.id}
            className={category === c.id ? "active" : ""}
            aria-pressed={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="workspace-notice">
        <ShieldCheck size={16} />
        <span>
          {educationMode()
            ? "비상업 교육·연구용으로 운영합니다. 미리보기는 공개를 승인한 자료에 한하며 원본 사진은 비공개입니다."
            : "권리 동의와 운영자 검토를 거친 에셋만 게시됩니다. 결제 제공사 연결 전에는 구매가 비활성화됩니다."}
        </span>
      </div>
      {error && (
        <div className="notice error" role="alert">
          <AlertCircle size={17} />
          {error}
        </div>
      )}
      {loading ? (
        <div className="project-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="project-skeleton" />
          ))}
        </div>
      ) : listings.length ? (
        <div className="project-grid">
          {listings.map((l) => (
            <Link
              className="project-card listing-card"
              key={l.id}
              href={`/marketplace/${l.id}`}
            >
              <div
                className={`project-cover ${l.category === "scenes" ? "scene" : "object"}`}
              >
                {l.category === "scenes" ? (
                  <Globe2 size={63} strokeWidth={0.8} />
                ) : (
                  <Box size={63} strokeWidth={0.8} />
                )}
                <span className="status-badge">GLB</span>
              </div>
              <div className="project-info">
                <h3>{l.title}</h3>
                <p>{l.category} · 크리에이터 에셋</p>
                <strong className="listing-price">
                  ₩{Number(l.price).toLocaleString()}
                </strong>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span>
            <Store size={31} strokeWidth={1.2} />
          </span>
          <h2>
            {query
              ? "검색된 에셋이 없습니다."
              : "새로운 에셋을 기다리고 있어요."}
          </h2>
          <p>
            {query
              ? "다른 검색어나 카테고리를 선택해 보세요."
              : "검토를 통과한 첫 번째 에셋부터 이곳에 소개됩니다. 예제를 판매 중인 에셋처럼 표시하지 않습니다."}
          </p>
          <Button asChild variant="outline">
            <Link href="/demo">
              3D 예제 살펴보기 <ArrowUpRight size={16} />
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
