import type { Metadata } from "next";
import "@fontsource-variable/noto-sans-kr";
import "./globals.css";
import "./studio.css";
import "./design-tokens.css";
import "./premium.css";
import Link from "next/link";
import { DesignCapture } from "@/components/design/capture";
import { educationMode } from "@/lib/project-purpose";
export const metadata: Metadata = {
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  manifest: "/manifest.webmanifest",
  title: {
    default: "ObjectScan | 사진으로 시작하는 3D 제작",
    template: "%s · ObjectScan",
  },
  description: "사진 속 물건과 공간을 3D로 준비하는 한국어 제작 서비스.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {process.env.NODE_ENV === "development" && <DesignCapture />}
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
