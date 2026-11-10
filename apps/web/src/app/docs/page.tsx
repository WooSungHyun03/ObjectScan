import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main className="public-section docs-page">
        <p className="eyebrow">OBJECTSCAN GUIDE</p>
        <h1>사진에서 3D 에셋까지</h1>
        <section className="settings-card">
          <h2>Object Mesh</h2>
          <p>
            대상을 여러 방향에서 촬영하고, 객체를 선택한 뒤 SAM2 마스크를
            검토하세요. 1–20장은 Pixal3D, 21장 이상은 Object-Aware Loss 경로로
            처리합니다. 다중 시점은 실제 카메라 정합이 필요합니다.
          </p>
          <h2>Full Scene Mesh</h2>
          <p>
            공간 전체를 겹치도록 촬영하세요. 20장 이상을 권장하며 객체 마스크를
            적용하지 않습니다. COLMAP 정합 후 Gaussian Wrapping과 텍스처
            베이크를 거칩니다.
          </p>
          <h2>촬영 가이드</h2>
          <p>
            조명과 초점을 일정하게 유지하고, 인접 사진에 충분한 공통 영역을
            남기세요. 반사·투명 표면과 움직이는 물체는 복원이 어려울 수
            있습니다. 현재 회전판 촬영은 지원하지 않습니다.
          </p>
          <h2 id="privacy">개인정보와 권리</h2>
          <p>
            원본과 결과물은 비공개입니다. 마켓에는 권리 동의를 받은 에셋의 경량
            미리보기만 공개하며 원본 다운로드는 소유자와 구매자에게 허용됩니다.
          </p>
          <h2 id="readiness">현재 출시 상태</h2>
          <p>
            모델별 실제 GPU 추론 검증과 결제 제공사 연결이 완료될 때까지 유료
            생성을 차단합니다. 데모 신발은 별도의 CC BY 4.0 샘플이며 추론 결과가
            아닙니다.
          </p>
          <h2 id="credits">공개 예제 출처</h2>
          <p>
            Materials Variants Shoe © Shopify, Inc. (2021), CC BY 4.0. Khronos
            glTF Sample Assets에서 제공한 3D 모델과 이미지를 사용합니다.
          </p>
          <a href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe">
            원본 및 라이선스 확인
          </a>
          <br />
          <Link href="/reconstruct/new">새 프로젝트 만들기 →</Link>
        </section>
      </main>
    </>
  );
}
