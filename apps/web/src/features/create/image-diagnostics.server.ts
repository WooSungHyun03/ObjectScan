// Node-only (sharp): must not be imported from client components. No env, DB or network.
import sharp from "sharp";
export const DIAGNOSTICS_MAX_BYTES = 16 * 1024 * 1024;
export const DIAGNOSTICS_MAX_PIXELS = 40_000_000;
// Reference values from sharp's own stats; null means "could not check" and must not block the upload.
export async function diagnoseImage(
  bytes: Uint8Array,
): Promise<{ sharpness: number; entropy: number } | null> {
  if (bytes.length > DIAGNOSTICS_MAX_BYTES) return null;
  try {
    const { sharpness, entropy } = await sharp(bytes, {
      limitInputPixels: DIAGNOSTICS_MAX_PIXELS,
      failOn: "warning",
    }).stats();
    return { sharpness, entropy };
  } catch {
    return null;
  }
}
