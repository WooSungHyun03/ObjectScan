import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="legal-page">
        <h1>무엇을 도와드릴까요?</h1>
        <h2>작업이 오래 걸리나요?</h2>
        <p>
          내 작업에서 진행 상태를 확인하세요. 다른 작업이 진행 중이면 순서대로
          시작합니다. 오류가 표시되면 안내에 따라 사진을 확인하거나 다시 시도할
          수 있습니다.
        </p>
        <h2>결제를 취소하고 싶어요</h2>
        <p>
          결제 내역에서 주문을 확인하고 환불 검토를 요청하세요. 현재 테스트
          결제에는 실제 돈이 청구되지 않습니다. 사용한 크레딧은 내역 확인 후
          처리합니다.
        </p>
        <h2>내 자료와 계정</h2>
        <p>
          사진과 원본 모델은 비공개로 보관됩니다. 개인정보·파일 삭제와 문의는
          계정 설정에서 접수하세요.
        </p>
        <Link href="/settings">계정 설정에서 문의하기 →</Link>
        <p>
          <Link href="/docs">사진 촬영 가이드</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
