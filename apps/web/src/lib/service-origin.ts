// Deployment-controlled origins only; never trust a caller-supplied Host for email/payment redirects.
export function serviceOrigin() {
  const preview =
    process.env.VERCEL_ENV === "preview" ? process.env.VERCEL_URL : undefined;
  if (preview && /^[a-z0-9-]+\.vercel\.app$/i.test(preview))
    return `https://${preview}`;
  return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000")
    .origin;
}
