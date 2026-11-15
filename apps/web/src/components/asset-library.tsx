"use client";
import { customerError } from "@/lib/customer-copy";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
import { DeletionRequestDialog } from "@/features/deletion/deletion-request-dialog";
export function AssetLibrary() {
  const [assets, setAssets] = useState<Artifact[]>([]),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<Artifact | null>(null),
    [status, setStatus] = useState(""),
    [loading, setLoading] = useState(true);
  const title = useRef<HTMLDivElement>(null);
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
  return (
    <>
      <div ref={title} tabIndex={-1}>
        <PageTitle
          title="내 에셋"
          description="직접 제작하거나 구매한 3D 모델을 한곳에서 확인하세요."
        />
      </div>
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
      {status && (
        <p className="notice success" role="status">
          {status}
        </p>
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
                    <DeletionRequestDialog
                      trigger={
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`${a.name} 삭제`}
                        >
                          <Trash2 aria-hidden="true" size={14} />
                        </Button>
                      }
                      title="에셋 삭제 확인"
                      description={`‘${a.name}’ 에셋을 영구 삭제합니다. 진행 중인 주문이나 구매 권리가 있으면 삭제가 제한됩니다.`}
                      confirmLabel="삭제 확인"
                      request={async () => {
                        setStatus("");
                        const result = await api<{ ok: boolean }>(
                          `assets/${a.id}`,
                          {
                            method: "DELETE",
                            signal: AbortSignal.timeout(20_000),
                          },
                        );
                        if (result?.ok !== true)
                          throw Error("Unconfirmed deletion");
                      }}
                      onSuccess={() => {
                        setAssets((current) =>
                          current.filter((asset) => asset.id !== a.id),
                        );
                        setSelected((current) =>
                          current?.id === a.id ? null : current,
                        );
                        setStatus("에셋을 삭제했습니다.");
                      }}
                      focusAfterSuccess={() => title.current?.focus()}
                    />
                  </>
                )}
              </div>
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
