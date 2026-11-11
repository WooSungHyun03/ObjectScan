import Link from "next/link";
import Image from "next/image";
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="ObjectScan 홈">
      <Image src="/brand/mascot/avatar.webp" alt="" width={36} height={36} />
      <span>ObjectScan</span>
    </Link>
  );
}
