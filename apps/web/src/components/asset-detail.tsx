"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { Viewer } from "./viewer";
import { Button } from "./ui/button";
import { PageTitle } from "./page-title";
import { PublishForm } from "./publish-form";
import { Download } from "lucide-react";
export function AssetDetail({ id }: { id: string }) {
  const [asset, setAsset] = useState<{
      id: string;
      name: string;
      can_publish: boolean;
    } | null>(null),
    [url, setUrl] = useState(""),
    [error, setError] = useState(""),
    [publish, setPublish] = useState(false);
  useEffect(() => {
    void Promise.all([
      api<{ id: string; name: string; can_publish: boolean }>(`assets/${id}`),
      api<{ url: string }>(`assets/${id}/download`),
    ])
      .then(([a, u]) => {
        setAsset(a);
        setUrl(u.url);
      })
      .catch((e) => setError(e.message));
  }, [id]);
  return (
    <>
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {asset && (
        <>
          <PageTitle
            title={asset.name}
            description={
              asset.can_publish
                ? "직접 제작한 비공개 에셋"
                : "구매한 에셋 · 다운로드 권한 확인됨"
            }
          >
            <Button
              onClick={() =>
                void api<{ url: string }>(`assets/${id}/download`)
                  .then((u) => location.assign(u.url))
                  .catch((e) => setError(e.message))
              }
            >
              <Download size={16} />
              GLB 다운로드
            </Button>
          </PageTitle>
          <Viewer url={url} demo={false} />
          {asset.can_publish && (
            <>
              <Button variant="outline" onClick={() => setPublish(!publish)}>
                마켓 게시 신청
              </Button>
              {publish && (
                <PublishForm
                  asset={asset}
                  onComplete={() => setPublish(false)}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
