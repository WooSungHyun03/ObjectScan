"use client";
import { useSyncExternalStore } from "react";
import {
  peekDraft,
  serverDraft,
  subscribeDraft,
  putDraft,
} from "./upload-draft";
import { Button } from "@/components/ui/button";
export function DraftPhotos({
  busy,
  onUpload,
}: {
  busy: boolean;
  onUpload: (files: File[]) => Promise<void>;
}) {
  const files = useSyncExternalStore(subscribeDraft, peekDraft, serverDraft);
  if (!files.length) return null;
  return (
    <div className="notice">
      <p>앞에서 선택한 사진 {files.length}장이 준비되어 있습니다.</p>
      <Button
        disabled={busy}
        onClick={() => {
          const v = files.slice();
          putDraft([]);
          void onUpload(v);
        }}
      >
        선택한 사진 업로드
      </Button>
      <Button variant="ghost" disabled={busy} onClick={() => putDraft([])}>
        선택 취소
      </Button>
    </div>
  );
}
