"use client";
import Image from "next/image";
import { productPreview } from "@/lib/brand/product-preview";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
export function ResultPreview() {
  const [wire, setWire] = useState(false);
  return (
    <figure className="result-preview">
      <div className="result-view">
        <Image
          src={wire ? productPreview.wire : productPreview.render}
          alt={
            wire
              ? "공개 예시 신발의 삼각형 구조"
              : "질감이 포함된 파란 운동화 공개 3D 예시"
          }
          width={1000}
          height={700}
          priority
          sizes="(max-width:767px) 95vw, 640px"
        />
        <div className="result-switch" aria-label="예시 표시 방식">
          <button aria-pressed={!wire} onClick={() => setWire(false)}>
            질감 보기
          </button>
          <button aria-pressed={wire} onClick={() => setWire(true)}>
            구조 보기
          </button>
        </div>
      </div>
      <figcaption>
        <div>
          <strong>회전하고, 다듬고, 내 작업으로.</strong>
          <span>공개 예시 모델 · 제작 결과 아님</span>
        </div>
        <Link href="/demo" aria-label="공개 예시를 3D로 돌려보기">
          <ArrowUpRight aria-hidden="true" size={21} />
        </Link>
      </figcaption>
    </figure>
  );
}
