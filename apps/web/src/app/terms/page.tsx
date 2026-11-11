import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="legal-page">
        <h1>이용약관</h1>
        <p>
          본 서비스는 비상업 학교 교육·연구용 사전 공개 서비스입니다. 현재 제공
          범위는 사진 업로드, 대상 선택, 예시 확인과 지원되는 모델 편집입니다.
          검증되지 않은 생성 방식은 비활성화되어 있습니다. 타인의 권리를
          침해하는 자료나 개인정보를 무단 업로드하지 마세요. 결제·판매·정산은
          운영하지 않습니다.
        </p>
        <p>
          적용 대상: ObjectScan 비상업 학교 프로젝트 · 문의와 삭제 요청은 로그인
          후 계정 설정에서 접수합니다.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
