import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/public-header";
export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="legal-page">
        <Image
          src="/brand/mascot/front.webp"
          alt="길을 안내하는 ObjectScan 곰"
          width={160}
          height={160}
        />
        <h1>페이지를 찾을 수 없어요.</h1>
        <p>주소가 바뀌었거나 접근할 수 없는 페이지입니다.</p>
        <Link href="/projects">내 프로젝트로 돌아가기</Link>
      </main>
    </>
  );
}
