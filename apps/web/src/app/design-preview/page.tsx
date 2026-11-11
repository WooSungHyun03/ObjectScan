import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BrandMascot } from "@/components/brand/mascot";
import { ResultPreview } from "@/features/marketing/result-preview";
export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main id="main" className="public-page">
      <h1>ObjectScan 디자인 프리뷰</h1>
      <p>로컬 개발에서만 표시되는 실제 컴포넌트 상태입니다.</p>
      <section>
        <h2>버튼과 상태</h2>
        <Button>제작 시작</Button> <Button variant="outline">사진 선택</Button>{" "}
        <Button variant="danger">삭제</Button> <Button disabled>처리 중</Button>
        <p role="status" className="notice">
          업로드 내용을 확인해 주세요.
        </p>
        <p className="notice error">파일 형식을 확인해 주세요.</p>
      </section>
      <section>
        <h2>입력</h2>
        <label>
          프로젝트 이름
          <input
            placeholder="새 프로젝트…"
            name="preview-name"
            autoComplete="off"
          />
        </label>
      </section>
      <section style={{ maxWidth: 640 }}>
        <h2>실제 결과 예시 상태</h2>
        <ResultPreview />
      </section>
      <section>
        <h2>안내 마스코트</h2>
        <BrandMascot pose="work" />
      </section>
    </main>
  );
}
