import { Suspense } from "react";
import { PublicHeader } from "@/components/public-header";
import { Marketplace } from "@/components/marketplace";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="public-page">
        {/* useSearchParams restores filters from the URL. */}
        <Suspense fallback={<p>에셋 목록 준비 중…</p>}>
          <Marketplace />
        </Suspense>
      </main>
    </>
  );
}
