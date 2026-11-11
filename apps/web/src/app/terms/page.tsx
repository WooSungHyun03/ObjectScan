import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="legal-page">
        <h1>이용약관</h1>
        <p>
          ObjectScan은 사진 업로드, 지원되는 방식의 3D 제작, 모델
          보기·편집·다운로드와 에셋 게시 기능을 제공합니다. 제작 가능한 사진
          구성과 차감 크레딧은 요청 전에 확인할 수 있습니다. 현재 결제는 테스트
          환경으로 실제 청구나 판매 대금 송금이 발생하지 않습니다. 실제 서비스
          전환 시 확정된 요금과 거래 조건을 별도로 안내합니다. 타인의 권리를
          침해하는 자료나 개인정보를 무단 업로드하지 마세요.
        </p>
        <p>
          결과물의 이용 범위는 입력 자료와 해당 제작 방식의 라이선스를 따릅니다.
          제3자 소스와 이용 제한은 오픈소스 고지를 확인하세요. 문의와 삭제
          요청은 로그인 후 계정 설정에서 접수합니다.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
