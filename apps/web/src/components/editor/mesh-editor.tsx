"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Undo2,
  Redo2,
  Save,
  Download,
  Move,
  RotateCw,
  Scaling,
  EyeOff,
  Trash2,
  Maximize,
  Focus,
  Grid2X2,
  Layers,
  Upload,
  ArrowLeft,
} from "lucide-react";
import { InspectorPanel } from "./inspector-panel";
import { useMeshEditor } from "./use-mesh-editor";
import { Button } from "@/components/ui/button";
const EditorCanvas = dynamic(
  () => import("./editor-canvas").then((m) => m.EditorCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="editor-canvas editor-loading">3D 편집 화면 준비 중</div>
    ),
  },
);
export function MeshEditor({
  projectId,
  demo = false,
}: {
  projectId?: string;
  demo?: boolean;
}) {
  const {
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
  } = useMeshEditor({ projectId, demo });
  return (
    <main id="main" className="mesh-editor">
      <header className="editor-header">
        <Link href={demo ? "/" : "/projects/" + projectId}>
          <ArrowLeft size={17} /> {demo ? "예시 편집" : "프로젝트"}
        </Link>
        <div>
          <h1>모델 편집</h1>
          <span>
            {demo
              ? localFile
                ? "내 기기의 모델 · 서버에 업로드하지 않습니다"
                : "공개 예시 · 생성 결과가 아닙니다"
              : (data?.name ?? "모델 준비")}
            {dirty ? " · 저장하지 않은 변경" : ""}
          </span>
        </div>
        <div className="editor-top-actions">
          <Button
            variant="ghost"
            size="icon"
            aria-label="실행 취소"
            disabled={!cursor || busy || saving}
            onClick={() => void history(cursor - 1)}
          >
            <Undo2 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="다시 실행"
            disabled={cursor >= ops.length || busy || saving}
            onClick={() => void history(cursor + 1)}
          >
            <Redo2 size={18} />
          </Button>
          <Button
            variant="outline"
            disabled={demo || !dirty || busy || saving}
            onClick={() => void save()}
          >
            <Save size={16} />
            {saving ? "저장 중" : "새 버전 저장"}
          </Button>
          <Button disabled={!report || busy || saving} onClick={download}>
            <Download size={16} />
            내려받기
          </Button>
        </div>
      </header>
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {message && (
        <p className="editor-message" role="status">
          {message}
        </p>
      )}
      <div className="editor-body">
        <aside className="editor-tools" aria-label="편집 도구">
          {[
            { id: "translate", label: "이동", icon: Move },
            { id: "rotate", label: "회전", icon: RotateCw },
            { id: "scale", label: "크기", icon: Scaling },
          ].map((t) => (
            <button
              key={t.id}
              aria-pressed={tool === t.id}
              onClick={() => setTool(t.id as typeof tool)}
            >
              <t.icon size={19} />
              {t.label}
            </button>
          ))}
          <button
            onClick={() => void apply({ type: "center" })}
            disabled={busy || saving || !report}
          >
            <Focus size={19} />
            중앙 배치
          </button>
          <button
            onClick={() => void apply({ type: "normalize" })}
            disabled={busy || saving || !report}
          >
            <Maximize size={19} />
            크기 맞춤
          </button>
          <button onClick={() => setFit((f) => f + 1)}>
            <Maximize size={19} />
            화면 맞춤
          </button>
        </aside>
        <section className="editor-stage" aria-label="3D 편집 미리보기">
          {url ? (
            <EditorCanvas
              url={url}
              selected={selected}
              onSelect={selectPart}
              onTransform={(op) => void apply(op)}
              tool={tool}
              wire={wire}
              fit={fit}
              axis={axis}
              grid={grid}
              light={light}
              background={background}
            />
          ) : (
            <div className="editor-canvas editor-loading">
              {busy
                ? "모델을 확인하고 있습니다."
                : "편집 가능한 모델이 없습니다."}
            </div>
          )}
          {busy && (
            <div className="editor-busy" role="status">
              모델과 텍스처를 확인하고 있습니다…
            </div>
          )}
          <div className="editor-view-options">
            <button aria-pressed={grid} onClick={() => setGrid(!grid)}>
              <Grid2X2 size={15} />
              바닥 격자
            </button>
            <button aria-pressed={wire} onClick={() => setWire(!wire)}>
              <Layers size={15} />
              선으로 보기
            </button>
            <label>
              밝기
              <input
                aria-label="조명 밝기"
                type="range"
                min=".3"
                max="2"
                step=".1"
                value={light}
                onChange={(e) => setLight(Number(e.target.value))}
              />
            </label>
            <label>
              배경
              <input
                aria-label="배경색"
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
              />
            </label>
          </div>
          {previewTriangles && (
            <p className="editor-hint">
              작업용 경량 미리보기 {previewTriangles.toLocaleString()}개 삼각형
              · 저장과 내려받기는 전체 편집 모델을 사용합니다.
            </p>
          )}
          <p className="editor-hint">
            끌어서 회전 · 스크롤로 확대 · 오른쪽 버튼으로 화면 이동
          </p>
        </section>
        <InspectorPanel>
          <aside className="editor-inspector">
            <details open>
              <summary>모델 정보</summary>
              {report ? (
                <dl>
                  <div>
                    <dt>삼각형</dt>
                    <dd data-testid="editor-triangles">
                      {report.triangles.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt>파일 크기</dt>
                    <dd>{(report.size / 1024 / 1024).toFixed(2)} MB</dd>
                  </div>
                  <div>
                    <dt>표면 이미지</dt>
                    <dd>{report.uv && report.textures ? "포함됨" : "없음"}</dd>
                  </div>
                </dl>
              ) : (
                <p>원본을 변경하지 않고 불러옵니다.</p>
              )}
            </details>
            <details open>
              <summary>부품 선택</summary>
              <div className="editor-parts">
                {report?.parts.map((p) => (
                  <button
                    key={p.id}
                    aria-pressed={selected === p.id}
                    onClick={() => selectPart(p.id)}
                    disabled={p.hidden}
                  >
                    {p.name}
                    {p.hidden ? " · 숨김" : ""}
                  </button>
                ))}
              </div>
              {draft && !draft.hidden && (
                <>
                  <label>
                    조작할 축
                    <select
                      aria-label="조작할 축"
                      value={axis}
                      onChange={(e) => setAxis(e.target.value)}
                    >
                      <option value="all">모든 축</option>
                      <option value="x">X축</option>
                      <option value="y">Y축</option>
                      <option value="z">Z축</option>
                    </select>
                  </label>
                  {(["position", "rotation", "scale"] as const).map((key) => (
                    <fieldset key={key} disabled={busy || saving}>
                      <legend>
                        {key === "position"
                          ? "위치"
                          : key === "rotation"
                            ? "회전 (도)"
                            : "크기 비율"}
                      </legend>
                      <div className="vector-fields">
                        {["X", "Y", "Z"].map((name, i) => (
                          <label key={name}>
                            {name}
                            <input
                              aria-label={`${key === "position" ? "위치" : key === "rotation" ? "회전" : "크기"} ${name}`}
                              type="number"
                              step=".1"
                              value={Number(draft[key][i].toFixed(3))}
                              onChange={(e) =>
                                setDraft({
                                  ...draft,
                                  [key]: draft[key].map((n, j) =>
                                    j === i ? Number(e.target.value) : n,
                                  ),
                                })
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy || saving}
                    onClick={() =>
                      void apply({
                        type: "transform",
                        node: draft.id,
                        position: draft.position as [number, number, number],
                        rotation: draft.rotation as [number, number, number],
                        scale: draft.scale as [number, number, number],
                      })
                    }
                  >
                    수치 적용
                  </Button>
                  <div className="editor-part-actions">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy || saving}
                      onClick={() =>
                        void apply({ type: "hide", node: draft.id })
                      }
                    >
                      <EyeOff size={14} />
                      숨기기
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy || saving}
                      onClick={() =>
                        void apply({ type: "delete", node: draft.id })
                      }
                    >
                      <Trash2 size={14} />
                      삭제
                    </Button>
                  </div>
                </>
              )}
              <p>
                분리된 부품 단위로 편집합니다. 단일 표면의 일부 면을 지우는
                기능은 지원하지 않습니다.
              </p>
            </details>
            <details>
              <summary>모델 가볍게 만들기</summary>
              <label>
                목표 삼각형 비율
                <select
                  aria-label="목표 삼각형 비율"
                  value={ratio}
                  onChange={(e) => setRatio(Number(e.target.value))}
                >
                  <option value="0.75">원본의 75%</option>
                  <option value="0.5">원본의 50%</option>
                  <option value="0.25">원본의 25%</option>
                </select>
              </label>
              <Button
                size="sm"
                variant="outline"
                disabled={busy || saving || !report}
                onClick={() => void apply({ type: "simplify", ratio })}
              >
                폴리곤 줄이기
              </Button>
              <p>
                경계와 표면 이미지를 보존하며 줄입니다. 목표 비율과 실제 결과는
                다를 수 있습니다.
              </p>
            </details>
            <details>
              <summary>저장한 버전</summary>
              {demo ? (
                <p>
                  공개 예시는 새 버전 저장을 지원하지 않습니다. 편집한 파일을
                  내려받을 수 있습니다.
                </p>
              ) : (
                <>
                  <button
                    className="version-link"
                    disabled={busy || saving}
                    onClick={() => {
                      if (
                        !dirty ||
                        confirm("수정 내용을 버리고 원본을 열까요?")
                      )
                        void loadSource(data!.source_url);
                    }}
                  >
                    원본 모델 열기
                  </button>
                  {data?.versions.map((v) => (
                    <button
                      className="version-link"
                      key={v.id}
                      disabled={busy || saving}
                      onClick={() => void openVersion(v.id)}
                    >
                      버전 {v.version_number} ·{" "}
                      {new Date(v.created_at).toLocaleDateString("ko-KR")}
                    </button>
                  ))}
                </>
              )}
            </details>
            {demo && (
              <label className="editor-file-import">
                <Upload size={15} />
                다른 GLB 열기
                <input
                  type="file"
                  disabled={busy || saving}
                  accept=".glb"
                  onChange={(e) => void importFile(e.target.files?.[0])}
                />
              </label>
            )}
            <p className="editor-units">
              모델의 실제 단위는 확인되지 않았습니다. 위치는 모델 좌표, 크기는
              비율로 표시합니다.
            </p>
          </aside>
        </InspectorPanel>
      </div>
    </main>
  );
}
