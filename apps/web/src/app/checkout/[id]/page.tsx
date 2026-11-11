import { ProtectedWorkspace } from "@/components/protected-workspace";
import { CheckoutPanel } from "@/features/billing/checkout-panel";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ProtectedWorkspace next={`/checkout/${id}`}>
      <CheckoutPanel orderId={id} />
    </ProtectedWorkspace>
  );
}
