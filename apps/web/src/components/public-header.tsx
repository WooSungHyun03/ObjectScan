import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "./ui/button";
import { NavigationSheet } from "./ui/sheet";
function Links() {
  return (
    <>
      <Link href="/#product">서비스 소개</Link>
      <Link href="/create">제작하기</Link>
      <Link href="/marketplace">3D 에셋</Link>
      <Link href="/pricing">이용 안내</Link>
    </>
  );
}
export function PublicHeader() {
  return (
    <header className="public-header">
      <Brand />
      <nav aria-label="서비스 탐색">
        <Links />
      </nav>
      <div className="header-account">
        <Link href="/login">로그인</Link>
        <Button asChild size="sm">
          <Link href="/signup">
            시작하기 <ArrowUpRight size={15} />
          </Link>
        </Button>
      </div>
      <NavigationSheet
        trigger={
          <Button
            className="mobile-nav-trigger"
            variant="ghost"
            size="icon"
            aria-label="메뉴 열기"
          >
            <Menu size={23} />
          </Button>
        }
      >
        <Brand />
        <nav className="mobile-public-nav">
          <Links />
          <Link href="/login">로그인</Link>
          <Link href="/signup">시작하기</Link>
        </nav>
      </NavigationSheet>
    </header>
  );
}
