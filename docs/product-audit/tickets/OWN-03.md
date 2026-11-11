# OWN-03 — Toss TEST 실제 인증·복귀·webhook 전달 재검증
담당 **Owner 본인만** / P0 / 개발 공수 제외 / 수행 시간은 외부 승인에 따라 미정 / 선행 OS-10
## 문제·범위·근거
기존 TEST 키는 본인만 관리. 서울 Preview에서 새 실제 TEST 인증→자동복귀→provider 재조회→환불 확인; SSO 보호와 webhook 경로 충돌 확인. 실결제와 실제 송금은 제외.
근거: [현재 상태](../01_CURRENT_STATE_AUDIT.md). 팀원은 로컬 mock·.env.example·검증 안내만 제공한다.
## Acceptance Criteria
- Given 선행 개발 증거, When Owner가 계정 설정을 검토하면, Then 비밀 값 없이 승인/거절과 대상 환경을 기록한다.
- Given 테스트 환경, When 본인이 필요한 인증을 직접 수행하면, Then 성공과 실패·복구 결과를 redacted 증거로 남긴다.
- Given 완료 판단, When 운영 반영을 결정하면, Then 정확한 SHA·정책·롤백과 미확인 항목을 명시하며 승인 전 적용하지 않는다.
## 검증·위험·Rollback·DoD
개발 티켓의 인계 체크리스트를 사용한다. 키를 Git/Issue에 게시하지 않는다. 정책/소유권/권한/테스트가 충족되지 않으면 blocked 유지; 기존 서비스·DNS·결제 설정으로 되돌릴 계획을 먼저 확정한다. 실제 인증 전 mock 통과는 완료 증거가 아니다.
## Owner용 Codex 프롬프트
```text
OWN-03와 선행 OS-10 결과를 읽고 변경 대상·환경·현재 소유권을 먼저 읽기 전용 확인하라. 기존 TEST 키는 본인만 관리. 서울 Preview에서 새 실제 TEST 인증→자동복귀→provider 재조회→환불 확인; SSO 보호와 webhook 경로 충돌 확인. 실결제와 실제 송금은 제외. 필요한 실제 인증은 나에게 요청하고, 승인되지 않은 운영 전환·DNS 덮어쓰기·실결제는 하지 말라. 비밀 값 없이 결과·rollback·제한을 기록하라.
```
