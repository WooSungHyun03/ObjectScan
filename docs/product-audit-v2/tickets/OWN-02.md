# OWN-02 — 모델·에셋 권리와 TEST 요금·보관 정책 확정

**OWNER-LOCAL Codex 전용** / 이전이슈 https://github.com/WooSungHyun03/ObjectScan/issues/27 / P0 해당 기능 실연동 시 필요 / 추정0.5인일(외부대기제외,Team합계제외) / 선행 없음 / 미완료

## 실제 근거·문제
`docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md` 및 `evidence/owner-local-preflight.json`의현행코드·환경을기준으로한다. 이전본문은v1보존본에있으며V6가실행범위를대체한다.

## 이 컴퓨터에서 Codex가 자동 처리할 절차
기존LICENSE/source/checkpoint목록과운영설정을로컬에서비교하고미확정권리/가격/수수료/보관기간표작성.이미정한도메인교체결정은재질문하지않음.
먼저 `node docs/product-audit-v2/owner-local-preflight.mjs /home/m4ml/Desktop/ObjectScan/ObjectScan-v2`로값없는read-only검사. 대상환경/프로젝트/branch/SHA확인→로컬fixture·dry-run계약검증→변경안/diff/백업위치/rollback준비→실운영반영확인순서. 이감사는전용스크립트·정적검사·기존localtest까지실행하고기능구현/운영반영은시작하지않는다.

## 사용자만 수행할 외부 단계
권리확인결과와운영정책의본인승인.필요시권리자허락은본인이확보.
이미승인된도메인교체여부는재질문하지않는다. 다만실제운영변경은V6의별도실행확인게이트를따른다.

## 키 없는 예제·팀 계약
선행Team의typedadapter/mock응답,unknown/timeout/409/404를검증한다. `.env.example`는변수이름·설명만,실제키는로컬보안파일에보관하고Team/Git/Issue에노출하지않는다. mock통과는운영성공증거가아니다.

## Acceptance Criteria
- Given현재대상과백업, When읽기전용검사를수행하면, Then환경·SHA·미확인항목이비밀값없이기록된다.
- Given로컬정상/실패/재시도fixture, When절차를검증하면, Then기존권한·원장·파일보존과rollback경로를확인할수있다.
- Given실제연동실행승인, When본인권한으로검증하면, Then성공/실패·취소·재시도결과와실제/모의구분을남기며미실행이면blocked다.

## 운영 전 안전 확인·백업·Rollback·완료
연구제한모델활성화나LIVE결제를승인으로추측하지않음.
private backup에는권한600, DB는정책확인된dump, DNS/alias는변경전값과TTL을보존한다. rollback은기존설정/배포로복귀하며원장/원본/메일데이터를삭제하지않는다. 실제적용전정확한변경diff와복구절차가준비되어야한다. 본인인증이필요한단계만구체적으로요청한다.

## Owner-local Codex 실행 프롬프트
```text
/home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 docs/product-audit-v2/tickets/OWN-02.md 전체를읽고 OWNER-LOCAL 작업만수행하라. 기존LICENSE/source/checkpoint목록과운영설정을로컬에서비교하고미확정권리/가격/수수료/보관기간표작성.이미정한도메인교체결정은재질문하지않음. 선행 없음와현재SHA/설정을확인하고안전한read-only검사·로컬테스트·설정예제·backup/diff/rollback준비는직접하라. Team기능구현이나모델연구로넘어가지말라. 실제운영리소스변경은별도실행확인후다. 사용자에게필요한것은 권리확인결과와운영정책의본인승인.필요시권리자허락은본인이확보. 비밀값을출력하지말고실제/모의/대기를구분하라.
```
