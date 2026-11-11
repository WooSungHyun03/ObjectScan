"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  Box,
  Images,
  ArrowUpRight,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMascot } from "@/components/brand/mascot";
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
export function CreateEntry() {
  const [mode, M] = useState<"object" | "scene">("object"),
    [files, F] = useState<File[]>([]),
    [error, E] = useState("");
  const input = useRef<HTMLInputElement>(null),
    router = useRouter();
  function choose(list: FileList | null) {
    if (!list) return;
    const v = Array.from(list);
    if (
      v.length > 200 ||
      v.some((f) => !allowed.has(f.type) || f.size > 20 * 1024 * 1024)
    ) {
      E("JPG·PNG·WebP 사진을 한 장당 20MB 이하, 최대 200장까지 선택해 주세요.");
      return;
    }
    F(v);
    E("");
  }
  async function next() {
    if (files.length) {
      const { putDraft } = await import("./upload-draft");
      putDraft(files);
    }
    router.push(`/create/${mode}`);
  }
  return (
    <main id="main" className="create-entry">
      <header>
        <p className="eyebrow">나의 3D 작업실</p>
        <h1>무엇을 3D로 만들까요?</h1>
        <p>사진부터 고르고, 원하는 제작 방식을 선택하세요.</p>
      </header>
      <div className="create-layout">
        <section className="create-main" aria-label="제작 준비">
          <div className="create-mode-options" aria-label="제작 방식">
            {(
              [
                {
                  id: "object",
                  Icon: Box,
                  title: "객체만 만들기",
                  text: "사진 속 원하는 물체",
                },
                {
                  id: "scene",
                  Icon: Images,
                  title: "공간 전체 만들기",
                  text: "장소의 구조와 배치",
                },
              ] as const
            ).map(({ id, Icon, title, text }) => (
              <button key={id} aria-pressed={mode === id} onClick={() => M(id)}>
                <Icon aria-hidden="true" />
                <strong>{title}</strong>
                <span>{text}</span>
                {mode === id && <Check aria-hidden="true" size={17} />}
              </button>
            ))}
          </div>
          <div
            className="entry-drop"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              choose(e.dataTransfer.files);
            }}
          >
            <Upload aria-hidden="true" size={32} />
            <h2>
              {files.length
                ? `사진 ${files.length}장을 선택했어요`
                : "만들고 싶은 대상의 사진을 올려주세요"}
            </h2>
            <p>
              {files.length
                ? "로그인 후 사진을 확인하고 업로드하세요. 새로고침하면 선택이 초기화됩니다."
                : "JPG, PNG, WebP · 한 장당 20MB 이하"}
            </p>
            <input
              ref={input}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => choose(e.target.files)}
              aria-label="제작할 사진 선택"
              className="sr-only"
            />
            <Button variant="outline" onClick={() => input.current?.click()}>
              {files.length ? "사진 다시 고르기" : "사진 선택하기"}
            </Button>
            <small>
              여기에 사진을 끌어 놓아도 됩니다. 아직 서버에 업로드하지 않습니다.
            </small>
          </div>
          {files.length > 0 && (
            <ul className="selected-file-list" aria-label="선택한 사진">
              {files.slice(0, 4).map((f, i) => (
                <li key={`${i}-${f.name}`}>{f.name}</li>
              ))}
              {files.length > 4 && <li>외 {files.length - 4}장</li>}
            </ul>
          )}
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <Button className="entry-continue" onClick={() => void next()}>
            {files.length
              ? "선택한 사진으로 계속하기"
              : "사진 없이 제작 과정 살펴보기"}
            <ArrowUpRight aria-hidden="true" size={18} />
          </Button>
          <p className="entry-privacy">
            <ShieldCheck aria-hidden="true" size={16} />
            로그인 후 비공개 프로젝트로 저장합니다.
          </p>
        </section>
        <aside className="create-guide">
          <BrandMascot pose="work" decorative />
          <h2>좋은 사진이 좋은 시작입니다.</h2>
          <ul>
            <li>대상을 화면 중앙에 선명하게 담아주세요.</li>
            <li>같은 대상을 여러 방향에서 촬영하세요.</li>
            <li>흔들리거나 초점이 맞지 않는 사진은 제외하세요.</li>
          </ul>
          <p>
            일반 사진의 3D 생성은 검증 중입니다. 사진 업로드와 대상 선택을 먼저
            이용해 보세요.
          </p>
          <Link href="/docs">
            촬영 가이드 자세히 보기{" "}
            <ArrowUpRight aria-hidden="true" size={15} />
          </Link>
        </aside>
      </div>
    </main>
  );
}
