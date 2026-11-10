import { PublicHeader } from "@/components/public-header";
import { Marketplace } from "@/components/marketplace";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="public-page">
        <Marketplace />
      </main>
    </>
  );
}
