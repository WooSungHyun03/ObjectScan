"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Box,
  Globe2,
  ArrowUpRight,
  FolderOpen,
  ImagePlus,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import type { Project } from "@objectscan/shared";
import { api, date, stateLabels } from "@/lib/client-api";
import { Button } from "./ui/button";
import { PageTitle } from "./page-title";
export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [search, setSearch] = useState("");
  useEffect(() => {
    let alive = true;
    api<Project[]>("projects")
      .then((p) => {
        if (alive) setProjects(p);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  const shown = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="무엇을 3D로 만들어볼까요?"
        description="사물 하나부터 공간 전체까지. 사진에서 새로운 가능성을 발견하세요."
      >
        <Button asChild>
          <Link href="/reconstruct/new">
            <Plus size={17} />새 프로젝트
          </Link>
        </Button>
      </PageTitle>
      <div className="workspace-mode-grid">
        <Link
          href="/reconstruct/new?mode=object"
          className="workspace-mode-card"
        >
          <span>
            <Box size={36} strokeWidth={1.2} />
          </span>
          <div>
            <small>Object Mesh</small>
            <h2>객체만 3D로 복원</h2>
            <p>복잡한 배경 속 원하는 사물만 선택하세요.</p>
          </div>
          <ArrowUpRight size={21} />
        </Link>
        <Link
          href="/reconstruct/new?mode=scene"
          className="workspace-mode-card"
        >
          <span>
            <Globe2 size={36} strokeWidth={1.2} />
          </span>
          <div>
            <small>Full Scene Mesh</small>
            <h2>장면 전체를 3D로 복원</h2>
            <p>공간의 구조와 질감을 한 번에 담으세요.</p>
          </div>
          <ArrowUpRight size={21} />
        </Link>
      </div>
      <div className="workspace-notice">
        <ShieldCheck size={17} />
        <span>모든 프로젝트와 원본 사진은 기본 비공개입니다.</span>
        <Link href="/docs#privacy">
          데이터 안내 <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="section-heading">
        <h2>
          내 프로젝트 <span className="count-badge">{projects.length}</span>
        </h2>
        <label className="project-search">
          <span className="sr-only">프로젝트 검색</span>
          <input
            placeholder="프로젝트 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {error && (
        <div className="notice error" role="alert">
          <AlertCircle size={17} />
          {error}
        </div>
      )}
      {loading ? (
        <div className="project-grid">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="project-skeleton"
              aria-label="프로젝트 불러오는 중"
            />
          ))}
        </div>
      ) : shown.length ? (
        <div className="project-grid">
          {shown.map((p) => (
            <Link
              href={`/projects/${p.id}`}
              className="project-card"
              key={p.id}
            >
              <div className={`project-cover ${p.mode}`}>
                <span className="status-badge">{stateLabels[p.status]}</span>
                {p.mode === "object" ? (
                  <Box size={62} strokeWidth={0.8} />
                ) : (
                  <Globe2 size={62} strokeWidth={0.8} />
                )}
                <small>
                  {p.mode === "object" ? "Object Mesh" : "Full Scene Mesh"}
                </small>
              </div>
              <div className="project-info">
                <h3>{p.name}</h3>
                <p>
                  {p.input_image_count}장 · {date(p.updated_at)} 수정
                </p>
                <ArrowUpRight size={17} />
              </div>
            </Link>
          ))}
          <Link href="/reconstruct/new" className="project-create">
            <Plus size={28} />
            <strong>새로운 사물 발견하기</strong>
            <span>사진에서 시작하세요.</span>
          </Link>
        </div>
      ) : (
        <div className="empty-state">
          <span>
            <FolderOpen size={30} strokeWidth={1.2} />
          </span>
          <h2>
            {search
              ? "검색 결과가 없습니다."
              : "첫 번째 프로젝트를 시작하세요."}
          </h2>
          <p>
            {search
              ? "다른 프로젝트 이름으로 검색해 보세요."
              : "책상 위의 소품이나 자주 찾는 공간. 사진을 담아 새로운 차원으로 옮겨보세요."}
          </p>
          <Button asChild variant="outline">
            <Link href="/reconstruct/new">
              <ImagePlus size={16} />
              프로젝트 만들기
            </Link>
          </Button>
        </div>
      )}
      <Link href="/docs" className="capture-guide-banner">
        <div>
          <small>촬영 전, 잠깐</small>
          <h3>좋은 3D는 좋은 사진에서 시작됩니다.</h3>
          <p>겹치는 시점, 일정한 빛, 선명한 초점. 촬영 팁을 확인하세요.</p>
        </div>
        <ArrowUpRight size={23} />
      </Link>
    </>
  );
}
