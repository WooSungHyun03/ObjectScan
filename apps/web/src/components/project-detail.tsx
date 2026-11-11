"use client";
import { customerError } from "@/lib/customer-copy";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  LockKeyhole,
  Box,
  Globe2,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import type { Project, ProjectImage, Job, Artifact } from "@objectscan/shared";
import { api, stateLabels } from "@/lib/client-api";
import { Button } from "./ui/button";
import { PageTitle } from "./page-title";
import { Viewer } from "./viewer";
import { JobTracker } from "./job-tracker";
import { PublishForm } from "./publish-form";
type Detail = Project & {
  images: ProjectImage[];
  jobs: Job[];
  artifacts: Artifact[];
};
export function ProjectDetail({ id }: { id: string }) {
  const [p, setP] = useState<Detail | null>(null),
    [error, setError] = useState(""),
    [url, setUrl] = useState(""),
    [publish, setPublish] = useState(false);
  const load = useCallback(
    async () => setP(await api<Detail>(`projects/${id}`)),
    [id],
  );
  useEffect(() => {
    void load().catch((e) => setError(customerError(undefined, e.message)));
  }, [load]);
  useEffect(() => {
    const a = p?.artifacts[0];
    if (a)
      void api<{ url: string }>(`assets/${a.id}/download`)
        .then((v) => setUrl(v.url))
        .catch((e) => setError(customerError(undefined, e.message)));
  }, [p?.artifacts]);
  async function download() {
    try {
      const v = await api<{ url: string }>(
        `assets/${p!.artifacts[0].id}/download`,
      );
      const a = document.createElement("a");
      a.href = v.url;
      a.download = `${p!.name}.glb`;
      a.click();
    } catch (e) {
      setError(customerError(undefined, (e as Error).message));
    }
  }
  return (
    <>
      <Link className="back-link" href="/dashboard">
        <ArrowLeft size={14} />
        프로젝트 목록
      </Link>
      {p?.artifacts[0] && (
        <Button asChild variant="outline">
          <Link href={`/projects/${id}/edit`}>내 모델 편집하기</Link>
        </Button>
      )}
      {error && (
        <div className="notice error" role="alert">
          <AlertCircle size={17} />
          {error}
        </div>
      )}
      {p ? (
        <>
          <PageTitle
            title={p.name}
            description={`${p.mode === "object" ? "물체 3D 제작" : "공간 3D 제작"} · 원본 ${p.input_image_count}장 · ${stateLabels[p.status]}`}
          >
            <span className="private-label">
              <LockKeyhole size={14} />
              비공개
            </span>
          </PageTitle>
          <div className="project-detail-layout">
            <section>
              <div className="detail-viewer">
                {url ? (
                  <Viewer url={url} demo={false} />
                ) : (
                  <div className="result-placeholder">
                    <span>
                      {p.mode === "object" ? (
                        <Box size={47} strokeWidth={1} />
                      ) : (
                        <Globe2 size={47} strokeWidth={1} />
                      )}
                    </span>
                    <h2>검증된 3D 결과를 기다리고 있습니다.</h2>
                    <p>
                      실제 메시와 UV 텍스처 검증을 통과한 결과만 표시합니다.
                    </p>
                    <Button asChild variant="outline">
                      <Link
                        href={`/reconstruct/new?mode=${p.mode}&project=${p.id}`}
                      >
                        프로젝트 계속하기 <ArrowUpRight size={15} />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              {p.jobs[0] && (
                <JobTracker jobId={p.jobs[0].id} onComplete={load} />
              )}
            </section>
            <aside className="project-detail-aside">
              <h2>프로젝트 정보</h2>
              <dl className="detail-list">
                <div>
                  <dt>복원 방식</dt>
                  <dd>
                    {p.mode === "object" ? "객체만 복원" : "장면 전체 복원"}
                  </dd>
                </div>
                <div>
                  <dt>원본 업로드</dt>
                  <dd>{p.input_image_count}장</dd>
                </div>
                <div>
                  <dt>사용할 사진</dt>
                  <dd>{p.images.filter((i) => !i.excluded).length}장</dd>
                </div>
                <div>
                  <dt>촬영 방식</dt>
                  <dd>
                    {p.capture_mode === "turntable"
                      ? "턴테이블"
                      : "카메라 이동"}
                  </dd>
                </div>
                <div>
                  <dt>최종 출력</dt>
                  <dd>UV 텍스처 GLB</dd>
                </div>
              </dl>
              <Button
                className="full-width"
                disabled={!p.artifacts.length}
                onClick={() => void download()}
              >
                <Download size={16} />
                GLB 다운로드
              </Button>
              <Button
                className="full-width"
                variant="outline"
                disabled={!p.artifacts.length}
                onClick={() => setPublish(!publish)}
              >
                에셋 마켓 게시 신청
              </Button>
              {publish && p.artifacts[0] && (
                <PublishForm
                  asset={p.artifacts[0]}
                  onComplete={() => setPublish(false)}
                />
              )}
              <Link
                href={`/reconstruct/new?mode=${p.mode}&project=${p.id}`}
                className="button button-ghost full-width"
              >
                입력 사진 및 마스크 관리
              </Link>
              <div className="reference-inputs">
                <h3>입력 사진</h3>
                <div>
                  {p.images.slice(0, 12).map((im) => (
                    <img
                      loading="lazy"
                      key={im.id}
                      src={im.url}
                      alt={im.filename}
                      className={im.excluded ? "excluded" : ""}
                    />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </>
      ) : (
        !error && (
          <div className="loading-state">
            <span className="spinner" />
            프로젝트를 불러오는 중…
          </div>
        )
      )}
    </>
  );
}
