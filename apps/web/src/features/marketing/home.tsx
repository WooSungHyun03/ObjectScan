import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Images,
  ShieldCheck,
  Upload,
  MousePointer2,
  Download,
} from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { BrandMascot } from "@/components/brand/mascot";
import { ResultPreview } from "./result-preview";
const modes = [
  {
    href: "/create/object",
    Icon: Box,
    title: "원하는 물체만 3D로 만들기",
    text: "소품, 제품, 나만의 수집품. 사진 속에서 만들 대상을 골라주세요.",
    tag: "물체 제작",
  },
  {
    href: "/create/scene",
    Icon: Images,
    title: "공간 전체를 3D로 만들기",
    text: "방과 작업실, 머물렀던 장소. 여러 시점의 사진으로 공간을 준비하세요.",
    tag: "공간 제작",
  },
];
export function Home() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="premium-home">
        <section className="premium-hero" aria-labelledby="hero-title">
          <div className="premium-hero-copy">
            <p className="eyebrow">사진에서 시작하는 나의 3D</p>
            <h1 id="hero-title">
              사진 속 대상을,
              <br />
              <span>입체적인 작업으로.</span>
            </h1>
            <p className="lead">
              물체 하나부터 공간 전체까지.
              <br />
              사진을 올리고 대상을 골라, 다음 창작을 준비하세요.
            </p>
            <div className="hero-actions">
              <Button asChild>
                <Link href="/create">
                  3D 모델 만들기 <ArrowUpRight aria-hidden="true" size={18} />
                </Link>
              </Button>
              <Link className="secondary-action" href="#how-it-works">
                작동 방식 보기 <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </div>
          <div className="hero-product">
            <ResultPreview />
            <BrandMascot className="hero-guide" decorative />
          </div>
        </section>
        <aside className="release-note">
          <ShieldCheck aria-hidden="true" size={18} />
          <p>
            <strong>내 사진은 기본 비공개로.</strong> 지금은 사진 업로드·대상
            선택과 예시 모델 편집을 이용할 수 있습니다. 일반 사진의 3D 생성은
            검증 중입니다.
          </p>
          <Link href="/docs#research">제공 범위 보기</Link>
        </aside>
        <section id="product" className="home-section">
          <div className="home-section-title">
            <h2>만들고 싶은 것부터 고르세요.</h2>
            <p>필요한 과정만, 만들고 싶은 결과에 맞춰 안내합니다.</p>
          </div>
          <div className="production-choices">
            {modes.map(({ href, Icon, title, text, tag }) => (
              <Link href={href} className="production-choice" key={href}>
                <div className="production-choice-top">
                  <Icon aria-hidden="true" size={28} strokeWidth={1.5} />
                  <span>{tag}</span>
                  <ArrowUpRight aria-hidden="true" size={21} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="choice-bottom">
                  사진 준비하기 <ArrowRight aria-hidden="true" size={17} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section id="how-it-works" className="home-section workflow-section">
          <div className="workflow-intro">
            <h2>
              복잡한 도구보다,
              <br />
              자연스러운 순서.
            </h2>
            <p>
              사진에서 결과 확인까지. 각 단계에서 무엇을 해야 하는지
              알려드립니다.
            </p>
            <Link className="secondary-action" href="/docs">
              사진 촬영 가이드 <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <ol className="workflow-list">
            {[
              {
                Icon: Upload,
                title: "사진을 올려주세요",
                text: "대상이 잘 보이는 여러 시점의 사진을 준비하세요.",
              },
              {
                Icon: MousePointer2,
                title: "만들 대상을 확인하세요",
                text: "물체를 고르거나 공간 전체를 선택하고, 사용할 사진을 검토하세요.",
              },
              {
                Icon: Download,
                title: "모델을 확인하고 다듬으세요",
                text: "완성된 모델은 돌려 보고, 간단히 편집해 새 버전으로 보관하세요.",
              },
            ].map(({ Icon, title, text }) => (
              <li key={title}>
                <Icon aria-hidden="true" size={22} />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="home-section discovery-section">
          <div>
            <p className="eyebrow">다음 작업을 위한 발견</p>
            <h2>
              만든 뒤에도,
              <br />
              창작은 이어지니까.
            </h2>
            <p>
              예시 모델로 편집을 먼저 체험하거나, 공개가 승인된 에셋을
              둘러보세요.
            </p>
          </div>
          <div className="discovery-actions">
            <Link href="/demo/edit">
              <span>직접 만져보는 3D</span>
              <h3>예시 모델 편집하기</h3>
              <p>이동, 회전, 크기 조절부터 GLB 내보내기까지.</p>
              <ArrowUpRight aria-hidden="true" />
            </Link>
            <Link href="/marketplace">
              <span>3D 에셋 마켓</span>
              <h3>다른 창작의 재료 찾기</h3>
              <p>
                공개 승인된 미리보기만 소개합니다. 판매·구매는 운영하지
                않습니다.
              </p>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </section>
        <section className="home-section faq-section">
          <h2>시작 전, 궁금한 점.</h2>
          <div>
            {[
              {
                q: "어떤 사진을 준비하면 되나요?",
                a: "대상이 선명하고 여러 방향에서 촬영된 사진이 좋습니다. 한 장부터 업로드할 수 있으며, 제작 조건은 선택한 방식에 따라 안내합니다.",
              },
              {
                q: "지금 바로 3D 결과를 만들 수 있나요?",
                a: "일반 사진의 3D 생성은 검증 중입니다. 현재 사진 업로드와 대상 선택·검수, 공개 예시의 3D 보기·편집·다운로드를 이용할 수 있습니다.",
              },
              {
                q: "원본 사진과 편집본은 어떻게 보관되나요?",
                a: "원본은 비공개로 보관합니다. 편집본은 원본을 덮어쓰지 않고 새 버전으로 저장합니다.",
              },
              {
                q: "이용 요금이 있나요?",
                a: "학교 교육·연구용 비상업 서비스로 운영하며 결제와 에셋 판매는 비활성 상태입니다. 임의의 금액을 청구하지 않습니다.",
              },
            ].map(({ q, a }) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="home-final">
          <BrandMascot pose="work" decorative />
          <div>
            <h2>첫 장의 사진부터 시작해 보세요.</h2>
            <p>내 작업을 위한 작은 3D 작업실.</p>
          </div>
          <Button asChild>
            <Link href="/create">
              3D 모델 만들기 <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
