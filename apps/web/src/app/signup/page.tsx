import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { configured } from "@/lib/supabase/server";
export default function Page() {
  return (
    <Suspense fallback={<p>인증 화면 준비 중…</p>}>
      <AuthForm kind="signup" configured={configured()} />
    </Suspense>
  );
}
