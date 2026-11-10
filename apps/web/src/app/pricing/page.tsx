import { PublicHeader } from "@/components/public-header";
import { Pricing } from "@/components/pricing";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <main id="main" className="public-page">
        <Pricing />
      </main>
    </>
  );
}
