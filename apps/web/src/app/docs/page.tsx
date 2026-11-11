import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="legal-page">
        <h1>사진에서 3D 모델까지</h1>
        <h2>물체를 만들 때</h2>
        <p>
          대상을 고정하고 여러 방향에서 촬영해 주세요. 사진을 올린 뒤 원하는
          물체를 선택하고, 선택 영역을 확인해 승인합니다. 제외한 사진과 실제
          처리에 사용한 사진 수를 구분해 안내합니다.
        </p>
        <h2>공간을 만들 때</h2>
        <p>
          인접한 사진에 같은 영역이 충분히 겹치도록 촬영하세요. 사진 전체를
          사용하며 배경을 지우거나 물체를 선택하지 않습니다. 촬영 위치와 사진
          품질을 먼저 확인합니다.
        </p>
        <h2>촬영 팁</h2>
        <p>
          조명과 초점을 일정하게 유지해 주세요. 반사·투명한 표면과 움직이는
          대상은 제작이 어려울 수 있습니다. 현재 회전판 촬영은 지원하지
          않습니다.
        </p>
        <h2 id="research">학교 교육·연구용 운영</h2>
        <p>
          비상업 학교 프로젝트로 결제·판매·정산을 운영하지 않습니다. 사진
          업로드와 대상 선택·영역 검토를 이용할 수 있으며, 일반 사진의 3D 생성은
          입력 처리와 결과 품질을 검증 중입니다.
        </p>
        <h2 id="readiness">현재 이용 범위</h2>
        <p>
          준비되지 않은 제작 방식은 비활성 상태로 표시합니다. 공개 예시의 3D
          미리보기와 편집을 체험할 수 있습니다. 예시는 사용자 사진으로 생성한
          결과가 아닙니다.
        </p>
        <h2 id="privacy">사진과 결과물 보관</h2>
        <p>
          원본과 결과물은 비공개입니다. 편집은 원본을 덮어쓰지 않고 새 버전으로
          저장합니다. 공개 미리보기는 별도 동의와 검토를 거친 자료에 한합니다.
        </p>
        <p>
          <Link href="/privacy">개인정보 안내</Link> ·{" "}
          <Link href="/legal/opensource">출처 및 오픈소스 고지</Link>
        </p>
        <Link href="/create">제작 시작하기</Link>
      </main>
      <SiteFooter />
    </>
  );
}
