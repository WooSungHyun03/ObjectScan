"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  peekDraft,
  serverDraft,
  subscribeDraft,
  putDraft,
} from "./upload-draft";
import {
  moveItem,
  photoWarnings,
  type PhotoDiagnostics,
  type PhotoWarning,
} from "./photo-diagnostics";
import { Button } from "@/components/ui/button";
const warningText: Record<NonNullable<PhotoWarning>, string> = {
  duplicate: "다른 사진과 같은 파일입니다. 한 장만 사용해도 됩니다.",
  blurry:
    "함께 선택한 사진보다 흐리게 측정되었습니다. 참고용이며 그대로 사용할 수 있습니다.",
  unchecked: "선명도를 확인하지 못했습니다. 사진은 그대로 유지됩니다.",
};
export function DraftPhotos({
  busy,
  onUpload,
  diagnostics,
}: {
  busy: boolean;
  onUpload: (files: File[]) => Promise<void>;
  // Keyed by file name. Absent until the server returns diagnostics (OWN-04).
  diagnostics?: Record<string, PhotoDiagnostics>;
}) {
  const files = useSyncExternalStore(subscribeDraft, peekDraft, serverDraft);
  const [status, setStatus] = useState("");
  const list = useRef<HTMLOListElement>(null),
    focusNext = useRef("");
  // Reordering re-renders the rows, so keyboard focus is put back on the photo that moved.
  useEffect(() => {
    if (!focusNext.current) return;
    const [row, act] = focusNext.current.split(":");
    const li = list.current?.querySelector(`[data-row="${row}"]`);
    // The same action if it is still usable (not at an end), else any control of that photo.
    const target =
      li?.querySelector<HTMLElement>(`[data-act="${act}"]:enabled`) ??
      li?.querySelector<HTMLElement>("button:enabled");
    (target ?? list.current)?.focus();
    focusNext.current = "";
  });
  if (!files.length) return null;
  const warnings = photoWarnings(files.map((f) => diagnostics?.[f.name]));
  function move(index: number, delta: number) {
    const next = moveItem(files, index, delta);
    if (next === files) return;
    const to = index + delta;
    focusNext.current = `${to}:${delta < 0 ? "up" : "down"}`;
    putDraft(next);
    setStatus(`${files[index].name}: ${to + 1}번째로 옮겼습니다.`);
  }
  function exclude(index: number) {
    focusNext.current = `${Math.min(index, files.length - 2)}:exclude`;
    putDraft(files.filter((_, i) => i !== index));
    setStatus(
      `${files[index].name}: 제외했습니다. 남은 사진 ${files.length - 1}장.`,
    );
  }
  return (
    <div className="notice">
      <div className="min-w-0 flex-1">
        <p>
          앞에서 선택한 사진 {files.length}장이 준비되어 있습니다. 업로드 전에
          순서를 바꾸거나 제외할 수 있습니다.
        </p>
        <p>
          {warnings.some(Boolean)
            ? "아래 안내는 참고용입니다. 안내가 있어도 그대로 업로드할 수 있습니다."
            : "초점이 맞고 서로 겹치는 사진을 사용하면 결과가 안정적입니다. 같은 사진은 한 장만 올려 주세요."}
        </p>
        <ol ref={list} tabIndex={-1} className="draft-photos my-2 grid gap-2">
          {files.map((f, i) => (
            <li
              key={`${i}-${f.name}`}
              data-row={i}
              className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[var(--border)] pt-2"
            >
              <span className="min-w-0 flex-1 basis-full break-all sm:basis-40">
                {i + 1}. {f.name}
                {warnings[i] && (
                  <small data-warning={warnings[i]} className="block">
                    {warningText[warnings[i]]}
                  </small>
                )}
              </span>
              <Button
                size="sm"
                variant="ghost"
                data-act="up"
                disabled={busy || i === 0}
                aria-label={`${f.name} 위로 이동`}
                onClick={() => move(i, -1)}
              >
                위로
              </Button>
              <Button
                size="sm"
                variant="ghost"
                data-act="down"
                disabled={busy || i === files.length - 1}
                aria-label={`${f.name} 아래로 이동`}
                onClick={() => move(i, 1)}
              >
                아래로
              </Button>
              <Button
                size="sm"
                variant="ghost"
                data-act="exclude"
                disabled={busy}
                aria-label={`${f.name} 제외`}
                onClick={() => exclude(i)}
              >
                제외
              </Button>
            </li>
          ))}
        </ol>
        <p role="status" className="sr-only">
          {status}
        </p>
        <Button
          disabled={busy}
          onClick={() => {
            const v = files.slice();
            putDraft([]);
            void onUpload(v);
          }}
        >
          선택한 사진 {files.length}장 업로드
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => putDraft([])}>
          선택 취소
        </Button>
      </div>
    </div>
  );
}
