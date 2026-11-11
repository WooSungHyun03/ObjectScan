"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  MeshEditOperation,
  MeshReport,
  MeshPart,
} from "@objectscan/mesh-editor";
import { api, post } from "@/lib/client-api";
import { customerError } from "@/lib/customer-copy";
type Version = {
  id: string;
  version_number: number;
  created_at: string;
  size_bytes: number;
};
type Data = {
  artifact_id: string;
  name: string;
  source_url: string;
  versions: Version[];
};
export function useMeshEditor({
  projectId,
  demo = false,
}: {
  projectId?: string;
  demo?: boolean;
}) {
  const [data, setData] = useState<Data | null>(null),
    [localFile, setLocalFile] = useState(false),
    [report, setReport] = useState<MeshReport | null>(null),
    [previewTriangles, setPreviewTriangles] = useState<number | null>(null),
    [url, setUrl] = useState(""),
    [selected, setSelected] = useState<number | null>(null),
    [ops, setOps] = useState<MeshEditOperation[]>([]),
    [cursor, setCursor] = useState(0),
    [busy, setBusy] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [parent, setParent] = useState<string | null>(null),
    [dirty, setDirty] = useState(false),
    [tool, setTool] = useState<"translate" | "rotate" | "scale">("translate"),
    [wire, setWire] = useState(false),
    [grid, setGrid] = useState(true),
    [axis, setAxis] = useState("all"),
    [light, setLight] = useState(1),
    [background, setBackground] = useState("#161b24"),
    [fit, setFit] = useState(0),
    [ratio, setRatio] = useState(0.5),
    [draft, setDraft] = useState<MeshPart | null>(null);
  const worker = useRef<Worker | null>(null),
    bytes = useRef<Uint8Array | null>(null),
    pending = useRef(
      new Map<number, { resolve: () => void; reject: (e: Error) => void }>(),
    ),
    sequence = useRef(0),
    objectUrl = useRef(""),
    saveKey = useRef<string | null>(null);
  const process = useCallback(
    (commands: MeshEditOperation[], source?: ArrayBuffer) =>
      new Promise<void>((resolve, reject) => {
        if (pending.current.size > 0) {
          reject(Error("이전 편집이 끝난 뒤 다시 시도해 주세요."));
          return;
        }
        if (!worker.current) {
          reject(Error("편집 도구를 준비하고 있습니다."));
          return;
        }
        const id = ++sequence.current;
        pending.current.set(id, { resolve, reject });
        setBusy(true);
        setError("");
        worker.current.postMessage(
          { id, source, commands },
          source ? [source] : [],
        );
      }),
    [],
  );
  const loadSource = useCallback(
    async (source: string, parentId: string | null = null) => {
      setBusy(true);
      setError("");
      try {
        const r = await fetch(source);
        if (!r.ok) throw Error("모델을 불러오지 못했습니다. 다시 열어 주세요.");
        const blob = await r.blob();
        if (blob.size > 64 * 1024 * 1024)
          throw Error(
            "64MB 이하 모델만 브라우저에서 편집할 수 있습니다. 원본 내려받기는 프로젝트에서 이용해 주세요.",
          );
        await process([], await blob.arrayBuffer());
        setOps([]);
        setCursor(0);
        setParent(parentId);
        setDirty(false);
        setFit((f) => f + 1);
        saveKey.current = null;
        return true;
      } catch (e) {
        setError(customerError(undefined, (e as Error).message));
        setBusy(false);
        return false;
      }
    },
    [process],
  );
  useEffect(() => {
    const w = new Worker(new URL("./mesh-worker.ts", import.meta.url), {
      type: "module",
    });
    worker.current = w;
    w.onmessage = (e) => {
      const response = e.data;
      const p = pending.current.get(response.id);
      if (!p) return;
      pending.current.delete(response.id);
      setBusy(false);
      if (response.error) {
        p.reject(Error(response.error));
        return;
      }
      bytes.current = new Uint8Array(response.bytes);
      setReport(response.report);
      setPreviewTriangles(response.previewReport?.triangles ?? null);
      setDraft(
        (previous) =>
          response.report.parts.find((p: MeshPart) => p.id === previous?.id) ??
          null,
      );
      const next = URL.createObjectURL(
        new Blob(
          [(response.previewBytes ?? bytes.current) as Uint8Array<ArrayBuffer>],
          {
            type: "model/gltf-binary",
          },
        ),
      );
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = next;
      setUrl(next);
      p.resolve();
    };
    w.onerror = () => {
      setBusy(false);
      setError("편집 도구를 실행하지 못했습니다. 페이지를 다시 열어 주세요.");
      for (const p of pending.current.values())
        p.reject(Error("편집 도구가 중단되었습니다."));
      pending.current.clear();
    };
    let alive = true;
    const promiseMap = pending.current;
    if (demo) void Promise.resolve().then(() => loadSource("/demo/shoe.glb"));
    else
      void api<Data>(`projects/${projectId}/editor`)
        .then((d) => {
          if (alive) {
            setData(d);
            void loadSource(d.source_url);
          }
        })
        .catch((e) => {
          if (alive) {
            setError(customerError(undefined, e.message));
            setBusy(false);
          }
        });
    return () => {
      alive = false;
      w.terminate();
      worker.current = null;
      for (const p of promiseMap.values())
        p.reject(Error("편집 화면을 닫았습니다."));
      promiseMap.clear();
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, [demo, projectId, loadSource]);
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const click = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a[href]");
      if (
        dirty &&
        anchor &&
        !anchor.hasAttribute("download") &&
        !window.confirm(
          "저장하지 않은 수정 내용이 있습니다. 편집 화면을 나갈까요?",
        )
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
    };
  }, [dirty]);
  async function apply(op: MeshEditOperation) {
    if (busy || saving) return;
    const list = [...ops.slice(0, cursor), op];
    try {
      await process(list);
      setOps(list);
      setCursor(list.length);
      setDirty(true);
      if (op.type === "hide" || op.type === "delete") {
        setSelected(null);
        setDraft(null);
      }
      saveKey.current = null;
      setMessage("");
    } catch (e) {
      setError(customerError(undefined, (e as Error).message));
    }
  }
  async function history(next: number) {
    try {
      await process(ops.slice(0, next));
      setCursor(next);
      setDirty(next !== 0);
      saveKey.current = null;
    } catch (e) {
      setError(customerError(undefined, (e as Error).message));
    }
  }
  async function save() {
    if (!data || !bytes.current) return;
    setSaving(true);
    setError("");
    try {
      const key = saveKey.current ?? crypto.randomUUID();
      saveKey.current = key;
      const reserved = await post<{
        id: string;
        upload_url?: string;
        status: string;
      }>(`assets/${data.artifact_id}/versions`, {
        idempotency_key: key,
        sha256: Array.from(
          new Uint8Array(
            await crypto.subtle.digest(
              "SHA-256",
              bytes.current as Uint8Array<ArrayBuffer>,
            ),
          ),
        )
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
        parent_id: parent,
        size: bytes.current.byteLength,
        operations: ops.slice(0, cursor),
      });
      if (reserved.status !== "ready") {
        const r = await fetch(reserved.upload_url!, {
          method: "PUT",
          headers: { "Content-Type": "model/gltf-binary" },
          body: new Blob([bytes.current as Uint8Array<ArrayBuffer>]),
        });
        if (!r.ok && r.status !== 409)
          throw Error("버전 파일 업로드에 실패했습니다. 다시 저장해 주세요.");
        await post(
          `assets/${data.artifact_id}/versions/${reserved.id}/complete`,
        );
      }
      const next = await api<Data>(`projects/${projectId}/editor`);
      setData(next);
      const saved = await api<{ url: string }>(
        `assets/${data.artifact_id}/versions/${reserved.id}`,
      );
      await loadSource(saved.url, reserved.id);
      setMessage("원본을 보존하고 새 버전을 저장했습니다.");
    } catch (e) {
      setError(customerError(undefined, (e as Error).message));
    } finally {
      setSaving(false);
    }
  }
  function download() {
    if (!bytes.current) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([bytes.current as Uint8Array<ArrayBuffer>], {
        type: "model/gltf-binary",
      }),
    );
    link.download =
      demo && !localFile
        ? "ObjectScan-공개예시-편집본.glb"
        : "ObjectScan-편집본.glb";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    setMessage("텍스처 보존을 확인한 편집본을 내려받습니다.");
  }
  async function openVersion(id: string) {
    if (
      !data ||
      (dirty && !confirm("저장하지 않은 내용을 버리고 버전을 열까요?"))
    )
      return;
    try {
      const result = await api<{ url: string }>(
        `assets/${data.artifact_id}/versions/${id}`,
      );
      await loadSource(result.url, id);
    } catch (e) {
      setError(customerError(undefined, (e as Error).message));
    }
  }
  async function importFile(file?: File) {
    if (
      !file ||
      busy ||
      saving ||
      (dirty && !confirm("수정 내용을 버리고 다른 파일을 열까요?"))
    )
      return;
    const temporary = URL.createObjectURL(file);
    try {
      if (await loadSource(temporary)) setLocalFile(true);
    } finally {
      URL.revokeObjectURL(temporary);
    }
  }
  function selectPart(id: number) {
    setSelected(id);
    setDraft(report?.parts.find((p) => p.id === id) ?? null);
  }
  return {
    data,
    report,
    selected,
    ops,
    cursor,
    busy,
    saving,
    error,
    message,
    dirty,
    tool,
    wire,
    grid,
    axis,
    light,
    background,
    fit,
    ratio,
    draft,
    localFile,
    previewTriangles,
    url,
    setTool,
    setWire,
    setGrid,
    setAxis,
    setLight,
    setBackground,
    setFit,
    setRatio,
    setDraft,
    apply,
    history,
    save,
    download,
    loadSource,
    openVersion,
    importFile,
    selectPart,
  };
}
