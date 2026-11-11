import Link from "next/link";
import { Brand } from "./brand";
export function SiteFooter() {
  return (
    <footer className="studio-footer">
      <Brand />
      <nav aria-label="하단 메뉴">
        <Link href="/docs">촬영 가이드</Link>
        <Link href="/support">고객 지원</Link>
        <Link href="/terms">이용약관</Link>
        <Link href="/privacy">개인정보 안내</Link>
        <Link href="/legal/opensource">오픈소스 고지</Link>
      </nav>
      <p>© {new Date().getFullYear()} ObjectScan</p>
    </footer>
  );
}
