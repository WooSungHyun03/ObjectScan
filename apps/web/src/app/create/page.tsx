import { PublicHeader } from "@/components/public-header";
import { SiteFooter } from "@/components/site-footer";
import { CreateEntry } from "@/features/create/create-entry";
export default function Page() {
  return (
    <>
      <PublicHeader />
      <CreateEntry />
      <SiteFooter />
    </>
  );
}
