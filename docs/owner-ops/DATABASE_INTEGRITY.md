# DB 정합성

2026-11-12 Owner-local 체크포인트.

hosted public schema와 public/auth/storage data를 private artifacts/owner-ops에 백업했다. 디렉터리700·파일600이며 Git에서 제외한다. migration22는 orders/asset_purchases의 구매 시점 라이선스 snapshot과 source/주문조건 불변 trigger를 추가한다. 기존 null 값은 알 수 없음으로 유지하며 권리를 추측해 소급하지 않는다. 로컬에 적용하고 기존 sandbox 거래 테스트에 상품 변경 후 snapshot 보존·금액/원본 변경 거부·정산 후 snapshot 복사를 검증하는 assertion을 추가했다. 백업 후 dry-run에서22 하나만 적용 대상임을 확인하고 hosted에도 적용했다(exit0). orders/asset_purchases의 신규 컬럼을 REST로 조회했고 기존 Worker 대상 health200/online/idle을 확인했다. 새 외부 PG 구매·UI 조회까지의 실연동은 아직 미검증이다. 삭제·보관 hold·storage cleanup 전체 구현은 OWN-07 대기다. 운영 reset/drop/cascade는 실행하지 않았다.
