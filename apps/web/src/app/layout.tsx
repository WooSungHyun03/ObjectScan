import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { educationMode } from "@/lib/project-purpose";
export const metadata: Metadata = {
  title: {
    default: "ObjectScan — Turn images into 3D.",
    template: "%s · ObjectScan",
  },
  description:
    "객체만, 또는 장면 전체를. 사진에서 텍스처 3D 메시까지 이어지는 독립 크리에이티브 워크스페이스.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <a href="#main" className="skip-link">
          본문으로 건너뛰기
        </a>
        {educationMode() && (
          <aside className="education-banner" aria-label="운영 목적">
            학교 교육·연구용 · 비상업 서비스{" "}
            <Link href="/docs#research">이용 범위와 모델 출처</Link>
          </aside>
        )}
        {children}
      </body>
    </html>
  );
}
