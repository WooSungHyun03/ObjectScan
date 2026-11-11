"use client";
import { customerError } from "@/lib/customer-copy";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Box,
  ArrowUpRight,
  Download,
  Trash2,
  LockKeyhole,
  AlertCircle,
} from "lucide-react";
import type { Artifact } from "@objectscan/shared";
import { api, date } from "@/lib/client-api";
import { PageTitle } from "./page-title";
import { Button } from "./ui/button";
import { PublishForm } from "./publish-form";
export function AssetLibrary() {
  const [assets, setAssets] = useState<Artifact[]>([]),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<Artifact | null>(null),
    [remove, setRemove] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    void api<Artifact[]>("assets")
      .then(setAssets)
      .catch((e) => setError(customerError(undefined, e.message)))
      .finally(() => setLoading(false));
  }, []);
  async function download(a: Artifact) {
    try {
      const v = await api<{ url: string }>(`assets/${a.id}/download`);
      location.assign(v.url);
    } catch (e) {
      setError(customerError(undefined, (e as Error).message));
    }
  }
  async function deleteAsset(id: string) {
    try {
      await api(`assets/${id}`, { method: "DELETE" });
      setAssets(assets.filter((a) => a.id !== id));
      setRemove("");
    } catch (e) {
      setError(customerError(undefined, (e as Error).message));
    }
  }
  return (
    <>
      <PageTitle
        title="내 에셋"
        description="직접 제작하거나 구매한 3D 모델을 한곳에서 확인하세요."
      />
      <div className="workspace-notice">
        <LockKeyhole size={16} />
        제작 에셋은 기본 비공개입니다. 권리를 보유한 모델만 직접 게시할 수
        있습니다.
      </div>
      {error && (
        <div className="notice error" role="alert">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {loading ? (
        <div className="loading-state">에셋 불러오는 중…</div>
      ) : assets.length ? (
        <div className="project-grid">
          {assets.map((a) => (
            <article className="project-card" key={a.id}>
              <Link href={`/assets/${a.id}`} className="project-cover">
                <Box size={52} strokeWidth={1} />
                <small>검증된 GLB</small>
              </Link>
              <div className="project-info">
                <h3>{a.name}</h3>
                <p>
                  {date(a.created_at)} ·{" "}
                  {Number(a.quality.triangles).toLocaleString()} 삼각형
                </p>
              </div>
              <div className="asset-actions">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void download(a)}
                >
                  <Download size={14} />
                  다운로드
                </Button>
                {a.can_publish && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setSelected(selected?.id === a.id ? null : a)
                      }
                    >
                      게시 신청
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`${a.name} 삭제`}
                      onClick={() => setRemove(a.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </>
                )}
              </div>
              {remove === a.id && (
                <div className="notice warning">
                  <div>
                    <p>
                      이 에셋을 영구 삭제할까요? 구매 권한이 있으면 삭제가
                      차단됩니다.
                    </p>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => void deleteAsset(a.id)}
                    >
                      삭제 확인
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRemove("")}
                    >
                      유지
                    </Button>
                  </div>
                </div>
              )}
              {selected?.id === a.id && (
                <PublishForm asset={a} onComplete={() => setSelected(null)} />
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span>
            <Box size={31} strokeWidth={1.2} />
          </span>
          <h2>아직 보관된 에셋이 없습니다.</h2>
          <p>검증된 제작 결과와 구매한 에셋이 이곳에 표시됩니다.</p>
          <Button asChild variant="outline">
            <Link href="/reconstruct/new">
              첫 프로젝트 만들기 <ArrowUpRight size={16} />
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
