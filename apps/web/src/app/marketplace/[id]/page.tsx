import { PublicHeader } from "@/components/public-header";
import { ListingDetail } from "@/components/listing-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <PublicHeader />
      <main id="main" className="public-page">
        <ListingDetail id={id} />
      </main>
    </>
  );
}
