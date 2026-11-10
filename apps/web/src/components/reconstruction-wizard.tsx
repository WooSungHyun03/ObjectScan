"use client";
import { educationMode } from "@/lib/project-purpose";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Globe2,
  ImagePlus,
  ArrowRight,
  ArrowLeft,
  Check,
  ArrowUp,
  ArrowDown,
  ScanLine,
  MousePointer2,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Settings2,
  Layers,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";
import {
  type ReconstructionMode,
  type Project,
  type ProjectImage,
  type Job,
  type ObjectSelection,
  pricingTier,
  routeModel,
  sceneWarnings,
} from "@objectscan/shared";
import { api, post } from "@/lib/client-api";
import { Button } from "./ui/button";
import { PageTitle } from "./page-title";
import { Viewer } from "./viewer";
import { JobTracker } from "./job-tracker";
type Detail = Project & {
  images: ProjectImage[];
  jobs: Job[];
  artifacts: { id: string; name: string }[];
};
type Health = {
  worker_online: boolean;
  real_gpu_validated: boolean;
  payments_mode: string;
  models: string[];
};
export function ReconstructionWizard({
  initialMode = "object",
  initialProject,
}: {
  initialMode?: ReconstructionMode;
  initialProject?: string;
}) {
  const router = useRouter();
  const [mode] = useState(initialMode),
    [project, setProject] = useState<Detail | null>(null),
    [pid, setPid] = useState(initialProject ?? ""),
    [name, setName] = useState(""),
    [capture, setCapture] = useState<"camera_orbit" | "turntable">(
      "camera_orbit",
    ),
    [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [uploadErrors, setUploadErrors] = useState<{ file: File; error: string }[]>(
      [],
    ),
    [progress, setProgress] = useState({ done: 0, total: 0 }),
    [tool, setTool] = useState<"box" | "point">("box"),
    [selection, setSelection] = useState<ObjectSelection | null>(null),
    [reference, setReference] = useState(""),
    [drag, setDrag] = useState<{ x: number; y: number } | null>(null),
    [showMask, setShowMask] = useState(true),
    [health, setHealth] = useState<Health | null>(null);
  const fileInput = useRef<HTMLInputElement>(null),
    imageArea = useRef<HTMLDivElement>(null),
    abort = useRef<AbortController | null>(null);
  const steps =
    mode === "object"
      ? ["사진 업로드", "물체 선택 · 마스크", "설정 확인", "처리 · 결과"]
      : ["사진 업로드", "설정 확인", "처리 · 결과"];
  const images = project?.images ?? [],
    included = images.filter((i) => !i.excluded),
    ref = images.find((i) => i.id === reference) ?? included[0],
    configureIndex = mode === "object" ? 2 : 1,
    processIndex = steps.length - 1;
  const load = useCallback(async () => {
    if (!pid) return;
    const p = await api<Detail>(`projects/${pid}`);
    setProject(p);
    setName(p.name);
    setCapture(p.capture_mode);
    if (p.target_selection) {
      setSelection(p.target_selection);
      setReference(p.target_image_id ?? "");
    }
  }, [pid]);
  useEffect(() => {
    void load().catch((e) => setError(e.message));
    void api<Health>("health")
      .then(setHealth)
      .catch((e) => setError(e.message));
  }, [load]);
  useEffect(() => () => abort.current?.abort(), []);
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function ensureProject() {
    if (pid) return pid;
    const p = await post<Project>("projects", {
      name: name.trim() || (mode === "object" ? "새로운 사물" : "새로운 공간"),
      mode,
      capture_mode: capture,
    });
    setPid(p.id);
    setProject({ ...p, images: [], jobs: [], artifacts: [] });
    history.replaceState(
      {},
      "",
      `/reconstruct/new?mode=${mode}&project=${p.id}`,
    );
    return p.id;
  }
  async function upload(files: File[]) {
    if (!files.length) return;
    if (images.length + files.length > 200) {
      setError("프로젝트당 최대 200장까지 업로드할 수 있습니다.");
      return;
    }
    setBusy(true);
    setError("");
    setProgress({ done: 0, total: files.length });
    const errors: { file: File; error: string }[] = [];
    abort.current = new AbortController();
    try {
      const projectId = await ensureProject();
      for (let n = 0; n < files.length; n++) {
        const file = files[n];
        if (abort.current.signal.aborted) {
          errors.push(
            ...files
              .slice(n)
              .map((file) => ({ file, error: "업로드를 취소했습니다." })),
          );
          break;
        }
        try {
          if (
            !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
            file.size > 16 * 1024 * 1024
          )
            throw Error("JPEG/PNG/WebP, 파일당 16MB 이하만 지원합니다.");
          const signed = await post<{ image_id: string; signed_url: string }>(
            `projects/${projectId}/upload-init`,
            { filename: file.name, mime: file.type, bytes: file.size },
          );
          const r = await fetch(signed.signed_url, {
            method: "PUT",
            headers: { "Content-Type": file.type, "x-upsert": "false" },
            body: file,
            signal: abort.current.signal,
          });
          if (!r.ok) throw Error("파일 저장에 실패했습니다. 다시 시도하세요.");
          await post(`projects/${projectId}/upload-complete`, {
            image_id: signed.image_id,
          });
        } catch (e) {
          errors.push({
            file,
            error:
              (e as Error).name === "AbortError"
                ? "업로드를 취소했습니다."
                : (e as Error).message,
          });
        }
        setProgress({ done: n + 1, total: files.length });
      }
      const p = await api<Detail>(`projects/${projectId}`);
      setProject(p);
      setName(p.name);
      setUploadErrors(errors);
      if (!errors.length)
        setMessage(`${files.length}장의 사진을 비공개로 저장했습니다.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      abort.current = null;
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  async function updateImage(im: ProjectImage, v: unknown) {
    await action(async () => {
      await api(`projects/${pid}/images/${im.id}`, {
        method: "PATCH",
        body: JSON.stringify(v),
      });
    });
  }
  const coordinate = (e: React.PointerEvent) => {
    const r = imageArea.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
    };
  };
  const selectStart = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = coordinate(e);
    if (tool === "point") setSelection({ kind: "point", ...p });
    else {
      setDrag(p);
      setSelection(null);
    }
  };
  const selectMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const p = coordinate(e);
    setSelection({
      kind: "box",
      x: Math.min(drag.x, p.x),
      y: Math.min(drag.y, p.y),
      width: Math.abs(drag.x - p.x),
      height: Math.abs(drag.y - p.y),
    });
  };
  const hasMasks = included.some((i) => i.mask_url),
    masksReady = included.length > 0 && included.every((i) => i.mask_reviewed),
    live = project?.jobs.some(
      (j) => !["completed", "failed", "cancelled"].includes(j.state),
    );
  async function requestAnalysis(kind: "masks" | "poses") {
    await action(async () => {
      await post(`projects/${pid}/${kind}`, {
        idempotency_key: crypto.randomUUID(),
      });
      setMessage("분석 작업을 대기열에 등록했습니다.");
    });
  }
  return (
    <>
      <PageTitle
        title="새로운 차원의 시작."
        description="사진을 담고, 복원할 대상을 선택하세요."
      />
      <div className="mode-toggle" aria-label="복원 방식">
        <Link
          className={mode === "object" ? "active" : ""}
          href="/reconstruct/new?mode=object"
        >
          <Box size={19} />
          <span>
            Object Mesh<small>객체만 3D로 복원</small>
          </span>
        </Link>
        <Link
          className={mode === "scene" ? "active" : ""}
          href="/reconstruct/new?mode=scene"
        >
          <Globe2 size={19} />
          <span>
            Full Scene Mesh<small>장면 전체를 3D로 복원</small>
          </span>
        </Link>
      </div>
      {project && (
        <p className="mode-change-hint">
          유형을 변경하면 새 프로젝트로 시작합니다. 현재 프로젝트는 대시보드에
          저장되어 있습니다.
        </p>
      )}
      <nav className="creation-steps" aria-label="제작 단계">
        {steps.map((s, i) => (
          <button
            key={s}
            className={step === i ? "active" : step > i ? "passed" : ""}
            aria-current={step === i ? "step" : undefined}
            onClick={() => setStep(i)}
            disabled={!project && i > 0}
          >
            <span>{step > i ? <Check size={12} /> : i + 1}</span>
            {s}
          </button>
        ))}
      </nav>
      {error && (
        <div className="notice error" role="alert">
          <AlertCircle size={17} />
          {error}
        </div>
      )}
      {message && (
        <div className="notice success" role="status">
          <CheckCircle2 size={17} />
          {message}
        </div>
      )}
      <div className="creation-layout">
        <section className="creation-main">
          {step === 0 && (
            <>
              <div className="panel-title">
                <div>
                  <h2>
                    {mode === "object"
                      ? "복원할 사물의 사진을 올려주세요."
                      : "공간을 담은 사진을 올려주세요."}
                  </h2>
                  <p>
                    {mode === "object"
                      ? "1–200장의 JPEG, PNG, WebP 사진을 사용할 수 있습니다."
                      : "겹치는 여러 시점이 필요합니다. 20장 이상을 권장합니다."}
                  </p>
                </div>
                <span className="subtle-badge">{images.length} / 200</span>
              </div>
              <label className="field">
                프로젝트 이름
                <input
                  value={name}
                  maxLength={80}
                  placeholder={
                    mode === "object"
                      ? "예: 작업실의 스니커즈"
                      : "예: 오후의 거실"
                  }
                  disabled={!!project}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              {!project && mode === "object" && (
                <fieldset className="capture-choice">
                  <legend>촬영 방식</legend>
                  <label>
                    <input
                      type="radio"
                      name="capture"
                      checked={capture === "camera_orbit"}
                      onChange={() => setCapture("camera_orbit")}
                    />
                    <span>
                      고정된 사물, 이동하는 카메라
                      <small>사물과 배경은 그대로 두고 촬영</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="capture"
                      checked={capture === "turntable"}
                      onChange={() => setCapture("turntable")}
                    />
                    <span>
                      고정 카메라, 회전하는 사물
                      <small>턴테이블 · 포즈 정합 미검증으로 생성 제한</small>
                    </span>
                  </label>
                </fieldset>
              )}
              {capture === "turntable" && (
                <div className="notice warning">
                  <AlertCircle size={16} />
                  <span>
                    턴테이블은 배경에 카메라 정합이 고정될 수 있습니다. 객체
                    중심 정합 검증 전에는 분석과 생성이 차단됩니다.
                  </span>
                </div>
              )}
              <input
                ref={fileInput}
                className="sr-only"
                aria-label="프로젝트 사진 업로드"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => void upload(Array.from(e.target.files ?? []))}
              />
              <button
                className="upload-zone"
                disabled={busy || live}
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!busy && !live)
                    void upload(Array.from(e.dataTransfer.files));
                }}
              >
                <span className="upload-zone-icon">
                  <ImagePlus size={29} strokeWidth={1.3} />
                </span>
                <h3>
                  {busy
                    ? `사진 업로드 중 ${progress.done} / ${progress.total}`
                    : "사진을 여기에 놓아주세요."}
                </h3>
                <p>또는 클릭하여 파일 선택</p>
                <small>JPG · PNG · WEBP / 파일당 16MB / 최대 40MP</small>
              </button>
              {busy && (
                <div className="upload-progress">
                  <progress value={progress.done} max={progress.total || 1} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => abort.current?.abort()}
                  >
                    업로드 취소
                  </Button>
                </div>
              )}
              {uploadErrors.length > 0 && (
                <div className="upload-errors">
                  <h3>업로드하지 못한 사진 {uploadErrors.length}장</h3>
                  {uploadErrors.map((e, i) => (
                    <p key={i}>
                      {e.file.name}: {e.error}
                    </p>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => void upload(uploadErrors.map((e) => e.file))}
                  >
                    <RefreshCw size={14} />
                    실패한 사진 다시 업로드
                  </Button>
                </div>
              )}
              {images.length > 0 && (
                <>
                  <div className="photo-grid-heading">
                    <strong>
                      업로드 {project?.input_image_count}장{" "}
                      <span>· 사용할 사진 {included.length}장</span>
                    </strong>
                    <p>
                      제외한 사진도 원본 업로드 수와 요금 구간에 포함됩니다.
                    </p>
                  </div>
                  <div className="image-grid">
                    {images.map((im, i) => (
                      <div
                        className={`image-card ${im.excluded ? "excluded" : ""}`}
                        key={im.id}
                      >
                        <div className="image-thumb">
                          <img src={im.url} alt={im.filename} loading="lazy" />
                          <button
                            aria-pressed={!im.excluded}
                            aria-label={`${im.filename} ${im.excluded ? "포함" : "제외"}`}
                            disabled={busy || live}
                            onClick={() =>
                              void updateImage(im, { excluded: !im.excluded })
                            }
                          >
                            {!im.excluded && <Check size={13} />}
                          </button>
                          <span>{String(i + 1).padStart(2, "0")}</span>
                        </div>
                        <div className="image-caption">
                          <span>{im.filename}</span>
                          <div>
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={!i || busy || live}
                              aria-label={`${im.filename} 앞으로 이동`}
                              onClick={() =>
                                void updateImage(im, { position: i - 1 })
                              }
                            >
                              <ArrowUp size={12} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={i === images.length - 1 || busy || live}
                              aria-label={`${im.filename} 뒤로 이동`}
                              onClick={() =>
                                void updateImage(im, { position: i + 1 })
                              }
                            >
                              <ArrowDown size={12} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="upload-guidance">
                <ShieldCheck size={16} />
                <p>
                  {mode === "scene"
                    ? "장면 모드에서는 배경을 삭제하거나 SAM2 마스크를 적용하지 않습니다."
                    : "사진은 비공개로 보관됩니다. 다음 단계에서 SAM2로 원하는 사물을 선택하세요."}
                </p>
              </div>
            </>
          )}
          {mode === "object" && step === 1 && (
            <>
              <div className="panel-title">
                <div>
                  <h2>주인공이 될 사물을 선택하세요.</h2>
                  <p>
                    기준 사진에 박스나 포인트를 지정한 뒤 실제 마스크를
                    검토합니다.
                  </p>
                </div>
              </div>
              {ref ? (
                <>
                  <div className="selection-tools">
                    <Button
                      size="sm"
                      variant={tool === "box" ? "default" : "outline"}
                      aria-pressed={tool === "box"}
                      onClick={() => setTool("box")}
                    >
                      <ScanLine size={15} />
                      박스
                    </Button>
                    <Button
                      size="sm"
                      variant={tool === "point" ? "default" : "outline"}
                      aria-pressed={tool === "point"}
                      onClick={() => setTool("point")}
                    >
                      <MousePointer2 size={15} />
                      포인트
                    </Button>
                    <span>기준 사진: {ref.filename}</span>
                  </div>
                  <div className="selection-stage">
                    <div
                      className="selection-photo"
                      ref={imageArea}
                      onPointerDown={selectStart}
                      onPointerMove={selectMove}
                      onPointerUp={(e) => {
                        selectMove(e);
                        setDrag(null);
                      }}
                    >
                      <img
                        src={ref.url}
                        alt={`기준 사진 ${ref.filename}`}
                        draggable={false}
                      />
                      {selection && (
                        <span
                          className={`target-overlay ${selection.kind}`}
                          style={
                            selection.kind === "box"
                              ? {
                                  left: `${selection.x * 100}%`,
                                  top: `${selection.y * 100}%`,
                                  width: `${selection.width * 100}%`,
                                  height: `${selection.height * 100}%`,
                                }
                              : {
                                  left: `${selection.x * 100}%`,
                                  top: `${selection.y * 100}%`,
                                }
                          }
                        />
                      )}
                    </div>
                  </div>
                  <div className="reference-strip">
                    {included.map((im) => (
                      <button
                        key={im.id}
                        className={ref.id === im.id ? "selected" : ""}
                        aria-label={`${im.filename} 기준 사진으로 선택`}
                        aria-pressed={ref.id === im.id}
                        onClick={() => {
                          setReference(im.id);
                          setSelection(null);
                        }}
                      >
                        <img src={im.url} alt={im.filename} />
                      </button>
                    ))}
                  </div>
                  <details className="coordinate-editor">
                    <summary>키보드로 선택 영역 입력</summary>
                    <p>이미지 좌표: 왼쪽 위 0부터 오른쪽 아래 1까지</p>
                    <div>
                      {[
                        "x",
                        "y",
                        ...(tool === "box" ? ["width", "height"] : []),
                      ].map((k) => (
                        <label className="field" key={k}>
                          {
                            (
                              {
                                x: "가로 위치",
                                y: "세로 위치",
                                width: "너비",
                                height: "높이",
                              } as Record<string, string>
                            )[k]
                          }
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step=".01"
                            value={
                              selection
                                ? ((
                                    selection as unknown as Record<
                                      string,
                                      number
                                    >
                                  )[k] ?? "")
                                : ""
                            }
                            onChange={(e) =>
                              setSelection({
                                ...(selection?.kind === tool
                                  ? selection
                                  : tool === "box"
                                    ? {
                                        kind: "box",
                                        x: 0,
                                        y: 0,
                                        width: 0.5,
                                        height: 0.5,
                                      }
                                    : { kind: "point", x: 0.5, y: 0.5 }),
                                [k]: +e.target.value,
                              } as ObjectSelection)
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </details>
                  <div className="selection-actions">
                    <Button
                      variant="outline"
                      disabled={!selection || busy || live}
                      onClick={() =>
                        void action(async () => {
                          await post(`projects/${pid}/target`, {
                            image_id: ref.id,
                            selection,
                          });
                          setMessage("선택 영역을 저장했습니다.");
                        })
                      }
                    >
                      <Check size={15} />
                      선택 저장
                    </Button>
                    <Button
                      disabled={!project?.target_selection || busy || live}
                      onClick={() => void requestAnalysis("masks")}
                    >
                      <Layers size={15} />
                      {hasMasks ? "마스크 다시 분석" : "SAM2 마스크 분석"}
                    </Button>
                  </div>
                  <section className="mask-review">
                    <div className="section-heading">
                      <h3>사진별 마스크 검토</h3>
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={showMask}
                          onChange={(e) => setShowMask(e.target.checked)}
                        />
                        마스크 겹쳐보기
                      </label>
                    </div>
                    {hasMasks ? (
                      <div className="image-grid mask-grid">
                        {included.map((im) => (
                          <div className="mask-card" key={im.id}>
                            <div className="mask-image">
                              <img src={im.url} alt={im.filename} />
                              {showMask && im.mask_url && (
                                <span
                                  style={{
                                    maskImage: `url(${im.mask_url})`,
                                    WebkitMaskImage: `url(${im.mask_url})`,
                                  }}
                                />
                              )}
                            </div>
                            <p>{im.filename}</p>
                            <Button
                              variant={im.mask_reviewed ? "outline" : "default"}
                              size="sm"
                              disabled={!im.mask_url || busy || live}
                              onClick={() =>
                                void action(async () => {
                                  await api(`projects/${pid}/masks/${im.id}`, {
                                    method: "PATCH",
                                    body: JSON.stringify({
                                      reviewed: !im.mask_reviewed,
                                    }),
                                  });
                                })
                              }
                            >
                              <Check size={13} />
                              {im.mask_reviewed ? "검토 완료" : "마스크 승인"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={busy || live}
                              onClick={() =>
                                void updateImage(im, { excluded: true })
                              }
                            >
                              사진 제외
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="inline-empty">
                        <Layers size={27} strokeWidth={1.2} />
                        <p>아직 실제 마스크 결과가 없습니다.</p>
                        <small>SAM2 작업자가 반환한 마스크만 표시합니다.</small>
                      </div>
                    )}
                  </section>
                </>
              ) : (
                <div className="inline-empty">
                  <ImagePlus size={26} />
                  <p>먼저 사진을 업로드하세요.</p>
                </div>
              )}
            </>
          )}
          {step === configureIndex && (
            <>
              <div className="panel-title">
                <div>
                  <h2>
                    {mode === "scene"
                      ? "장면 전체 복원 설정"
                      : "복원 설정을 확인하세요."}
                  </h2>
                  <p>
                    {mode === "scene"
                      ? "배경을 유지한 원본 이미지로 카메라 정합을 검증합니다."
                      : "검토한 마스크와 실제 카메라 결과를 사용합니다."}
                  </p>
                </div>
              </div>
              {mode === "scene" &&
                project?.input_image_count &&
                sceneWarnings(project.input_image_count).map((w) => (
                  <div key={w} className="notice warning">
                    <AlertCircle size={17} />
                    {w}
                  </div>
                ))}
              <div className="configuration-grid">
                <div>
                  <span>원본 업로드 수</span>
                  <strong>
                    {project?.input_image_count ?? 0}
                    <small>장</small>
                  </strong>
                </div>
                <div>
                  <span>사용할 사진</span>
                  <strong>
                    {included.length}
                    <small>장</small>
                  </strong>
                </div>
                <div>
                  <span>검증된 대표 시점</span>
                  <strong>
                    {project?.pose_report?.selected_view_ids.length ??
                      (project?.input_image_count === 1 && mode === "object"
                        ? 1
                        : "—")}
                    <small>개</small>
                  </strong>
                </div>
              </div>
              <div className="pipeline-summary">
                <Settings2 size={24} />
                <div>
                  <small>복원 파이프라인</small>
                  <h3>
                    {project?.input_image_count
                      ? {
                          pixal3d: "Pixal3D",
                          object_aware_loss: "Object-Aware Loss",
                          gaussian_wrapping: "Gaussian Wrapping",
                        }[routeModel(mode, project.input_image_count)]
                      : "사진 업로드 후 결정"}
                  </h3>
                  <p>
                    {mode === "scene"
                      ? "COLMAP → 전체 장면 학습 → 메시 추출 → 텍스처 정제 → UV GLB"
                      : project?.input_image_count === 1
                        ? "SAM2 → 단일 시점 추론 → PBR GLB"
                        : project && project.input_image_count <= 20
                          ? "SAM2 → 보정된 카메라와 2/4/6/8개 대표 시점 → PBR GLB"
                          : "SAM2 → COLMAP → 2DGS → TSDF 메시 → UV 베이킹 → GLB"}
                  </p>
                </div>
              </div>
              {!(mode === "object" && project?.input_image_count === 1) && (
                <div className="camera-qa">
                  <h3>카메라 정합 확인</h3>
                  <p>
                    {project?.pose_report
                      ? `${project.pose_report.registered} / ${project.pose_report.candidate_count}장 정합 · 재투영 오차 ${project.pose_report.reprojection_error.toFixed(3)}px`
                      : "아직 측정된 카메라 결과가 없습니다. 임의의 포즈로 제작하지 않습니다."}
                  </p>
                  <Button
                    variant="outline"
                    disabled={
                      busy ||
                      live ||
                      !included.length ||
                      (mode === "object" && !masksReady)
                    }
                    onClick={() => void requestAnalysis("poses")}
                  >
                    <ScanLine size={15} />
                    카메라 분석 요청
                  </Button>
                </div>
              )}
              <div className="quote-box">
                <h3>{educationMode() ? "연구용 생성" : "제작 요금"}</h3>
                <div>
                  <span>
                    {mode === "object" ? "객체 복원" : "장면 복원"} ·{" "}
                    {project?.input_image_count
                      ? pricingTier(project.input_image_count).key
                      : "—"}
                    장 구간
                  </span>
                  <strong>
                    {educationMode() ? "과금 없음" : "서버 견적 필요"}
                  </strong>
                </div>
                <p>
                  {educationMode()
                    ? "업로드와 SAM2 마스크 검토를 먼저 사용할 수 있습니다. 일반 입력의 3D 생성은 GPU·입력 경로·품질 검증 중이며, 결제를 요구하지 않습니다."
                    : "가격은 관리자 구성에서 불러옵니다. GPU 실측 검증과 모델 가용성이 확인되기 전에는 결제하지 않습니다."}
                </p>
                <Button
                  disabled={
                    educationMode() ||
                    busy ||
                    health?.payments_mode !== "test" ||
                    !health.real_gpu_validated
                  }
                  onClick={() =>
                    void action(async () => {
                      const order = await post<{ id: string; amount: number }>(
                        "orders",
                        {
                          kind: "generation",
                          project_id: pid,
                          idempotency_key: crypto.randomUUID(),
                        },
                      );
                      router.push(`/billing?order=${order.id}`);
                    })
                  }
                >
                  <LockKeyhole size={15} />
                  {educationMode()
                    ? "3D 생성 검증 중"
                    : "견적 확인 및 테스트 결제"}
                </Button>
              </div>
            </>
          )}
          {step !== processIndex &&
            project?.jobs[0] &&
            project.jobs[0].kind !== "generation" &&
            project.jobs[0].state !== "completed" && (
              <JobTracker jobId={project.jobs[0].id} onComplete={load} />
            )}
          {step === processIndex && (
            <>
              <div className="panel-title">
                <div>
                  <h2>사진이 입체가 되는 과정.</h2>
                  <p>각 단계의 실제 상태와 로그를 확인하세요.</p>
                </div>
              </div>
              {project?.jobs[0] ? (
                <JobTracker jobId={project.jobs[0].id} onComplete={load} />
              ) : (
                <div className="inline-empty">
                  <Box size={31} strokeWidth={1.1} />
                  <h3>아직 등록된 작업이 없습니다.</h3>
                  <p>
                    입력 검증과 서버 견적 확인 후 작업을 등록할 수 있습니다.
                  </p>
                </div>
              )}
              {project?.artifacts[0] && (
                <Button asChild>
                  <Link href={`/projects/${pid}`}>
                    완성된 3D 모델 보기 <ArrowRight size={16} />
                  </Link>
                </Button>
              )}
            </>
          )}
          <div className="creation-footer">
            <Button
              variant="ghost"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={15} />
              이전
            </Button>
            <span>
              {step + 1} / {steps.length}
            </span>
            <Button
              disabled={
                busy ||
                step === processIndex ||
                (step === 0 && !included.length) ||
                (mode === "object" && step === 1 && !masksReady)
              }
              onClick={() => setStep(step + 1)}
            >
              다음 단계 <ArrowRight size={15} />
            </Button>
          </div>
        </section>
        <aside className="creation-preview">
          <div className="panel-title">
            <h2>3D 미리보기</h2>
            <span className="subtle-badge">공개 예제</span>
          </div>
          <Viewer showControls />
          <div className="preview-caption">
            <Box size={16} />
            <p>
              아직 생성된 결과가 없습니다.
              <br />
              <span>표시된 모델은 뷰어 체험용 공개 예제입니다.</span>
            </p>
          </div>
          <div className="preview-summary">
            <div>
              <span>선택 모드</span>
              <strong>
                {mode === "object" ? "Object Mesh" : "Full Scene Mesh"}
              </strong>
            </div>
            <div>
              <span>원본 업로드</span>
              <strong>{project?.input_image_count ?? 0}장</strong>
            </div>
            <div>
              <span>출력</span>
              <strong>UV 텍스처 GLB</strong>
            </div>
            <div>
              <span>개인정보</span>
              <strong>
                <LockKeyhole size={12} />
                비공개
              </strong>
            </div>
          </div>
          <div className="preview-status">
            <span className="status-dot" />
            <span>
              {health?.real_gpu_validated
                ? "모델 검증 확인됨"
                : "GPU 모델 실측 검증 대기"}
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}
