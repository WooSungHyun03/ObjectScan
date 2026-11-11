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
    if (source) original = new Uint8Array(source);
    if (!original) throw Error("모델을 먼저 불러와 주세요.");
    const result = await prepareEditorView(original, commands);
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
