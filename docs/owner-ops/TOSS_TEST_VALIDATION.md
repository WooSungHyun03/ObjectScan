# Toss TEST

2026-11-12 Owner-local 체크포인트.

로컬 TEST 키 존재를 비밀 값 출력 없이 확인했다. 이전 회차 카드사 인증 완료 응답은 있지만 이번 snapshot 변경 이후 외부 결제→승인→중복 복귀→환불의 실제 재검증은 아직 없다. 이번 Node DB 테스트의 sandbox settlement/idempotency/entitlement 검증은 외부 PG 인증을 대신하지 않는다. LIVE 및 seller payout은 비활성 상태를 유지한다.
