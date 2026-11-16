import {
  prepareEditorView,
  type MeshEditOperation,
} from "@objectscan/mesh-editor";
let original: Uint8Array | null = null;
self.onmessage = async (
  event: MessageEvent<{
    id: number;
    source?: ArrayBuffer;
    commands: MeshEditOperation[];
  }>,
) => {
  const { id, source, commands } = event.data;
  try {
    const candidate = source ? new Uint8Array(source) : original;
    if (!candidate) throw Error("모델을 먼저 불러와 주세요.");
    const result = await prepareEditorView(candidate, commands);
    if (source) original = candidate;
    self.postMessage(
      { id, ...result },
      {
        transfer: [
          result.bytes.buffer,
          ...(result.previewBytes ? [result.previewBytes.buffer] : []),
        ],
      },
    );
  } catch (e) {
    self.postMessage({
      id,
      error: e instanceof Error ? e.message : "모델을 처리하지 못했습니다.",
    });
  }
};
