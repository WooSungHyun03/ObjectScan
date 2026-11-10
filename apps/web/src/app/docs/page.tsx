import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="public-section docs-page">
        <p className="eyebrow">OBJECTSCAN GUIDE</p>
        <h1>사진에서 3D 에셋까지</h1>
        <section className="settings-card">
          <h2 id="research">학교 교육·연구용 운영</h2>
          <p>
            ObjectScan은 비상업 학교 프로젝트입니다. 결제·판매·정산을 운영하지
            않습니다. 업로드한 자료와 결과물은 교육·연구 목적으로만 이용하고,
            모델 및 입력 자료의 이용 조건을 함께 준수해 주세요.
          </p>
          <p>
            로그인 후 프로젝트 관리·비공개 업로드·SAM2 객체 선택과 마스크 검토를
            사용할 수 있습니다. Pixal3D 단일·4시점 실험은 실제 GPU 출력 검증을
            통과했으나 일반 입력의 생성 개방은 준비 중입니다. Object-Aware
            Loss와 Gaussian Wrapping은 실제 메시 출력 후 품질이 미달해 생성이
            비활성화되어 있습니다.
          </p>
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
            현재 비상업 교육·연구용 사전 출시입니다. 3D 생성은 모델별 GPU
            추론·입력 경로·시각 품질 검증이 완료될 때까지 비활성화합니다.
            결제·판매는 운영하지 않습니다. 데모 신발은 별도의 CC BY 4.0 샘플이며
            추론 결과가 아닙니다.
          </p>
          <h2 id="models">연구 모델 출처</h2>
          <ul>
            <li>
              <a href="https://github.com/TencentARC/Pixal3D">
                Pixal3D — Tencent ARC
              </a>
            </li>
            <li>
              <a href="https://github.com/WooSungHyun03/object-aware-loss">
                Object-Aware Loss — 연구 코드 및 라이선스
              </a>
            </li>
            <li>
              <a href="https://github.com/diego1401/GaussianWrapping">
                Gaussian Wrapping — Diego 및 연구팀
              </a>
            </li>
            <li>
              <a href="https://github.com/facebookresearch/sam2">
                SAM2 — Meta FAIR
              </a>
            </li>
            <li>
              <a href="https://github.com/microsoft/TRELLIS.2">TRELLIS.2</a>,{" "}
              <a href="https://github.com/microsoft/MoGe">MoGe</a>,{" "}
              <a href="https://github.com/valeoai/NAF">NAF</a>,{" "}
              <a href="https://huggingface.co/briaai/RMBG-2.0">RMBG-2.0</a> 및{" "}
              <a href="https://github.com/facebookresearch/dinov3">DINOv3</a> —
              의존 모델과 가중치 이용 조건
            </li>
          </ul>
          <p>
            Object-Aware Loss와 Gaussian Wrapping은 비상업 연구·평가 조건으로
            사용합니다. 모델과 가중치를 재배포하지 않으며, 각 원본의 라이선스가
            우선합니다. 기술 검증 기록과 고정 버전은{" "}
            <a href="https://github.com/WooSungHyun03/ObjectScan">
              ObjectScan 저장소
            </a>
            에서 확인할 수 있습니다.
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
