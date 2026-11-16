import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  importFilename,
  privateImportResultSchema,
  privateImportSessionSchema,
  type PrivateModelImportAdapter,
} from "./private-model-import";

type ImportResult = ReturnType<typeof privateImportResultSchema.parse>;
type Stage = "validating" | "uploading" | "finalizing";
const progressCopy: Record<Stage, string> = {
  validating: "저장할 파일을 확인하고 있습니다.",
  uploading: "편집본을 비공개로 업로드하고 있습니다.",
  finalizing: "프로젝트 저장 결과를 확인하고 있습니다.",
};

export function PrivateModelImportPanel({
  name,
  sourceKey,
  createModel,
  adapter,
  unavailable,
  onBusyChange,
  onSaved,
}: {
  name: string;
  sourceKey: string;
  createModel: () => Blob | undefined;
  adapter?: PrivateModelImportAdapter;
  unavailable: boolean;
  onBusyChange: (busy: boolean) => void;
  onSaved: () => void;
}) {
  const [fileName, setFileName] = useState(name);
  const [rights, setRights] = useState(false);
  const [stage, setStage] = useState<Stage>();
  const [failure, setFailure] = useState<string>();
  const [result, setResult] = useState<{
    input: string;
    value: ImportResult;
  }>();
  const attempt = useRef<{ input: string; id: string }>(undefined);
  const locked = useRef(false);
  const filename = importFilename(fileName);
  const input = JSON.stringify([sourceKey, filename]);
  const saved = result?.input === input ? result.value : undefined;
  const failed = failure === input;

  async function submit() {
    if (
      !adapter ||
      !filename ||
      !rights ||
      unavailable ||
      locked.current ||
      saved
    )
      return;
    const model = createModel();
    if (!model) return;
    locked.current = true;
    onBusyChange(true);
    setStage("validating");
    setFailure(undefined);
    if (attempt.current?.input !== input)
      attempt.current = { input, id: crypto.randomUUID() };
    try {
      const session = privateImportSessionSchema.parse(
        await adapter.validate({
          request_id: attempt.current.id,
          file_name: filename,
          byte_length: model.size,
          content_type: "model/gltf-binary",
          rights_confirmed: true,
        }),
      );
      if (session.upload_required) {
        setStage("uploading");
        await adapter.upload(session.session_id, model);
      }
      setStage("finalizing");
      const value = privateImportResultSchema.parse(
        await adapter.finalize(session.session_id),
      );
      setResult({ input, value });
      onSaved();
    } catch {
      setFailure(input);
    } finally {
      setStage(undefined);
      locked.current = false;
      onBusyChange(false);
    }
  }
  return (
    <section
      className="private-model-import"
      aria-labelledby="private-model-import-title"
    >
      <h2 id="private-model-import-title">개인 프로젝트로 저장</h2>
      {!adapter ? (
        <p>
          개인 프로젝트 저장은 준비 중입니다. 편집본은 GLB로 내려받을 수
          있습니다.
        </p>
      ) : saved ? (
        <>
          <p role="status">편집본을 비공개 프로젝트에 저장했습니다.</p>
          <Button asChild variant="outline">
            <Link href={`/projects/${saved.project_id}`}>
              {saved.can_publish
                ? "프로젝트에서 게시 옵션 확인"
                : "개인 프로젝트 열기"}
            </Link>
          </Button>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label className="field">
            저장할 파일 이름
            <input
              value={fileName}
              maxLength={100}
              required
              disabled={Boolean(stage)}
              onChange={(e) => setFileName(e.target.value)}
            />
          </label>
          {fileName && !filename && (
            <p>
              파일 이름은 경로 문자 없이 확장자를 포함해 100자 이내로 입력해
              주세요.
            </p>
          )}
          <label className="checkbox">
            <input
              type="checkbox"
              checked={rights}
              required
              disabled={Boolean(stage)}
              onChange={(e) => setRights(e.target.checked)}
            />
            <span>이 모델을 저장하고 이용할 권한을 보유하고 있습니다.</span>
          </label>
          <p>
            현재 편집본을 비공개 프로젝트에 저장합니다. 게시 여부는 프로젝트에서
            선택할 수 있습니다.
          </p>
          {stage && <p role="status">{progressCopy[stage]}</p>}
          {failed && (
            <p role="alert">
              저장 결과를 확인하지 못했습니다. 다시 시도하거나 현재 편집본을
              내려받을 수 있습니다.
            </p>
          )}
          <Button
            type="submit"
            disabled={Boolean(stage) || unavailable || !filename || !rights}
          >
            {stage
              ? "저장 중…"
              : failed
                ? "개인 저장 다시 시도"
                : "비공개로 저장"}
          </Button>
        </form>
      )}
    </section>
  );
}
