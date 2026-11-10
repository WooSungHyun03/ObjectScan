import Link from "next/link";
import { educationMode } from "@/lib/project-purpose";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  ImagePlus,
  ScanLine,
  Download,
  Layers3,
  MousePointer2,
  ShieldCheck,
  Check,
  Play,
  Globe2,
  MoveUpRight,
} from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Viewer } from "@/components/viewer";
export default function Landing() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="landing">
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="outline-label">
              <span />
              사진 기반 텍스처 메시 워크스페이스
            </span>
            <h1>
              사진을 3D로.
              <br />
              새로운 차원을 만드세요.
            </h1>
            <p>
              하나의 사물부터 그 사물이 놓인 공간까지.
              <br />
              사진을 담고, 복원할 대상을 선택하고,
              <br className="mobile-break" /> 텍스처 3D 메시로 완성하세요.
            </p>
            <div className="hero-actions">
              <Button asChild>
                <Link href="/reconstruct/new?mode=object">
                  무료로 시작하기 <ArrowRight size={17} />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/demo">
                  <Play size={15} />
                  3D 미리보기
                </Link>
              </Button>
            </div>
            <div className="hero-assurances">
              <span>
                <ShieldCheck size={14} />
                비공개 프로젝트
              </span>
              <span>
                <Box size={14} />
                텍스처 GLB
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="photo-stack" aria-hidden="true">
              <div />
              <div />
              <div>
                <div className="shoe-photo" />
                <span>공개 예제 이미지</span>
              </div>
            </div>
            <Viewer hero showControls={false} />
            <span className="visual-input">
              <ImagePlus size={19} />
              <span>
                사진을 입력하고<small>원본 이미지 1–200장</small>
              </span>
            </span>
            <span className="visual-output">
              <Box size={21} />
              <span>
                텍스처 메시로<small>Object / Full Scene</small>
              </span>
            </span>
            <Link className="demo-credit" href="/docs#credits">
              예제 © Shopify · CC BY 4.0
            </Link>
          </div>
        </section>
        <section id="product" className="mode-cards">
          <Link
            href="/reconstruct/new?mode=object"
            className="mode-card object"
          >
            <span className="mode-icon">
              <Box size={34} strokeWidth={1.3} />
            </span>
            <span>
              <small>Object Mesh</small>
              <h2>객체만 3D로 복원</h2>
              <p>제품, 소품. 원하는 사물 하나에 집중하세요.</p>
            </span>
            <ArrowUpRight size={22} />
          </Link>
          <Link href="/reconstruct/new?mode=scene" className="mode-card scene">
            <span className="mode-icon">
              <Globe2 size={34} strokeWidth={1.3} />
            </span>
            <span>
              <small>Full Scene Mesh</small>
              <h2>장면 전체를 3D로 복원</h2>
              <p>공간의 형태와 질감을, 한 번에 담아내세요.</p>
            </span>
            <ArrowUpRight size={22} />
          </Link>
        </section>
        <section className="process-section">
          <div className="section-intro">
            <span className="section-kicker">사진에서 입체까지</span>
            <h2>
              복잡한 과정은 뒤로.
              <br />
              창작에 집중하세요.
            </h2>
          </div>
          <ol className="process-list">
            {[
              {
                icon: ImagePlus,
                title: "사진 업로드",
                text: "한 장부터 시작하는 사물 복원. 장면은 겹치는 여러 시점으로.",
              },
              {
                icon: ScanLine,
                title: "복원할 대상 선택",
                text: "사물은 SAM2로 선택하고, 장면은 배경까지 그대로 담으세요.",
              },
              {
                icon: Download,
                title: "3D 메시 확인",
                text: "실제 결과를 회전해 보고, 검증된 텍스처 GLB를 다운로드하세요.",
              },
            ].map((s, i) => (
              <li key={s.title}>
                <span className="process-icon">
                  <s.icon size={25} />
                </span>
                <div>
                  <h3>
                    <span>{i + 1}.</span> {s.title}
                  </h3>
                  <p>{s.text}</p>
                </div>
                {i < 2 && <ArrowRight className="process-arrow" size={18} />}
              </li>
            ))}
          </ol>
        </section>
        <section className="technology-section">
          <div className="section-intro">
            <span className="section-kicker">대상에 맞는 복원 방식</span>
            <h2>
              하나의 워크스페이스.
              <br />세 가지 가능성.
            </h2>
            <p>
              입력과 복원 목적에 맞는 모델을 연결합니다. 검증되지 않은 모델은
              유료 제작에 사용하지 않습니다.
            </p>
          </div>
          <div className="technology-grid">
            {[
              {
                name: "SAM2",
                tag: "사물 선택",
                icon: MousePointer2,
                text: "클릭이나 박스로 대상을 지정하고, 사진별 분리 마스크를 직접 검토합니다.",
              },
              {
                name: "Pixal3D",
                tag: "객체 · 1–20장",
                icon: Box,
                text: "한 장은 단일 시점으로, 여러 장은 검증된 카메라와 대표 시점으로.",
              },
              {
                name: "Object-Aware Loss",
                tag: "객체 · 21–200장",
                icon: Layers3,
                text: "물체 중심 학습과 메시 추출, 별도의 UV 텍스처 베이킹을 연결합니다.",
              },
              {
                name: "Gaussian Wrapping",
                tag: "장면 전체",
                icon: Globe2,
                text: "배경을 제거하지 않고, COLMAP으로 정렬된 장면 전체를 복원합니다.",
              },
            ].map((t) => (
              <article className="technology-card" key={t.name}>
                <div className="technology-graphic">
                  <t.icon size={44} strokeWidth={1} />
                  <span />
                  <span />
                </div>
                <span className="technology-tag">{t.tag}</span>
                <h3>{t.name}</h3>
                <p>{t.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="market-invitation">
          <div>
            <span className="section-kicker">3D Asset Marketplace</span>
            <h2>
              직접 만든 사물,
              <br className="mobile-break" /> 다음 창작의 재료로.
            </h2>
            <p>
              {educationMode()
                ? "교육·연구 목적으로 3D 에셋을 살펴보고,"
                : "권리를 보유한 에셋만 직접 게시하고,"}
              <br />
              새로운 창작에 필요한 모델을 찾아보세요.
            </p>
            <Button asChild>
              <Link href="/marketplace">
                에셋 마켓 둘러보기 <ArrowUpRight size={16} />
              </Link>
            </Button>
          </div>
          <div className="market-objects" aria-hidden="true">
            <span className="specimen specimen-chair">
              <Box size={66} strokeWidth={0.8} />
              <small>Objects</small>
            </span>
            <span className="specimen specimen-scene">
              <Globe2 size={72} strokeWidth={0.8} />
              <small>Spaces</small>
            </span>
            <span className="specimen specimen-layers">
              <Layers3 size={65} strokeWidth={0.8} />
              <small>Textures</small>
            </span>
          </div>
        </section>
        <section className="pricing-intro">
          <div className="section-intro">
            <span className="section-kicker">
              {educationMode() ? "학교 프로젝트" : "명확한 제작 비용"}
            </span>
            <h2>
              {educationMode() ? "사진으로 실험하고," : "사용한 만큼,"}
              <br />
              {educationMode() ? "3D로 배웁니다." : "확인한 금액으로."}
            </h2>
          </div>
          <div className="pricing-explanation">
            <div>
              <Check size={18} />
              <p>
                {educationMode() ? (
                  "비상업 교육·연구용으로 운영하며 결제와 에셋 판매를 제공하지 않습니다."
                ) : (
                  <>
                    업로드한 사진 수를 기준으로 <strong>20장 단위</strong> 요금
                    구간이 적용됩니다.
                  </>
                )}
              </p>
            </div>
            <div>
              <Check size={18} />
              <p>
                {educationMode() ? (
                  "객체와 장면 전체를 별도의 워크플로로 다루며, 실제 검증한 기능부터 제공합니다."
                ) : (
                  <>
                    객체와 장면 전체의 요금표를 분리하고,{" "}
                    <strong>서버 견적을 확인한 뒤</strong> 결제합니다.
                  </>
                )}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/pricing">
                {educationMode() ? "이용 범위 확인" : "전체 요금 구간 확인"}{" "}
                <MoveUpRight size={16} />
              </Link>
            </Button>
          </div>
        </section>
        <div className="release-note">
          <span className="status-dot" />
          <p>
            {educationMode()
              ? "학교 교육·연구용 사전 출시입니다. 업로드·SAM2 마스크 검토를 제공하며 3D 생성의 일반 공개는 검증 중입니다."
              : "현재 사전 출시 단계입니다. GPU 실측 검증과 결제 제공사 연결을 마친 기능부터 열립니다."}
          </p>
          <Link href="/docs#readiness">
            서비스 상태 <ArrowUpRight size={13} />
          </Link>
        </div>
      </main>
      <footer className="public-footer">
        <Brand />
        <nav>
          <Link href="/docs">문서 및 촬영 가이드</Link>
          <Link href="/docs#privacy">데이터·저작권 안내</Link>
          <Link href="/docs#credits">예제 출처</Link>
        </nav>
        <span>© {new Date().getFullYear()} ObjectScan</span>
      </footer>
    </>
  );
}
