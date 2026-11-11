import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowUpRight, Box, Images } from "lucide-react";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="mode-entry">
        <h1>무엇을 3D로 만들까요?</h1>
        <p>원하는 결과를 고르면, 사진 준비부터 차근차근 안내합니다.</p>
        <div className="service-choices">
          <Link className="service-choice" href="/create/object">
            <Box />
            <div>
              <h2>원하는 물체만 3D로 만들기</h2>
              <p>사진에서 만들고 싶은 대상을 선택합니다.</p>
            </div>
            <ArrowUpRight />
          </Link>
          <Link className="service-choice" href="/create/scene">
            <Images />
            <div>
              <h2>공간 전체를 3D로 만들기</h2>
              <p>여러 사진에 담긴 공간과 배치를 함께 준비합니다.</p>
            </div>
            <ArrowUpRight />
          </Link>
        </div>
        <p>
          현재 사진 업로드와 대상 선택을 제공하며, 일반 사진의 3D 생성은 검증
          중입니다.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
