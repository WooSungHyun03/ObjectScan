import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "./ui/button";
import { NavigationSheet } from "./ui/sheet";
function Links() {
  return (
    <>
      <Link href="/docs">이용 방법</Link>
      <Link href="/create">3D 제작</Link>
      <Link href="/marketplace">3D 에셋 마켓</Link>
      <Link href="/pricing">요금</Link>
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
          <Link href="/create">
            3D 모델 만들기 <ArrowUpRight size={15} />
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
          <Link href="/create">3D 모델 만들기</Link>
        </nav>
      </NavigationSheet>
    </header>
  );
}
