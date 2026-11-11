"use client";
import Link from "next/link";
import { putDraft } from "@/features/create/upload-draft";
import { educationMode } from "@/lib/project-purpose";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  Box,
  Store,
  CreditCard,
  Settings,
  Menu,
  ArrowUpRight,
  BookOpen,
  LogOut,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Brand } from "./brand";
import { Button } from "./ui/button";
import { NavigationSheet } from "./ui/sheet";
import { browserClient } from "@/lib/supabase/client";
const links = [
  { href: "/dashboard", label: "내 프로젝트", icon: LayoutDashboard },
  { href: "/create", label: "새로 만들기", icon: Plus },
  { href: "/assets", label: "내 에셋", icon: Box },
  { href: "/marketplace", label: "에셋 마켓", icon: Store },
  {
    href: "/billing",
    label: educationMode() ? "이용 안내" : "사용량 및 결제",
    icon: CreditCard,
  },
  { href: "/account", label: "설정", icon: Settings },
];
export function WorkspaceShell({
  children,
  user,
  admin = false,
}: {
  children: React.ReactNode;
  user: { email?: string; name?: string };
  admin?: boolean;
}) {
  const path = usePathname(),
    router = useRouter();
  const title =
    links.find((l) => path.startsWith(l.href))?.label ??
    (path.startsWith("/projects/") ? "프로젝트" : "워크스페이스");
  const sidebar = (
    <>
      <Brand />
      <div className="workspace-switch">
        <span>O</span>
        <div>
          개인 워크스페이스<small>나만의 3D 작업실</small>
        </div>
        <ChevronRight size={14} />
      </div>
      <p className="sidebar-label">내 작업</p>
      <nav className="workspace-nav" aria-label="워크스페이스 탐색">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={path.startsWith(l.href) ? "active" : ""}
            aria-current={path.startsWith(l.href) ? "page" : undefined}
          >
            <l.icon size={18} />
            {l.label}
            {l.href === "/create" && <span className="key-hint">＋</span>}
          </Link>
        ))}
        {admin && (
          <Link href="/admin">
            <Activity size={18} />
            운영 관리
          </Link>
        )}
      </nav>
      <div className="sidebar-bottom">
        <Link className="sidebar-guide" href="/docs">
          <BookOpen size={19} />
          <div>
            좋은 사진에서, 좋은 입체로.
            <small>
              촬영 가이드 살펴보기 <ArrowUpRight size={11} />
            </small>
          </div>
        </Link>
        <div className="worker-state">
          <span className="status-dot" />
          <div>
            나의 3D 작업실<small>완성한 모델을 한곳에서</small>
          </div>
        </div>
        <div className="sidebar-user">
          <span>{(user.name || user.email || "O")[0].toUpperCase()}</span>
          <div>
            <strong>{user.name || "내 계정"}</strong>
            <small>{user.email}</small>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="로그아웃"
            onClick={() =>
              void browserClient()
                .auth.signOut()
                .then(() => {
                  putDraft([]);
                  router.push("/");
                  router.refresh();
                })
            }
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </>
  );
  return (
    <div className="workspace">
      <aside className="workspace-sidebar">{sidebar}</aside>
      <div className="workspace-content">
        <header className="workspace-header">
          <NavigationSheet
            trigger={
              <Button
                className="mobile-nav-trigger"
                variant="ghost"
                size="icon"
                aria-label="워크스페이스 메뉴 열기"
              >
                <Menu size={21} />
              </Button>
            }
          >
            {sidebar}
          </NavigationSheet>
          <span>워크스페이스</span>
          <ChevronRight size={13} />
          <strong>{title}</strong>
          <div className="workspace-header-right">
            <span className="test-label">내 작업</span>
            <Link href="/docs">
              도움말 <ArrowUpRight size={13} />
            </Link>
          </div>
        </header>
        <main id="main" className="workspace-page">
          {children}
        </main>
      </div>
    </div>
  );
}
