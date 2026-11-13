import { serviceOrigin } from "@/lib/service-origin";
import { NextResponse } from "next/server";
import { userClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";
export async function GET(req: Request) {
  const url = new URL(req.url),
    appOrigin = serviceOrigin(),
    code = url.searchParams.get("code"),
    next = safeNext(url.searchParams.get("next"));
  try {
    const client = await userClient();
    if (code) {
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, appOrigin));
    }
  } catch {}
  // An expired recovery link goes back to requesting a new one, not to login.
  return NextResponse.redirect(
    new URL(
      next === "/reset-password"
        ? "/forgot-password?error=link_expired"
        : "/login?error=confirmation_failed",
      appOrigin,
    ),
  );
}
