"use client";
import { customerError } from "@/lib/customer-copy";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Mail,
  LockKeyhole,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { browserClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safe-next";
import { Brand } from "./brand";
import { Button } from "./ui/button";
const RESEND_SECONDS = 60;
const RECOVERY_EMAIL_KEY = "objectscan.recoveryEmail";
const linkErrors: Record<string, string> = {
  confirmation_failed:
    "확인 링크가 만료되었거나 이미 사용되었습니다. 로그인해 보시고, 확인이 안 됐다면 확인 메일을 다시 받아 주세요.",
  link_expired:
    "재설정 링크가 만료되었거나 이미 사용되었습니다. 새 링크를 받아 주세요.",
};
// Auth errors meaning the email link/session is no longer usable.
const expiredSession = (e: { code?: string; name?: string }) =>
  e.name === "AuthSessionMissingError" ||
  [
    "session_not_found",
    "session_expired",
    "otp_expired",
    "flow_state_expired",
  ].includes(e.code ?? "");
const storage = {
  get: () => {
    try {
      return localStorage.getItem(RECOVERY_EMAIL_KEY) ?? "";
    } catch {
      return "";
    }
  },
  set: (v: string) => {
    try {
      localStorage.setItem(RECOVERY_EMAIL_KEY, v);
    } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem(RECOVERY_EMAIL_KEY);
    } catch {}
  },
};
export function AuthForm({
  kind,
  configured,
}: {
  kind: "login" | "signup" | "forgot" | "reset";
  configured: boolean;
}) {
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [waiting, setWaiting] = useState(false),
    [resendAt, setResendAt] = useState(0),
    [now, setNow] = useState(0),
    [linkExpired, setLinkExpired] = useState(false);
  const router = useRouter(),
    search = useSearchParams(),
    linkError = linkErrors[search.get("error") ?? ""] ?? "",
    next = safeNext(search.get("next"));
  useEffect(() => {
    // Keep the email typed before an expired recovery link sent the user back.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount (no SSR mismatch)
    if (kind === "forgot") setEmail((v) => v || storage.get());
  }, [kind]);
  // Deadline-based so throttled background tabs still show the right time.
  const cooldown = Math.max(0, Math.ceil((resendAt - now) / 1000));
  useEffect(() => {
    if (!resendAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [resendAt]);
  const startCooldown = () => {
    const t = Date.now();
    setNow(t);
    setResendAt(t + RESEND_SECONDS * 1000);
  };
  async function resend() {
    setError("");
    try {
      const { error } = await browserClient().auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      setMessage(
        "확인 메일을 다시 보냈습니다. 받은편지함과 스팸함을 확인하세요.",
      );
    } catch (e) {
      setError(
        customerError((e as { code?: string }).code, (e as Error).message),
      );
    } finally {
      startCooldown();
    }
  }
  const titles = {
    login: "로그인하고 작업을 이어가세요.",
    signup: "내 3D 작업실을 만들어보세요.",
    forgot: "비밀번호를 재설정하세요.",
    reset: "새 비밀번호를 설정하세요.",
  };
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    setLinkExpired(false);
    try {
      const client = browserClient();
      if (kind === "signup") {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.push(next);
          router.refresh();
        } else {
          setWaiting(true);
          startCooldown();
          setMessage("이메일의 확인 링크를 열어 가입을 완료하세요.");
        }
      } else if (kind === "login") {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(next);
        router.refresh();
      } else if (kind === "forgot") {
        storage.set(email);
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setMessage(
          "가입된 계정이라면 재설정 안내를 보냈습니다. 이메일을 확인하세요.",
        );
      } else {
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        storage.clear();
        setMessage("새 비밀번호를 저장했습니다.");
        router.push(next);
        router.refresh();
      }
    } catch (e) {
      const err = e as { code?: string; name?: string; message?: string };
      if (kind === "login" && err.code === "email_not_confirmed") {
        setWaiting(true);
        setError(customerError(err.code));
      } else if (kind === "reset" && expiredSession(err)) {
        setLinkExpired(true);
        setError(linkErrors.link_expired);
      } else setError(customerError(err.code, err.message));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Brand />
        <div>
          <span className="section-kicker">나의 3D 작업실</span>
          <h2>
            사진 한 장부터.
            <br />
            입체적인 작업까지.
          </h2>
          <p>
            사진에 담긴 질감과 형태를
            <br />
            당신만의 3D 에셋으로 이어가세요.
          </p>
          <Image
            className="auth-mascot"
            src="/brand/mascot/work.webp"
            width={240}
            height={240}
            alt="작업을 준비하는 ObjectScan 곰"
          />
        </div>
        <span>사진과 모델은 비공개로 보관합니다.</span>
      </aside>
      <main id="main" className="auth-main">
        <Link href="/" className="auth-home">
          ← ObjectScan으로 돌아가기
        </Link>
        <div className="auth-card">
          <span className="auth-icon">
            <LockKeyhole size={24} />
          </span>
          <h1>{titles[kind]}</h1>
          <p>
            {kind === "login"
              ? "이메일로 내 작업실에 로그인하세요."
              : kind === "signup"
                ? "계정을 만들고 첫 번째 프로젝트를 준비하세요."
                : "안전하게 계정에 다시 접속하세요."}
          </p>
          {!configured && (
            <div className="notice warning">
              <AlertCircle size={16} />
              <span>
                인증 서비스 연결을 준비하고 있습니다. 현재 가입과 로그인을
                사용할 수 없습니다.
              </span>
            </div>
          )}
          {(error || linkError) && (
            <div role="alert" className="notice error">
              <AlertCircle size={16} />
              <span>{error || linkError}</span>
            </div>
          )}
          {linkExpired && (
            <Button asChild variant="outline" size="sm">
              <Link href="/forgot-password">새 재설정 링크 받기</Link>
            </Button>
          )}
          {message && (
            <div role="status" className="notice success">
              <CheckCircle2 size={16} />
              {message}
            </div>
          )}
          {waiting && (
            <div className="notice warning">
              <Mail size={16} />
              <span>
                확인을 마치기 전에는 작업실을 사용할 수 없습니다.{" "}
                {cooldown > 0
                  ? `${cooldown}초 후 확인 메일을 다시 받을 수 있습니다.`
                  : "메일이 오지 않았다면 다시 받아 보세요."}
              </span>
            </div>
          )}
          {waiting && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={cooldown > 0 || !email}
              onClick={() => void resend()}
            >
              확인 메일 다시 받기
            </Button>
          )}
          <form onSubmit={submit}>
            {kind === "signup" && (
              <label className="field">
                이름
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  name="name"
                  maxLength={80}
                />
              </label>
            )}
            {kind !== "reset" && (
              <label className="field">
                이메일
                <div className="input-icon">
                  <Mail size={16} />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    name="email"
                    spellCheck={false}
                    placeholder="you@example.com"
                  />
                </div>
              </label>
            )}
            {kind !== "forgot" && (
              <label className="field">
                비밀번호
                <div className="input-icon">
                  <LockKeyhole size={16} />
                  <input
                    required
                    type="password"
                    name="password"
                    minLength={8}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={
                      kind === "login" ? "current-password" : "new-password"
                    }
                    placeholder="8자 이상 입력하세요"
                  />
                </div>
              </label>
            )}
            {kind === "login" && (
              <Link className="forgot-link" href="/forgot-password">
                비밀번호를 잊으셨나요?
              </Link>
            )}
            <Button
              className="auth-submit"
              type="submit"
              disabled={!configured || busy}
            >
              {busy
                ? "처리 중…"
                : {
                    login: "로그인",
                    signup: "계정 만들기",
                    forgot: "재설정 이메일 받기",
                    reset: "새 비밀번호 저장",
                  }[kind]}
              <ArrowRight size={16} />
            </Button>
          </form>
          {kind === "login" ? (
            <p className="auth-switch">
              아직 계정이 없으신가요? <Link href="/signup">가입하기</Link>
            </p>
          ) : (
            <p className="auth-switch">
              이미 계정이 있으신가요? <Link href="/login">로그인</Link>
            </p>
          )}
          <p className="auth-legal">
            프로젝트와 원본 파일은 기본 비공개로 보관됩니다.
            <br />
            <Link href="/docs#privacy">데이터·저작권 안내</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
