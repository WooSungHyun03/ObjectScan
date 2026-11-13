"use client";
import { educationMode } from "@/lib/project-purpose";
import { customerError } from "@/lib/customer-copy";
import Link from "next/link";
import Image from "next/image";
import { productPreview } from "@/lib/brand/product-preview";
import { AssetCard, type Listing } from "@/features/marketplace/asset-card";
export type { Listing } from "@/features/marketplace/asset-card";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  applyLocalFilters,
  defaults,
  filtersQuery,
  hasLocalFilters,
  priceBands,
  readFilters,
  type MarketFilters,
} from "@/features/marketplace/filters";
import { licenseLabels } from "@/features/marketplace/presentation";
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
export function Marketplace() {
  const search = useSearchParams(),
    [f, setF] = useState<MarketFilters>(() => readFilters(search)),
    [listings, setListings] = useState<Listing[]>([]),
    [attempt, setAttempt] = useState(0),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const { q: query, category, sort } = f,
    educational = educationMode(),
    shown = applyLocalFilters(listings, f);
  // replaceState keeps one history entry, so Back from a detail page restores this URL.
  function update(next: Partial<MarketFilters>) {
    const value = { ...f, ...next };
    setF(value);
    window.history.replaceState(
      null,
      "",
      `${location.pathname}${filtersQuery(value)}`,
    );
  }
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
            if (alive && e.name !== "AbortError")
              setError(customerError(undefined, e.message));
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
  }, [query, category, sort, attempt]);
  return (
    <>
      <div className="market-hero">
        <div>
          <span className="section-kicker">3D 에셋 마켓</span>
          <h1>
            다음 작업에 어울리는
            <br />
            3D를 찾아보세요.
          </h1>
          <p>사물부터 공간까지. 크리에이터가 만든 3D 에셋을 만나보세요.</p>
        </div>
        <div className="market-hero-art" aria-hidden="true">
          <Box size={90} strokeWidth={0.7} />
          <Globe2 size={100} strokeWidth={0.7} />
        </div>
      </div>
      <div className="market-controls">
        <label className="market-search">
          <Search size={18} />
          <input
            value={query}
            placeholder="에셋 검색"
            aria-label="에셋 검색"
            onChange={(e) => update({ q: e.target.value })}
          />
        </label>
        <label className="sort-control">
          <span className="sr-only">정렬</span>
          <select
            aria-label="정렬"
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
          >
            <option value="recent">최신 등록순</option>
            <option value="price">낮은 가격순</option>
          </select>
        </label>
        <label className="sort-control">
          <span className="sr-only">이용 조건</span>
          <select
            aria-label="이용 조건"
            value={f.license}
            onChange={(e) => update({ license: e.target.value })}
          >
            <option value="all">모든 이용 조건</option>
            {Object.entries(licenseLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        {!educational && (
          <label className="sort-control">
            <span className="sr-only">가격</span>
            <select
              aria-label="가격"
              value={f.price}
              onChange={(e) => update({ price: e.target.value })}
            >
              {Object.entries(priceBands).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        )}
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
            onClick={() => update({ category: c.id })}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="workspace-notice">
        <ShieldCheck size={16} />
        <span>
          권리 확인과 게시 검토를 거친 에셋만 소개합니다. 원본 파일은 구매
          권한을 확인한 뒤 다운로드할 수 있습니다.
        </span>
      </div>
      {!query && category === "all" && !hasLocalFilters(f) && (
        <section className="market-sample" aria-label="판매하지 않는 공개 예시">
          <Image
            src={productPreview.render}
            alt="질감이 포함된 운동화 공개 예시 모델"
            width={1000}
            height={700}
            sizes="(max-width:767px) 90vw, 480px"
          />
          <div>
            <span className="section-kicker">예시 먼저 둘러보기</span>
            <h2>돌려보고, 직접 다듬어보세요.</h2>
            <p>
              공개된 예시 모델로 보기와 편집을 먼저 체험하세요. 판매 중인
              에셋이나 실제 제작 결과가 아닙니다.
            </p>
            <Button asChild variant="outline">
              <Link href="/demo/edit">
                예시 모델 편집하기 <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            </Button>
          </div>
        </section>
      )}
      {hasLocalFilters(f) && !loading && !error && (
        <p className="muted my-3" role="status">
          불러온 에셋 {listings.length}개 중 {shown.length}개를 표시합니다.
        </p>
      )}
      {error ? (
        <div className="empty-state">
          <div className="notice error" role="alert">
            <AlertCircle size={17} />
            {error}
          </div>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => setAttempt((a) => a + 1)}
          >
            {loading ? "다시 불러오는 중…" : "다시 불러오기"}
          </Button>
        </div>
      ) : loading ? (
        <div className="project-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="project-skeleton" />
          ))}
        </div>
      ) : shown.length ? (
        <div className="project-grid">
          {shown.map((l) => (
            <AssetCard key={l.id} listing={l} educational={educational} />
          ))}
        </div>
      ) : listings.length || category !== "all" ? (
        <div className="empty-state">
          <span>
            <Store size={31} strokeWidth={1.2} />
          </span>
          <h2>조건에 맞는 에셋이 없습니다.</h2>
          <p>검색어는 그대로 두고 카테고리와 필터를 초기화할 수 있어요.</p>
          <Button
            variant="outline"
            onClick={() => update({ ...defaults, q: query, sort })}
          >
            조건 초기화
          </Button>
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
