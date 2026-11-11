import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="legal-page">
        <h1>오픈소스 및 콘텐츠 고지</h1>
        <p>
          이 페이지는 소프트웨어와 예제의 저작권·이용 조건을 안내합니다.
          ObjectScan은 비상업 교육·연구용 프로젝트이며, 원본 라이선스 조건이
          우선합니다.
        </p>
        <h2>연구 코드 및 모델</h2>
        <ul>
          <li>
            <a href="https://github.com/TencentARC/Pixal3D">
              Pixal3D — Tencent ARC
            </a>
          </li>
          <li>
            <a href="https://github.com/WooSungHyun03/object-aware-loss">
              Object-Aware Loss
            </a>
          </li>
          <li>
            <a href="https://github.com/diego1401/GaussianWrapping">
              Gaussian Wrapping
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
            <a href="https://huggingface.co/briaai/RMBG-2.0">RMBG-2.0</a>,{" "}
            <a href="https://github.com/facebookresearch/dinov3">DINOv3</a>
          </li>
        </ul>
        <p>
          Object-Aware Loss와 Gaussian Wrapping은 비상업 연구·평가 조건으로
          사용합니다. 모델과 가중치를 재배포하지 않습니다.
        </p>
        <h2>3D 편집과 화면 구성</h2>
        <p>
          Three.js, React Three Fiber, Drei, three-mesh-bvh, glTF Transform,
          meshoptimizer 등 각 라이브러리의 라이선스를 준수합니다. 고정 버전과
          원문은 프로젝트 저장소의 의존성 및 라이선스 파일에서 확인할 수
          있습니다.
        </p>
        <p>
          <a href="/legal/third-party-notices.txt">
            사용 중인 소프트웨어의 라이선스 전문
          </a>
        </p>
        <h2>공개 예제</h2>
        <p>
          Materials Variants Shoe © Shopify, Inc. (2021), CC BY 4.0. 생성 결과가
          아닌 공개 예시로 표시하며, 편집한 예제는 변경된 파일로 안내합니다.
        </p>
        <a href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe">
          예제 원본과 라이선스
        </a>
        <h2>마스코트</h2>
        <p>
          프로젝트 사용자가 제공한 마스코트 원본의 크기·포맷만 웹에 맞게
          최적화했습니다. 소프트웨어 라이선스가 마스코트의 재사용 권한을
          부여하지는 않습니다.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
