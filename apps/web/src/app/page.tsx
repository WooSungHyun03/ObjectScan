import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Upload,
  MousePointer2,
  Download,
  Box,
  Images,
} from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { mascots } from "@/lib/brand/mascot-manifest";
export default function Home() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="studio-home">
        <section className="studio-hero" aria-labelledby="hero-title">
          <div className="studio-hero-copy">
            <p className="service-label">사진으로 시작하는 3D 제작</p>
            <h1 id="hero-title">
              사진 속 대상을,
              <br />
              쓰임 있는 3D로.
            </h1>
            <p className="hero-summary">
              소중한 물건부터 머물렀던 공간까지.
              <br />
              사진을 올리고, 원하는 대상을 골라 3D 제작을 준비하세요.
            </p>
            <div className="hero-actions">
              <Button asChild>
                <Link href="/create">
                  내 사진으로 시작하기 <ArrowUpRight size={18} />
                </Link>
              </Button>
              <Link className="text-action" href="/demo">
                결과 예시 살펴보기
              </Link>
            </div>
            <p className="availability-note">
              학교 교육·연구용 사전 공개 · 3D 생성은 검증 중입니다.
            </p>
          </div>
          <div className="mascot-stage">
            <Image
              src={mascots.wave.src}
              width={mascots.wave.width}
              height={mascots.wave.height}
              alt={mascots.wave.alt}
              priority
              sizes="(max-width: 767px) 75vw, 480px"
            />
            <span className="stage-signature">ObjectScan 제작 도우미</span>
          </div>
        </section>
        <section id="product" className="service-section">
          <div className="studio-section-heading">
            <p className="service-label">무엇을 만들고 싶으세요?</p>
            <h2>물건 하나도, 공간 전체도.</h2>
            <p>만들고 싶은 결과에 맞춰 시작하세요.</p>
          </div>
          <div className="service-choices">
            <Link href="/create/object" className="service-choice">
              <div className="choice-mark">
                <Box size={31} />
              </div>
              <div>
                <small>물건 · 소품 · 제품</small>
                <h3>원하는 물체만 3D로 만들기</h3>
                <p>배경에서 대상을 골라, 하나의 모델로 준비합니다.</p>
              </div>
              <ArrowUpRight aria-hidden="true" />
            </Link>
            <Link href="/create/scene" className="service-choice">
              <div className="choice-mark scene">
                <Images size={31} />
              </div>
              <div>
                <small>방 · 전시 · 건축 공간</small>
                <h3>공간 전체를 3D로 만들기</h3>
                <p>여러 방향의 사진으로 공간과 배치를 함께 담습니다.</p>
              </div>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </section>
        <section className="example-section">
          <div className="example-photo">
            <Image
              src="/demo/shoe-photo.webp"
              width={520}
              height={370}
              alt="3D 예시로 제공되는 운동화 사진"
            />
            <span>공개 예시 이미지</span>
          </div>
          <div className="example-copy">
            <p className="service-label">완성 후에도, 내 작업답게</p>
            <h2>
              돌려 보고.
              <br />
              다듬고. 내려받고.
            </h2>
            <p>
              입체적으로 확인하고, 위치와 크기를 조정한 뒤 새 버전으로
              보관하세요. 원본은 그대로 남습니다.
            </p>
            <Button asChild variant="outline">
              <Link href="/demo/edit">
                예시 모델 편집해 보기 <ArrowUpRight size={17} />
              </Link>
            </Button>
            <p className="example-license">
              이 모델은 Shopify의 공개 예시입니다. 이 서비스에서 생성한 결과가
              아닙니다. <Link href="/legal/opensource">출처 보기</Link>
            </p>
          </div>
        </section>
        <section className="service-section studio-process-section">
          <div className="studio-section-heading">
            <p className="service-label">복잡한 설정 없이</p>
            <h2>사진에서 시작하는 세 단계.</h2>
          </div>
          <ol className="studio-process-list">
            {[
              {
                icon: Upload,
                title: "사진을 올려주세요",
                text: "대상이 잘 보이는 사진을 올리세요. 원본은 비공개로 보관합니다.",
              },
              {
                icon: MousePointer2,
                title: "만들 대상을 확인하세요",
                text: "물체는 원하는 부분을 고르고, 공간은 사진의 겹침을 확인하세요.",
              },
              {
                icon: Download,
                title: "모델을 확인하고 다듬으세요",
                text: "지원되는 생성 경로가 열리면 결과를 편집하고 내려받을 수 있습니다.",
              },
            ].map((s, i) => (
              <li key={s.title}>
                <span className="step-number">{i + 1}</span>
                <s.icon size={24} />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="school-section">
          <div>
            <p className="service-label">부담 없이 알아보세요</p>
            <h2>배우고, 실험하는 3D 작업실.</h2>
            <p>
              ObjectScan은 비상업 학교 프로젝트입니다. 결제·에셋 판매를 운영하지
              않으며, 현재 사진 업로드와 대상 선택을 이용할 수 있습니다.
            </p>
            <Link className="text-action" href="/pricing">
              지원 범위와 이용 안내 <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="market-intro">
            <h3>다른 작업도 둘러보세요</h3>
            <p>공개를 승인한 3D 에셋의 미리보기를 확인하는 공간입니다.</p>
            <Link className="text-action" href="/marketplace">
              3D 에셋 둘러보기 <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <section className="faq-section">
          <div className="studio-section-heading">
            <h2>시작 전, 궁금한 점.</h2>
          </div>
          {[
            {
              q: "어떤 사진을 준비하면 되나요?",
              a: "대상이 흔들리지 않고 선명하게 나온 사진을 준비하세요. 여러 장을 촬영할 때는 조명과 초점을 일정하게 유지하고, 인접한 사진에 같은 부분이 충분히 보이게 해주세요.",
            },
            {
              q: "지금 3D 모델을 바로 생성할 수 있나요?",
              a: "현재 사진 업로드·대상 선택·영역 검토를 사용할 수 있습니다. 일반 사진의 3D 생성은 입력 처리와 결과 품질을 검증 중이며, 준비되지 않은 기능은 활성화하지 않습니다.",
            },
            {
              q: "올린 사진은 다른 사람에게 보이나요?",
              a: "프로젝트의 사진과 결과물은 비공개입니다. 에셋 공개는 별도 동의와 검토를 거치며 원본 사진을 공개하지 않습니다.",
            },
            {
              q: "편집하면 원래 모델이 바뀌나요?",
              a: "원본 모델을 덮어쓰지 않습니다. 편집 결과를 새 버전으로 저장하고, 이전 버전을 다시 확인할 수 있습니다. 공개 예시는 내려받기 체험만 제공됩니다.",
            },
          ].map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
        <section className="closing-section">
          <h2>첫 장의 사진부터 시작해 보세요.</h2>
          <Button asChild>
            <Link href="/create">
              3D 제작 준비하기 <ArrowUpRight size={18} />
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
