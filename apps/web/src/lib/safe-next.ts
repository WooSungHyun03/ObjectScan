// Only same-origin absolute paths may be used as a post-auth redirect.
export function safeNext(raw: string | null, fallback = "/dashboard") {
  return raw &&
    raw.startsWith("/") &&
    !raw.startsWith("//") &&
    !raw.includes("\\") &&
    !/[\x00-\x1f]/.test(raw)
    ? raw
    : fallback;
}
