import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="legal-page">
        <h1>개인정보 처리 안내</h1>
        <p>
          이메일과 표시 이름은 계정 관리에, 업로드한 사진과 모델은 사용자의 제작
          작업에 이용합니다. 원본과 결과물은 비공개 저장소에 보관하고 권한을
          확인한 짧은 만료 주소로 제공합니다. 계정 화면에서 데이터 삭제 검토를
          요청할 수 있습니다. 확인된 원본과 편집 버전은 자동 삭제되지 않으며,
          운영자의 삭제 검토와 권한 정리가 필요합니다. 다른 사람의 개인정보가
          포함된 자료는 동의 없이 업로드하지 마세요.
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
