import { NextResponse } from "next/server";
import { userClient } from "@/lib/supabase/server";
export async function GET(req: Request) {
  const url = new URL(req.url),
    appOrigin =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : url.origin),
    code = url.searchParams.get("code"),
    raw = url.searchParams.get("next") ?? "/dashboard",
    next =
      raw.startsWith("/") &&
      !raw.startsWith("//") &&
      !raw.includes("\\") &&
      !/[\x00-\x1f]/.test(raw)
        ? raw
        : "/dashboard";
  try {
    const client = await userClient();
    if (code) {
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, appOrigin));
    }
  } catch {}
  return NextResponse.redirect(
    new URL("/login?error=confirmation_failed", appOrigin),
  );
}
