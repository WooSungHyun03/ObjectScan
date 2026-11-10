import Link from "next/link";
import { Box } from "lucide-react";
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="ObjectScan 홈">
      <Box size={26} strokeWidth={1.6} />
      <span>ObjectScan</span>
    </Link>
  );
}
