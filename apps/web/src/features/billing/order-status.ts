// Values mirror the DB checks on orders.status, payout_requests.status and credit_ledger.kind.
const orderLabels: Record<string, string> = {
  pending: "결제 대기",
  confirming: "결제 확인 중",
  paid: "결제 완료",
  failed: "결제 실패",
  refunded: "환불 완료",
};
const payoutLabels: Record<string, string> = {
  requested: "검토 대기",
  approved: "승인됨",
  rejected: "반려됨",
  paid: "지급 완료",
};
const ledgerLabels: Record<string, string> = {
  generation_purchase: "3D 생성 결제",
  marketplace_purchase: "에셋 구매",
  sale: "판매 수익",
  fee: "판매 수수료",
  refund: "환불",
};
// Unknown or missing values are never shown raw to the customer.
const label = (labels: Record<string, string>) => (value?: string) =>
  Object.hasOwn(labels, value ?? "") ? labels[value!] : "확인 중";
export const orderStatusKnown = (status?: string) =>
  Object.hasOwn(orderLabels, status ?? "");
export const orderStatusLabel = label(orderLabels);
export const payoutStatusLabel = label(payoutLabels);
export const ledgerKindLabel = label(ledgerLabels);
