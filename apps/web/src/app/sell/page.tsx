import Link from "next/link";
import { ProtectedWorkspace } from "@/components/protected-workspace";
import { AssetLibrary } from "@/components/asset-library";
export const dynamic = "force-dynamic";
export default function Page() {
  return (
    <ProtectedWorkspace next="/sell">
      <section>
        <h1>내 모델을 에셋으로</h1>
        <p>
          소유한 모델에서 게시를 신청하세요. 대표 미리보기와 가격, 사용 조건을
          확인한 뒤 검토를 거쳐 공개됩니다.
        </p>
        <p>
          직접 만든 파일과 판매 권한을 보유한 파일만 게시할 수 있습니다.{" "}
          <Link href="/terms">게시·거래 이용약관</Link>
        </p>
      </section>
      <AssetLibrary />
    </ProtectedWorkspace>
  );
}
