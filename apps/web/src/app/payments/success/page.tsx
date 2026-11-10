import { Suspense } from "react";
import { PaymentResult } from "@/components/payment-result";
export default function Page() {
  return (
    <Suspense fallback={<p>결제 확인 중…</p>}>
      <PaymentResult failed={false} />
    </Suspense>
  );
}
