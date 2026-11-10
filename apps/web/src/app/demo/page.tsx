import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { Viewer } from "@/components/viewer";
import { Button } from "@/components/ui/button";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="public-page">
        <div className="public-page-heading">
          <span className="section-kicker">3D 스튜디오 미리보기</span>
          <h1>회전하고, 질감을 살펴보세요.</h1>
          <p>
            이 모델은 Shopify가 공개한 예제입니다. ObjectScan의 GPU 생성 결과가
            아닙니다.
          </p>
        </div>
        <Viewer />
        <div className="demo-footer">
          <p>
            Materials Variants Shoe © 2021 Shopify ·{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
          </p>
          <Button asChild>
            <Link href="/reconstruct/new">내 사진으로 시작하기</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
