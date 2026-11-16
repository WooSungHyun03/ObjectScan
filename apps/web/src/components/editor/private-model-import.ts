import { z } from "zod";

export type PrivateModelImportInput = {
  request_id: string;
  file_name: string;
  byte_length: number;
  content_type: "model/gltf-binary";
  rights_confirmed: true;
};

export const privateImportSessionSchema = z.object({
  session_id: z.uuid(),
  upload_required: z.boolean(),
});

export const privateImportResultSchema = z.object({
  artifact_id: z.uuid(),
  project_id: z.uuid(),
  can_publish: z.boolean(),
});

export type PrivateModelImportAdapter = {
  validate: (
    input: PrivateModelImportInput,
  ) => Promise<z.infer<typeof privateImportSessionSchema>>;
  upload: (sessionId: string, model: Blob) => Promise<void>;
  finalize: (
    sessionId: string,
  ) => Promise<z.infer<typeof privateImportResultSchema>>;
};

export function importFilename(value: string) {
  const name = value.trim();
  if (!name || /[/\\\p{Cc}]/u.test(name)) return undefined;
  const filename = /\.glb$/i.test(name) ? name : `${name}.glb`;
  return filename.length <= 100 ? filename : undefined;
}
