const labels: Record<string, string> = {
  pending: "결제 대기",
  confirming: "결제 확인 중",
  paid: "결제 완료",
  failed: "결제 실패",
  refunded: "환불 완료",
};
// Unknown or missing values are never shown raw to the customer.
export const orderStatusKnown = (status?: string) =>
  Object.hasOwn(labels, status ?? "");
export const orderStatusLabel = (status?: string) =>
  orderStatusKnown(status) ? labels[status!] : "확인 중";
