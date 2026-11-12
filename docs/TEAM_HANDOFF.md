# ObjectScan 팀 전달 문서 — A · B · Owner-local

작성: 2026-11-12. 이 파일 하나에 담당표, 착수 순서, 의존성, 완료 기준, 개별 Codex 실행 프롬프트를 모두 담았다. 티켓은 구현 완료 목록이 아니라 남은 개발 범위다.

## 이번 전달의 우선 규칙

- 통합 기준은 **GitHub main**이다. 이전 감사 문서의 `main은 최신앱이 아니다` 문장은 이번 main 통합 이후 적용하지 않는다. 시작할 때 `git fetch origin`과 `git log -1 origin/main`으로 실제 SHA를 확인한다.
- 각자 최신 main에서 티켓 브랜치를 만들어 작업하고 상대 리뷰·검증 후 main에 통합한다. 이번 Owner 변경의 main push는 사용자가 명시적으로 지시했다. force push와 타인의 변경 덮어쓰기는 금지한다.
- A/B는 모두 완결된 제품 티켓을 맡는다. 프런트/백엔드 직무 구분이 아니다. A **7.5인일**, B **8인일**, 차이 **0.5인일**. 2주 20인일 중 개발15.5, 통합·문제 해결 버퍼4.5(**22.5%**).
- GPU 운영, 비밀 키, SMTP, PG 실연동, Supabase 설정·migration, 배포·DNS는 Owner 컴퓨터의 Codex만 수행한다. 팀원은 typed contract/fixture/mock으로 개발하며 운영 키를 받지 않는다.
- 새 AI 모델, 학습, 품질 향상 연구는 하지 않는다. 기존 기능을 재구현하지 않고 실제 코드부터 확인한다. 내부 모델명은 고객 화면에 표시하지 않는다.
- 도메인 교체는 이미 승인됐다. Owner는 Cloudflare 로그인·2FA 등 본인 인증만 요청하고, 백업과 검증 후 웹 라우팅만 전환한다. 메일·기존 데이터는 보존한다. LIVE 결제·송금은 금지한다.
- 아래 기존 감사 근거 SHA는 과거 관찰 기준이다. 실행 시 최신 main 코드와 실제 상태가 우선한다. Worker는 **systemctl --user**에서 실행 중이며 예전 system scope inactive 판정은 오류였다.

## 지금 바로 착수

**A: OS-01**, **B: OS-12**. B는 첫날 공통 키 없는 fixture 시작점을 준비한다. 그전 A는 순수 view-model/unit부터 진행한다. Owner 작업은 팀원에게 넘기지 않는다.

각 티켓을 실행할 때 아래 해당 티켓 전체와 코드 경로를 Codex에 전달한다. 공통 지시: “최신 origin/main에서 시작하고 이 전달 문서의 우선 규칙을 적용하라. 다른 티켓을 임의로 완료 처리하지 말고 AC별 테스트 증거와 미연동 항목을 보고하라.”

## 담당·의존성 한눈에 보기

### 팀원 A — 7.5인일

| 티켓 | 내용 | 인일 | Team 선행 | Owner 실연동 |
| ---- | ---- | ---: | --------- | ------------ |

|[OS-01](https://github.com/WooSungHyun03/ObjectScan/issues/8)|현재 지원 범위·실패 이유·차감 안내를 생성 전에 표시|0.5|없음|없음|

|[OS-03](https://github.com/WooSungHyun03/ObjectScan/issues/10)|통신 단절 뒤 작업 polling 재개와 중복 클릭 방지|1.5|OS-01|없음|

|[OS-06](https://github.com/WooSungHyun03/ObjectScan/issues/13)|기존 편집 정보로 원본·버전 비교와 JSON 내보내기|1|없음|없음|

|[OS-09](https://github.com/WooSungHyun03/ObjectScan/issues/16)|실제 모델에서 만든 썸네일 확인·마켓 카드 표시|1|OS-19|OWN-08|

|[OS-11](https://github.com/WooSungHyun03/ObjectScan/issues/18)|삭제 확인·중복 클릭 차단·권리 보존 오류 안내|0.5|없음|OWN-07|

|[OS-17](https://github.com/WooSungHyun03/ObjectScan/issues/24)|외부 GLB 로컬 편집에서 개인 저장·게시로 이어가기|1.5|OS-06|OWN-09|

|[OS-20](https://github.com/WooSungHyun03/ObjectScan/issues/33)|편집 동작 이력·삭제 확인·저장 오류 복구|1.5|OS-06|없음|

### 팀원 B — 8인일

| 티켓 | 내용 | 인일 | Team 선행 | Owner 실연동 |
| ---- | ---- | ---: | --------- | ------------ |

|[OS-02](https://github.com/WooSungHyun03/ObjectScan/issues/9)|가입·복구 링크 오류와 메일 대기의 복구 UI|1|없음|OWN-01|

|[OS-04](https://github.com/WooSungHyun03/ObjectScan/issues/11)|구매 당시 이용 조건과 legacy 누락값 조회 UI|0.5|없음|OWN-06|

|[OS-07](https://github.com/WooSungHyun03/ObjectScan/issues/14)|기존 sharp 선명도 경고·중복 안내·사진 순서 정리|1.5|OS-01|OWN-04|

|[OS-08](https://github.com/WooSungHyun03/ObjectScan/issues/15)|마스크 실패·재선택·이전 단계 복귀의 안내와 접근성|1|OS-01|없음|

|[OS-10](https://github.com/WooSungHyun03/ObjectScan/issues/17)|TEST 결제 응답 유실·중복 복귀의 상태 복구 UI|1|OS-01|OWN-03|

|[OS-12](https://github.com/WooSungHyun03/ObjectScan/issues/19)|키·DB 없는 공통 UI fixture 시작점|0.5|없음|없음|

|[OS-18](https://github.com/WooSungHyun03/ObjectScan/issues/25)|마켓 라이선스·가격 필터와 URL 검색 상태|0.5|없음|없음|

|[OS-19](https://github.com/WooSungHyun03/ObjectScan/issues/32)|결과 뷰어 앞·뒤·좌·우 시점과 재맞춤|1|없음|없음|

|[OS-21](https://github.com/WooSungHyun03/ObjectScan/issues/34)|구매 내역의 한국어 상태와 에셋 재다운로드 연결|0.5|없음|없음|

|[OS-22](https://github.com/WooSungHyun03/ObjectScan/issues/35)|팀원 fixture 통합 회귀와 Owner 인계 리포트|0.5|OS-01, OS-02, OS-03, OS-04, OS-06, OS-07, OS-08, OS-09, OS-10, OS-11, OS-12, OS-17, OS-18, OS-19, OS-20, OS-21|없음|

### Owner-local — 별도 약 10인일

팀15.5인일에 포함하지 않는다. 외부 인증 대기는 별도다. Team 선행은 실연동 시점의 의존성으로, mock 착수를 막지 않는다.

| 티켓 | 내용 | 인일 | 연결·선행 |
| ---- | ---- | ---: | --------- |

|[OS-05](https://github.com/WooSungHyun03/ObjectScan/issues/12)|기존 추론 운영 smoke·취소·오류 안내 확인|0.5|없음|

|[OWN-01](https://github.com/WooSungHyun03/ObjectScan/issues/26)|SMTP·인증 콜백 연결과 외부 메일 확인|0.5|OS-02|

|[OWN-02](https://github.com/WooSungHyun03/ObjectScan/issues/27)|모델·에셋 권리와 TEST 요금·보관 정책 확정|0.5|없음|

|[OWN-03](https://github.com/WooSungHyun03/ObjectScan/issues/28)|Toss TEST 서버 복귀·webhook·환불 실연동|0.5|OS-10|

|[OWN-04](https://github.com/WooSungHyun03/ObjectScan/issues/29)|실행 환경·DB 검증·Preview 배포와 운영 승인|1|OS-22, OS-05, OWN-01, OWN-02, OWN-03, OWN-06|

|[OWN-05](https://github.com/WooSungHyun03/ObjectScan/issues/30)|be-celeb.org ObjectScan 전환·메일 보존·복구|1|OWN-04|

|[OWN-06](https://github.com/WooSungHyun03/ObjectScan/issues/36)|구매 라이선스·버전 불변 snapshot 서버·DB 연동|1.5|OS-04|

|[OWN-07](https://github.com/WooSungHyun03/ObjectScan/issues/37)|삭제·보관 hold·storage cleanup 서버 정합성|1.5|OS-11, OWN-06|

|[OWN-08](https://github.com/WooSungHyun03/ObjectScan/issues/38)|poster 저장·검증·공개 미리보기 API 연결|1|OS-09|

|[OWN-09](https://github.com/WooSungHyun03/ObjectScan/issues/39)|외부 GLB private 수입 등록·게시 서버 연결|2|OS-17, OWN-06|

## Owner 현재 진행 상태

- Worker 사용자 서비스 실행·자동 시작·linger 확인. drain 후 중지/시작/재시작과 관리 도구의 로컬 웹 시작·중지 검증. 기존 3010 서버 보존. 새 GPU 추론 전체 흐름 검증은 아직 별도다.
- 주문 라이선스·원본 snapshot migration22는 로컬 테스트 후 hosted에도 적용했다. schema/data 비공개 백업과 적용 후 컬럼 조회·health200을 확인했다. API/UI 연결과 실제 새 구매 검증 전이므로 OWN-06 전체 완료가 아니다.
- be-celeb.org/www의 Vercel 연결을 ObjectScan으로 이전하고 HTTPS 랜딩·www308을 확인했다. DNS·메일은 변경하지 않았다. 최신 Preview 전체 검증·SMTP 외부 발송·이번 회차 실제 TEST 결제는 미완료다. 이전 테스트 성과를 이번 회차 통과로 재사용하지 않는다.
- 새 관리 CLI `scripts/objectscanctl`은 Worker와 로컬 웹을 구분한다. 공개 사이트 점검 모드는 아직 구현되지 않았다.

## 2주 순서와 충돌 방지

| 일  | A                   | B                   |
| --- | ------------------- | ------------------- |
| D1  | OS-01 .5 + OS-03 .5 | OS-12 .5 + OS-02 .5 |
| D2  | OS-03 1             | OS-02 .5 + OS-04 .5 |
| D3  | OS-06 1             | OS-19 1             |
| D4  | OS-09 1             | OS-07 1             |
| D5  | OS-17 1             | OS-07 .5 + OS-08 .5 |
| D6  | OS-17 .5 + OS-20 .5 | OS-08 .5 + OS-10 .5 |
| D7  | OS-20 1             | OS-10 .5 + OS-18 .5 |
| D8  | OS-11 .5 + 버퍼 .5  | OS-21 .5 + 버퍼 .5  |
| D9  | 버퍼1               | OS-22 .5 + 버퍼 .5  |
| D10 | 버퍼1               | 버퍼1               |

공유 editor 파일은 OS-06 → OS-17/OS-20 순서로 직렬화한다. OS-19 카메라 helper가 OS-09보다 먼저 반영돼야 한다. shared 단일 index를 동시에 수정하지 않고 feature별 계약으로 나눈다. WIP1, 리뷰 대기 포함 최대2. Owner 계약이 없으면 mock 완료와 OWNER_PENDING을 명시한다.

## 공통 완료 기준

정상·오류·재시도/권한 조건을 검증하고 unit/typecheck/lint와 해당 fixture 브라우저 테스트를 통과시킨다. 360/768/1440 화면·키보드·접근성을 확인한다. Team의 전체 DB 테스트는 Owner가 수행한다. OS-12가 만들 테스트 명령은 아직 기존 기능이 아니므로 존재 여부부터 확인한다. PR에는 SHA, 실행 명령, exit code, 캡처, AC별 결과, rollback을 남긴다. API key·JWT·signed URL·업로드 원본을 Git/Issue에 넣지 않는다. Mock 통과를 실제 결제/추론/SMTP 통과라고 보고하지 않는다.

OS-13~OS-16은 연구/새 알고리즘 범위여서 폐기한 티켓이다. 완료된 기능으로 집계하거나 다시 개발하지 않는다.

## 개별 티켓 전체 — A

### OS-01 — 현재 지원 범위·실패 이유·차감 안내를 생성 전에 표시

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/8 / 개정 / **P0** / **Member A** / **0.5인일** / 난이도 S / 리스크 낮음 / **Ready**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `ReconstructionWizard / GenerationCheckout`. 파일: `apps/web/src/components/reconstruction-wizard.tsx:52`, `apps/web/src/features/create/generation-checkout.tsx` (디렉터리), `apps/web/src/lib/customer-copy.ts:3`.
라우팅 설계1~200장과 실제 지원은 다르다. 모델명을 몰라도 가능한 입력을 먼저 알아야 한다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Meshy 첫 작업/결과 내보내기](https://docs.meshy.ai/en/webapp/getting-started) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

기존 health/quote 계약의 가용 상태를 입력 전후 표시하고 미지원 사유·다음 행동·차감 없음 안내. 기존 서버 gate 보존.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
기존 health/quote fixture를 재사용하고 accepted 범위를 추측하지 않는다. 응답 누락은 준비중,미지원/worker unavailable을 구별. 새 endpoint/SQL/키 변경 없음.
선행 Team: 없음. Owner-local: 없음(기존API계약유지). Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given 지원 불가 scene/MV fixture, When 모드와 사진을 선택하면, Then 생성 전 지원 불가 사유와 차감 없음이 보인다.
- Given 지원 SV quote, When 요청 확인 단계에 오면, Then 서버 차감량만 표시하며 모델명은 노출하지 않는다.
- Given health 실패, When 다시 확인하면, Then 입력은 보존되고 성공 상태를 추측하지 않는다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-01`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-01`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-01/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-01 (현재 지원 범위·실패 이유·차감 안내를 생성 전에 표시)를 구현하라. docs/product-audit-v2/tickets/OS-01.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-01독립브랜치로작업하라.
코드탐색: apps/web/src/components/reconstruction-wizard.tsx; apps/web/src/features/create/generation-checkout.tsx; apps/web/src/lib/customer-copy.ts / ReconstructionWizard / GenerationCheckout. 현재문제: 라우팅 설계1~200장과 실제 지원은 다르다. 모델명을 몰라도 가능한 입력을 먼저 알아야 한다. 최소범위: 기존 health/quote 계약의 가용 상태를 입력 전후 표시하고 미지원 사유·다음 행동·차감 없음 안내. 기존 서버 gate 보존.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고0.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-03 — 통신 단절 뒤 작업 polling 재개와 중복 클릭 방지

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/10 / 개정 / **P0** / **Member A** / **1.5인일** / 난이도 M / 리스크 중간 / **Ready after Team dependencies**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `JobTracker.poll / GenerationCheckout`. 파일: `apps/web/src/components/job-tracker.tsx:14`, `apps/web/src/features/create/generation-checkout.tsx` (디렉터리), `apps/web/src/lib/client-api.ts:33`.
JobTracker는 poll 예외 후 다음 타이머를 예약하지 않는다. 주문/작업 제출 응답 유실 시 UI에서 중복 클릭 위험이 있다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Meshy 첫 작업/결과 내보내기](https://docs.meshy.ai/en/webapp/getting-started) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

기존job ID 재조회·재시도 백오프·visibility 재개·취소 후 재조회·클라이언트 요청key 재사용과 busy guard. 기존 Worker/queue/정산 로직 변경 금지.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
실제 JobState completed/failed/cancelled enum 유지. 요청 key는 사용자의 동일 제출에만 재사용,입력 변경 시갱신. 서버idempotency가 없으면 같은 입력 자동재POST 금지하고 상태조회/명시복구. API token 저장 금지.
선행 Team: OS-01. Owner-local: 없음(기존API계약유지). Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given 첫 polling503 뒤 running→completed mock, When 페이지가 복구되면, Then 새 작업 없이 같은 job의 완료를 표시한다.
- Given 생성 응답 지연, When 버튼을 두 번 누르면, Then 전송은 한 번이며 불명 상태에서는 서버 재조회가 우선이다.
- Given 취소/완료 경합과404 fixture, When 재조회하면, Then 서버 terminal 상태만 표시하며 환급 완료를 임의 단정하지 않는다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-03`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-03`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-03/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-03 (통신 단절 뒤 작업 polling 재개와 중복 클릭 방지)를 구현하라. docs/product-audit-v2/tickets/OS-03.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-01의반영을확인한뒤 ticket/os-03독립브랜치로작업하라.
코드탐색: apps/web/src/components/job-tracker.tsx; apps/web/src/features/create/generation-checkout.tsx; apps/web/src/lib/client-api.ts / JobTracker.poll / GenerationCheckout. 현재문제: JobTracker는 poll 예외 후 다음 타이머를 예약하지 않는다. 주문/작업 제출 응답 유실 시 UI에서 중복 클릭 위험이 있다. 최소범위: 기존job ID 재조회·재시도 백오프·visibility 재개·취소 후 재조회·클라이언트 요청key 재사용과 busy guard. 기존 Worker/queue/정산 로직 변경 금지.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-06 — 기존 편집 정보로 원본·버전 비교와 JSON 내보내기

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/13 / 개정 / **P1** / **Member A** / **1인일** / 난이도 M / 리스크 낮음 / **Ready**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `useMeshEditor / MeshReport`. 파일: `apps/web/src/components/editor/use-mesh-editor.ts:22`, `apps/web/src/components/editor/mesh-editor.tsx:33`, `packages/mesh-editor/src/contracts.ts:7`.
삼각형·파일크기·UV/texture 표시는 이미 있다. 새 기본패널 대신 원본/편집본 비교와 보고서가 필요하다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Tripo 편집·이력·자산 조건](https://www.tripo3d.ai/pricing) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

기존 MeshReport와 version 목록 재사용; 한 viewer에서 원본/선택본 전환·delta 표시·JSON 다운로드. 두 WebGL canvas 동시로드와 신규 metadata DB 저장 제외.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
보고서 source=local|saved-version,bytes/triangles/uv/textures/unitStatus=unknown. 저장본 서버metadata가 없으면 클라이언트 검사라고 표기. signed URL/token 보고서 제외.
선행 Team: 없음. Owner-local: 없음(기존API계약유지). Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given 간소화 편집본, When 원본/편집본을 전환하면, Then 실제 MeshReport의 삼각형 변화와 텍스처 상태가 일치한다.
- Given 손상 GLB, When 비교 파일을 열면, Then 기존 유효 모델을 보존하고 실패 안내한다.
- Given JSON 다운로드, When 파일을 확인하면, Then 비밀 URL/세션 없이 단위 미확정과 버전정보가 포함된다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-06`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-06`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-06/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-06 (기존 편집 정보로 원본·버전 비교와 JSON 내보내기)를 구현하라. docs/product-audit-v2/tickets/OS-06.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-06독립브랜치로작업하라.
코드탐색: apps/web/src/components/editor/use-mesh-editor.ts; apps/web/src/components/editor/mesh-editor.tsx; packages/mesh-editor/src/contracts.ts / useMeshEditor / MeshReport. 현재문제: 삼각형·파일크기·UV/texture 표시는 이미 있다. 새 기본패널 대신 원본/편집본 비교와 보고서가 필요하다. 최소범위: 기존 MeshReport와 version 목록 재사용; 한 viewer에서 원본/선택본 전환·delta 표시·JSON 다운로드. 두 WebGL canvas 동시로드와 신규 metadata DB 저장 제외.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-09 — 실제 모델에서 만든 썸네일 확인·마켓 카드 표시

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/16 / 개정 / **P1** / **Member A** / **1인일** / 난이도 M / 리스크 중간 / **Ready after Team dependencies**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `AssetCard / CameraTools`. 파일: `apps/web/src/features/marketplace/asset-card.tsx:4`, `apps/web/src/components/publish-form.tsx:8`, `apps/web/src/components/model-viewer.tsx:170`.
viewer PNG 다운로드는 이미 있지만 마켓카드는 일반 아이콘이다. 스크린샷 기능 자체를 중복 제작하지 않는다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Fab viewer·검색](https://www.fab.com/o/about) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

기존 capture 재사용한 사용자 확인 poster·실패fallback·card rendering typed contract. public storage/API 연결은 OWN-08.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
optional poster_url/artifact_version_id 계약을fixture로검증. 기존 public_preview_path는GLB이며 img src로오용금지. 업로드미연동이면로컬다운로드만,저장완료를표시하지않음.
선행 Team: OS-19. Owner-local: OWN-08. Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given 모델capture, When 사용자가확인하면, Then 해당모델의PNG미리보기가보이고가짜example로대체하지않는다.
- Given WebGL실패/외부poster불허, When 카드가렌더되면, Then 안전한fallback과설명이보인다.
- Given poster미연동fixture, When게시하면, Then저장완료를꾸미지않고기존게시경로가유지된다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-09`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-09`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-09/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-09 (실제 모델에서 만든 썸네일 확인·마켓 카드 표시)를 구현하라. docs/product-audit-v2/tickets/OS-09.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-19의반영을확인한뒤 ticket/os-09독립브랜치로작업하라.
코드탐색: apps/web/src/features/marketplace/asset-card.tsx; apps/web/src/components/publish-form.tsx; apps/web/src/components/model-viewer.tsx / AssetCard / CameraTools. 현재문제: viewer PNG 다운로드는 이미 있지만 마켓카드는 일반 아이콘이다. 스크린샷 기능 자체를 중복 제작하지 않는다. 최소범위: 기존 capture 재사용한 사용자 확인 poster·실패fallback·card rendering typed contract. public storage/API 연결은 OWN-08.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 OWN-08은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-11 — 삭제 확인·중복 클릭 차단·권리 보존 오류 안내

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/18 / 개정 / **P1** / **Member A** / **0.5인일** / 난이도 S / 리스크 중간 / **Ready**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `AssetLibrary.deleteAsset / SettingsPanel`. 파일: `apps/web/src/components/asset-library.tsx:18`, `apps/web/src/components/account-panels.tsx:16`.
현재에셋영구삭제/구매중차단과계정삭제검토요청이있다. 안전한busy/실패복구UX만추가한다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Polycam library·편집·공유](https://learn.poly.cam/hc/en-us/articles/39279656782996-Getting-Started-with-Polycam) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

삭제dialog대상명·busyguard·취소·409권리보류·503재시도. 휴지통/복원/정리manifest/DB삭제정책은OWN-07.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
기존 DELETE assets/id와 POST data-deletion 유지. actual API held 상태가없으면409기존code만설명.복원가능하다고말하지않음.
선행 Team: 없음. Owner-local: OWN-07. Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given 삭제확인창, When취소하면, Then요청하지않고원래항목에초점복귀한다.
- Given 삭제409fixture, When확인하면, Then항목을유지하고구매권리보존사유를표시한다.
- Given 느린삭제503, When중복클릭후재시도하면, Then한번만전송하고오류후항목이남는다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-11`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-11`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-11/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-11 (삭제 확인·중복 클릭 차단·권리 보존 오류 안내)를 구현하라. docs/product-audit-v2/tickets/OS-11.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-11독립브랜치로작업하라.
코드탐색: apps/web/src/components/asset-library.tsx; apps/web/src/components/account-panels.tsx / AssetLibrary.deleteAsset / SettingsPanel. 현재문제: 현재에셋영구삭제/구매중차단과계정삭제검토요청이있다. 안전한busy/실패복구UX만추가한다. 최소범위: 삭제dialog대상명·busyguard·취소·409권리보류·503재시도. 휴지통/복원/정리manifest/DB삭제정책은OWN-07.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 OWN-07은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고0.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-17 — 외부 GLB 로컬 편집에서 개인 저장·게시로 이어가기

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/24 / 개정 / **P1** / **Member A** / **1.5인일** / 난이도 M / 리스크 중간 / **Ready after Team dependencies**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `loadLocal / useMeshEditor.save`. 파일: `apps/web/src/components/editor/use-mesh-editor.ts:22`, `apps/web/src/components/editor/mesh-editor.tsx:33`, `packages/mesh-editor/src` (디렉터리).
로컬GLBimport/edit/export는있지만서버artifact등록후게시연결이없다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Tripo 편집·이력·자산 조건](https://www.tripo3d.ai/pricing) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

기존64MiB검증을재사용한개인저장선택·파일명/권리확인·진행/실패/재시도UI와typedmockadapter. 실제서버수입등록은OWN-09.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
import session mock:validate→upload→finalize{artifact_id,project_id,can_publish}. 실제API이름은Owner계약후고정. 외부URL수입금지,원본immutable,localfile상태에서는클라우드저장완료표시금지.
선행 Team: OS-06. Owner-local: OWN-09. Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given 유효GLB로컬편집, Whenmock개인저장성공이면, Then반환된project로이동후게시선택이가능하다.
- Given 외부URI/64MiB초과GLB, When가져오면, Then기존validator로거부되고기존작업이보존된다.
- Given upload503/Owner미연동, When저장하면, Then편집내용과로컬다운로드가유지되고미연동은명확히표시된다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-17`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-17`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-17/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-17 (외부 GLB 로컬 편집에서 개인 저장·게시로 이어가기)를 구현하라. docs/product-audit-v2/tickets/OS-17.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-06의반영을확인한뒤 ticket/os-17독립브랜치로작업하라.
코드탐색: apps/web/src/components/editor/use-mesh-editor.ts; apps/web/src/components/editor/mesh-editor.tsx; packages/mesh-editor/src / loadLocal / useMeshEditor.save. 현재문제: 로컬GLBimport/edit/export는있지만서버artifact등록후게시연결이없다. 최소범위: 기존64MiB검증을재사용한개인저장선택·파일명/권리확인·진행/실패/재시도UI와typedmockadapter. 실제서버수입등록은OWN-09.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 OWN-09은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-20 — 편집 동작 이력·삭제 확인·저장 오류 복구

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/33 / 신규 / **P1** / **Member A** / **1.5인일** / 난이도 M / 리스크 중간 / **Ready after Team dependencies**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `MeshEditor / useMeshEditor / dirty`. 파일: `apps/web/src/components/editor/mesh-editor.tsx:33`, `apps/web/src/components/editor/inspector-panel.tsx:11`, `apps/web/src/components/editor/use-mesh-editor.ts:22`.
변환·노드hide/delete·간소화·undo/redo disabled 상태·beforeunload/링크이탈확인·저장key재사용은이미있다. 삭제는즉시실행되고동작목록이없어어디까지되돌릴지찾기어렵다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Polycam library·편집·공유](https://learn.poly.cam/hc/en-us/articles/39279656782996-Getting-Started-with-Polycam) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

기존ops/cursor로한국어동작이력과현재위치표시·선택지점으로되돌리기·부품삭제확인·저장실패재시도안내. 기존undo/dirty/이탈확인기능은재구현하지않고회귀로보존. facecrop/brush/알고리즘추가없음.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
기존typed ops/cursor/dirty/saveKey재사용. undo된노드가복원되는지GLBroundtrip. rawGLB원본은immutable.원격저장실패시dirty유지.
선행 Team: OS-06. Owner-local: 없음(기존API계약유지). Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given여러부품fixture, When선택/숨김/삭제/undo하면, Then선택과목록상태가실제GLB결과와일치한다.
- Given변환→숨김→간소화동작이력, When이전변환지점을선택하면, Then기존history함수로해당cursor결과가복원되고이탈확인은그대로작동한다.
- Given버전저장503, When재시도하면, Then편집과dirty가유지되고성공확인후에만저장됨으로표시한다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-20`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-20`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-20/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-20 (편집 동작 이력·삭제 확인·저장 오류 복구)를 구현하라. docs/product-audit-v2/tickets/OS-20.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-06의반영을확인한뒤 ticket/os-20독립브랜치로작업하라.
코드탐색: apps/web/src/components/editor/mesh-editor.tsx; apps/web/src/components/editor/inspector-panel.tsx; apps/web/src/components/editor/use-mesh-editor.ts / MeshEditor / useMeshEditor / dirty. 현재문제: 변환·노드hide/delete·간소화·undo/redo disabled 상태·beforeunload/링크이탈확인·저장key재사용은이미있다. 삭제는즉시실행되고동작목록이없어어디까지되돌릴지찾기어렵다. 최소범위: 기존ops/cursor로한국어동작이력과현재위치표시·선택지점으로되돌리기·부품삭제확인·저장실패재시도안내. 기존undo/dirty/이탈확인기능은재구현하지않고회귀로보존. facecrop/brush/알고리즘추가없음.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

## 개별 티켓 전체 — B

### OS-02 — 가입·복구 링크 오류와 메일 대기의 복구 UI

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/9 / 개정 / **P0** / **Member B** / **1인일** / 난이도 M / 리스크 중간 / **Ready**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `AuthForm / auth callback`. 파일: `apps/web/src/components/auth-form.tsx:17`, `apps/web/src/app/auth` (디렉터리), `tests/e2e/auth-email.spec.ts:1`.
로컬 이메일 인증·복구는 이미 통과. 신규 사용자의 만료/재발송/복귀 오류 안내를 mock으로 보강한다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Meshy 첫 작업/결과 내보내기](https://docs.meshy.ai/en/webapp/getting-started) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

UI 상태·재발송 cooldown·입력 보존·허용된 내부 next 경로 회귀. 외부 SMTP와 auth provider 설정은 제외.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
Supabase 호출은 adapter mock으로 signup/resend/reset 결과를 분리. 실제 프로젝트 URL/키 없이 public interface fixture 사용. 링크 유효성 최종 권한은 서버.
선행 Team: 없음. Owner-local: OWN-01. Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given 미확인 가입 fixture, When 확인 대기에 진입하면, Then 보호 작업을 허용하지 않고 재발송 시간을 안내한다.
- Given 만료 reset 링크, When 재설정을 시도하면, Then 이메일 입력을 보존하고 새 링크 요청으로 복귀한다.
- Given 외부 next URL, When 로그인 복귀를 시도하면, Then 내부 허용 경로로만 이동한다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-02`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-02`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-02/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-02 (가입·복구 링크 오류와 메일 대기의 복구 UI)를 구현하라. docs/product-audit-v2/tickets/OS-02.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-02독립브랜치로작업하라.
코드탐색: apps/web/src/components/auth-form.tsx; apps/web/src/app/auth; tests/e2e/auth-email.spec.ts / AuthForm / auth callback. 현재문제: 로컬 이메일 인증·복구는 이미 통과. 신규 사용자의 만료/재발송/복귀 오류 안내를 mock으로 보강한다. 최소범위: UI 상태·재발송 cooldown·입력 보존·허용된 내부 next 경로 회귀. 외부 SMTP와 auth provider 설정은 제외.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 OWN-01은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-04 — 구매 당시 이용 조건과 legacy 누락값 조회 UI

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/11 / 개정 / **P0** / **Member B** / **0.5인일** / 난이도 S / 리스크 중간 / **Ready**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `BillingPanel / licenseLabels`. 파일: `apps/web/src/components/account-panels.tsx:16`, `apps/web/src/components/listing-detail.tsx:16`, `apps/web/src/features/marketplace/presentation.ts:1`.
금액 snapshot은 있으나 license snapshot은 없다. UI는 현재 listing 조건을 과거 구매조건처럼 표시하면 안 된다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Fab viewer·검색](https://www.fab.com/o/about) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

snapshot typed view-model·fixture와 구매내역 조건 표시. absent=기록 확인중 legacy 표시. DB/주문 생성/권한/서버 transaction은 OWN-06.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
optional snapshot schema_version/license_code/artifact_version/hash를 read-only 표시. 미연동 기능은 feature flag off. 실제 API에 없는 필드는 mock 전용이며 현재라이선스로 backfill 금지.
선행 Team: 없음. Owner-local: OWN-06. Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given snapshot fixture, When 주문을 열면, Then 주문 시점 이용조건·버전이 보인다.
- Given snapshot 없는 legacy 주문, When 표시하면, Then 현재조건을 대입하지 않고 미확정 안내한다.
- Given 주문 조회404 또는오류, When 재시도하면, Then 타인정보 없이 오류와 재시도 버튼만 보인다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-04`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-04`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-04/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-04 (구매 당시 이용 조건과 legacy 누락값 조회 UI)를 구현하라. docs/product-audit-v2/tickets/OS-04.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-04독립브랜치로작업하라.
코드탐색: apps/web/src/components/account-panels.tsx; apps/web/src/components/listing-detail.tsx; apps/web/src/features/marketplace/presentation.ts / BillingPanel / licenseLabels. 현재문제: 금액 snapshot은 있으나 license snapshot은 없다. UI는 현재 listing 조건을 과거 구매조건처럼 표시하면 안 된다. 최소범위: snapshot typed view-model·fixture와 구매내역 조건 표시. absent=기록 확인중 legacy 표시. DB/주문 생성/권한/서버 transaction은 OWN-06.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 OWN-06은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고0.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-07 — 기존 sharp 선명도 경고·중복 안내·사진 순서 정리

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/14 / 개정 / **P1** / **Member B** / **1.5인일** / 난이도 M / 리스크 중간 / **Ready after Team dependencies**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `anonymous create draft / uploadFile`. 파일: `apps/web/src/features/create` (디렉터리), `apps/web/src/components/reconstruction-wizard.tsx:52`, `tests/files.test.ts:1`.
sharp 정규화·SHA exact dedup과 사진 제외는 이미 있다. 흐림 경고와 업로드 전 순서 정리가 부족하다. 유사뷰 추정은 이번 범위에서 제외한다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[KIRI 촬영·mask 안내](https://www.kiriengine.app/faq/photo-scan-framing-requirements) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

기존 sharp.stats().sharpness/entropy 수치의 설명 가능한 선명도 참고 경고,사용자 무시·개별 제외·키보드 위아래 이동. 서버 의미정합·camera coverage·신규AI 없음.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
새알고리즘을만들지않는다. 기존 sharp.stats().sharpness/entropy를호출하는키없는Node helper와고정fixture만추가하며browserbundle에는sharp를넣지않는다. UI는optional diagnostics fixture를사용하고없는경우정적촬영가이드로fallback. 실제upload응답에Node helper를연결하는작업은OWN-04서버통합단계다. DB저장없이일시적진단만. exactdedup은기존SHA결과를설명하며perceptualhash/유사뷰/coverage개발은제외한다. 사진순서는로컬draft만.
선행 Team: OS-01. Owner-local: OWN-04 (upload응답의optionaldiagnostics서버연결). Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given 동일파일/선명/흐림 fixture, When 선택하면, Then 구분된 경고가 보이고 사용자가 진행 여부를 선택한다.
- Given 사진3장, When 키보드로 제외·위아래 이동하면, Then 업로드 전 draft 순서와 개수가 일치한다.
- Given 과대/손상 이미지, When 진단하면, Then 정해진 예산으로 중단하고 기존선택을 보존한다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-07`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-07`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-07/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-07 (기존 sharp 선명도 경고·중복 안내·사진 순서 정리)를 구현하라. docs/product-audit-v2/tickets/OS-07.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-01의반영을확인한뒤 ticket/os-07독립브랜치로작업하라.
코드탐색: apps/web/src/features/create; apps/web/src/components/reconstruction-wizard.tsx; tests/files.test.ts / anonymous create draft / uploadFile. 현재문제: sharp 정규화·SHA exact dedup과 사진 제외는 이미 있다. 흐림 경고와 업로드 전 순서 정리가 부족하다. 유사뷰 추정은 이번 범위에서 제외한다. 최소범위: 기존 sharp.stats().sharpness/entropy 수치의 설명 가능한 선명도 참고 경고,사용자 무시·개별 제외·키보드 위아래 이동. 서버 의미정합·camera coverage·신규AI 없음.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 OWN-04는 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

#### 검증한 라이브러리 기능

[sharp stats 공식](https://sharp.pixelplumbing.com/api-input/#stats),2026-11-12확인. 실제설치sharp0.35.5에서stats.sharpness/entropy가number임을CPUfixture로확인했다(evidence/sharp-capability.json). 자체흐림측정알고리즘·threshold탐색연구·nearDuplicate구현은하지않는다. helper예정경로 `apps/web/src/features/create/image-diagnostics.server.ts`는신규순수함수이며env/DB/외부접속을로드하지않는다.

### OS-08 — 마스크 실패·재선택·이전 단계 복귀의 안내와 접근성

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/15 / 개정 / **P1** / **Member B** / **1인일** / 난이도 M / 리스크 낮음 / **Ready after Team dependencies**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `requestAnalysis / updateImage / masksReady`. 파일: `apps/web/src/components/reconstruction-wizard.tsx:52`, `apps/web/src/lib/customer-copy.ts:3`.
점/박스·승인/제외와 reviewed/revision gate는 이미 구현됨. 실패 후 어떤 사진을 다시 선택할지 명료화한다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[KIRI 촬영·mask 안내](https://www.kiriengine.app/faq/photo-scan-framing-requirements) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

선택 overlay 확대/원본전환·실패사진 링크·재선택·승인상태·키보드와 초점복구. 기존 gate와 서버revision 변경 금지.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
기존 target/masks PATCH API만 사용; 승인 유효성은 서버 project.revision. 새 targetRevision schema 만들지 않음. stale409는재검토안내,실패에서는원본선택보존.
선행 Team: OS-01. Owner-local: 없음(기존API계약유지). Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given 마스크503 fixture, When 다시 선택하면, Then 사진을 다시 올리지 않고 재선택으로 복귀한다.
- Given revision409 fixture, When 승인을 진행하면, Then 이전 승인을 완료로 표시하지 않고 재검토를 요구한다.
- Given360px와키보드, When 사진/승인/제외를 조작하면, Then 초점과상태변화를 인지할수있고타인404는정보를노출하지않는다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-08`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-08`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-08/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-08 (마스크 실패·재선택·이전 단계 복귀의 안내와 접근성)를 구현하라. docs/product-audit-v2/tickets/OS-08.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-01의반영을확인한뒤 ticket/os-08독립브랜치로작업하라.
코드탐색: apps/web/src/components/reconstruction-wizard.tsx; apps/web/src/lib/customer-copy.ts / requestAnalysis / updateImage / masksReady. 현재문제: 점/박스·승인/제외와 reviewed/revision gate는 이미 구현됨. 실패 후 어떤 사진을 다시 선택할지 명료화한다. 최소범위: 선택 overlay 확대/원본전환·실패사진 링크·재선택·승인상태·키보드와 초점복구. 기존 gate와 서버revision 변경 금지.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-10 — TEST 결제 응답 유실·중복 복귀의 상태 복구 UI

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/17 / 개정 / **P0** / **Member B** / **1인일** / 난이도 M / 리스크 중간 / **Ready after Team dependencies**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `PaymentResult.confirm / CheckoutButton.checkout`. 파일: `apps/web/src/components/payment-result.tsx:10`, `apps/web/src/components/checkout-button.tsx:18`, `apps/web/src/features/billing/checkout-panel.tsx:15`, `tests/e2e/payment-result.spec.ts:1`.
기존실제TEST/환불기록과callback재시도UI는있다. 요청중복·불명/만료주문·복귀경계만보강한다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Meshy 첫 작업/결과 내보내기](https://docs.meshy.ai/en/webapp/getting-started) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

provider mock과 기존order조회로 중복busyguard·정상/실패/불명상태·재진입 회귀. 실제키·웹훅·provider검증·원장수정 제외.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
성공query는증명아님. 기존 payment state서버조회/confirm사용. 새PGendpoint나secret없는Toss SDK실호출은금지. 처리불명은pending확인안내로남김.
선행 Team: OS-01. Owner-local: OWN-03. Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given 승인응답유실mock, When재진입하면, Then서버paid조회후한번만완료를표시한다.
- Given 금액불일치/만료주문mock, When복귀하면, Then권한을주장하지않고기존주문내역으로안내한다.
- Given 중복클릭/환불mock, When재확인하면, Then요청중버튼이잠기고환불을성공구매로표시하지않는다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-10`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-10`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-10/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-10 (TEST 결제 응답 유실·중복 복귀의 상태 복구 UI)를 구현하라. docs/product-audit-v2/tickets/OS-10.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-01의반영을확인한뒤 ticket/os-10독립브랜치로작업하라.
코드탐색: apps/web/src/components/payment-result.tsx; apps/web/src/components/checkout-button.tsx; apps/web/src/features/billing/checkout-panel.tsx; tests/e2e/payment-result.spec.ts / PaymentResult.confirm / CheckoutButton.checkout. 현재문제: 기존실제TEST/환불기록과callback재시도UI는있다. 요청중복·불명/만료주문·복귀경계만보강한다. 최소범위: provider mock과 기존order조회로 중복busyguard·정상/실패/불명상태·재진입 회귀. 실제키·웹훅·provider검증·원장수정 제외.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 OWN-03은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-12 — 키·DB 없는 공통 UI fixture 시작점

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/19 / 개정 / **P0** / **Member B** / **0.5인일** / 난이도 M / 리스크 낮음 / **Ready**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `test fixtures / local smoke report`. 파일: `tests/e2e` (디렉터리), `tests` (디렉터리), `scripts` (디렉터리), `docs/product-audit-v2` (디렉터리).
현재CI가Supabase서비스키·DBfixture에의존한다. 팀원완료증거와Owner실연동증거를분리해야한다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Meshy 첫 작업/결과 내보내기](https://docs.meshy.ai/en/webapp/getting-started) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

서버서비스없이도정적export가능한UI harness/Storybook형fixture route또는Vite fixture shell을검토해최소React harness구현. browser API intercept만으로SSR인증우회가안됨을반영. 첫날0.5인일에키없는entry와공통API adapter·최소2개상태fixture의실행을제공한다. 전체8과업·캡처통합은OS-22로분리.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
TEAM_GATE=component/mock/unit;OWNER_GATE=DB/RLS/GPU/PG/deploy. protected route를dummy key로부팅하지않고기존component fixture shell에서렌더. 테스트인증서버우회/운영mockroute추가금지.
선행 Team: 없음. Owner-local: 없음(기존API계약유지). Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given 빈env와DB/GPU없이, When팀원harness명령을실행하면, Then외부인증없이작업상태·주문상태최소2개fixture가실행된다.
- Given360/768/1440viewport, When회귀하면, Then최소2개fixture의캡처와기본키보드결과가SHA와함께남는다.
- Given Owner연동미완, When리포트를생성하면, ThenTEAM_PASS와SERVICE_PENDING을분리하고배포완료를주장하지않는다.

fixture구현선택: 설치된Vite/React/ReactDOM을사용한test-onlyentry에서next/navigation·next/link·next/image를테스트adapter로치환한다. prod빌드/route/auth에우회코드를넣지않는다. 최소2개fixture로한정하고각기능티켓이자기fixture를추가한다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-12`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-12`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-12/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-12 (키·DB 없는 공통 UI fixture 시작점)를 구현하라. docs/product-audit-v2/tickets/OS-12.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-01, OS-02, OS-03, OS-04, OS-06, OS-07, OS-08, OS-09, OS-10, OS-11, OS-17, OS-18, OS-19, OS-20, OS-21의반영을확인한뒤 ticket/os-12독립브랜치로작업하라.
코드탐색: tests/e2e; tests; scripts; docs/product-audit-v2 / test fixtures / local smoke report. 현재문제: 현재CI가Supabase서비스키·DBfixture에의존한다. 팀원완료증거와Owner실연동증거를분리해야한다. 최소범위: 서버서비스없이도정적export가능한UI harness/Storybook형fixture route또는Vite fixture shell을검토해최소React harness구현. browser API intercept만으로SSR인증우회가안됨을반영. 첫날0.5인일에키없는entry와공통API adapter·최소2개상태fixture의실행을제공한다. 전체8과업·캡처통합은OS-22로분리.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고0.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-18 — 마켓 라이선스·가격 필터와 URL 검색 상태

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/25 / 개정 / **P1** / **Member B** / **0.5인일** / 난이도 S / 리스크 낮음 / **Ready**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `Marketplace / Listing`. 파일: `apps/web/src/components/marketplace.tsx:8`, `apps/web/src/features/marketplace/asset-card.tsx:4`.
검색·카테고리·가격정렬과신고접수는이미있다.기존응답의license/price로목록을좁히고검색복귀상태를보존한다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Fab viewer·검색](https://www.fab.com/o/about) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

기존목록응답에대한라이선스·가격localfilter와URLquery/back복원. 결과가서버페이지일부면현재불러온목록한정표시.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
title/category/sort는기존API. license/price는클라이언트view-model만.현format은GLB단일이므로가짜포맷필터없음. 신고새로구현안함.
선행 Team: 없음. Owner-local: 없음(기존API계약유지). Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given license/price서로다른fixture, When필터하면, Then조건에맞는현재목록만보인다.
- Given 검색후상세방문, When뒤로가면, Thenquery/카테고리/정렬/필터가복구된다.
- GivenAPI실패/빈결과, When조건초기화·재시도하면, Then로딩과오류가구분되고입력은보존된다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-18`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-18`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-18/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-18 (마켓 라이선스·가격 필터와 URL 검색 상태)를 구현하라. docs/product-audit-v2/tickets/OS-18.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-18독립브랜치로작업하라.
코드탐색: apps/web/src/components/marketplace.tsx; apps/web/src/features/marketplace/asset-card.tsx / Marketplace / Listing. 현재문제: 검색·카테고리·가격정렬과신고접수는이미있다.기존응답의license/price로목록을좁히고검색복귀상태를보존한다. 최소범위: 기존목록응답에대한라이선스·가격localfilter와URLquery/back복원. 결과가서버페이지일부면현재불러온목록한정표시.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고0.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-19 — 결과 뷰어 앞·뒤·좌·우 시점과 재맞춤

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/32 / 신규 / **P1** / **Member B** / **1인일** / 난이도 M / 리스크 낮음 / **Ready**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `ModelViewer / CameraTools / Bounds`. 파일: `apps/web/src/components/model-viewer.tsx:170`, `apps/web/src/components/viewer.tsx:3`.
orbit/reset/배경/조명/PNG는이미존재.방향preset과renderer재생성없는맞춤으로초보조작을줄인다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Fab viewer·검색](https://www.fab.com/o/about) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

Drei기존Bounds/OrbitControls target으로front/back/left/right/fit버튼,현재axis정의설명,키보드/360toolbar.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
loadedmesh boundingbox→카메라위치. 새renderer/GLBgeometry수정없음.정면은좌표축기준이며실물semantic정면인식아님. empty/WebGLerror시disable.
선행 Team: 없음. Owner-local: 없음(기존API계약유지). Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given GLB가로드되면, When앞/뒤/좌/우를누르면, Then표시축기준대응카메라로이동한다.
- Givenzoom이과도하면, When화면맞춤을누르면, Then모델전체가보이고geometry는변하지않는다.
- Given로딩실패와키보드, When도구를탐색하면, Then실패상태는정확히안내하고사용불가도구가실행되지않는다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-19`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-19`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-19/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-19 (결과 뷰어 앞·뒤·좌·우 시점과 재맞춤)를 구현하라. docs/product-audit-v2/tickets/OS-19.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-19독립브랜치로작업하라.
코드탐색: apps/web/src/components/model-viewer.tsx; apps/web/src/components/viewer.tsx / ModelViewer / CameraTools / Bounds. 현재문제: orbit/reset/배경/조명/PNG는이미존재.방향preset과renderer재생성없는맞춤으로초보조작을줄인다. 최소범위: Drei기존Bounds/OrbitControls target으로front/back/left/right/fit버튼,현재axis정의설명,키보드/360toolbar.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-21 — 구매 내역의 한국어 상태와 에셋 재다운로드 연결

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/34 / 신규 / **P1** / **Member B** / **0.5인일** / 난이도 S / 리스크 낮음 / **Ready**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `BillingPanel / AssetLibrary.download`. 파일: `apps/web/src/components/account-panels.tsx:16`, `apps/web/src/components/asset-library.tsx:18`, `apps/web/src/features/marketplace/presentation.ts:1`.
billing은raw order.status를표시하고구매에셋연결이빈약하다.내에셋다운로드는이미있다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Tripo 편집·이력·자산 조건](https://www.tripo3d.ai/pricing) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

#### 최소 Scope · 제외

기존orders상태한국어매핑·금액/TEST표시·marketplace주문에서내에셋으로연결·권한404/환불안내. 주문상세API신설없음.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
기존billingorders와assets API만. listing/artifact ID가없는주문은내에셋목록으로만연결.환불후다운로드버튼보장금지,매번서버권한요청.
선행 Team: 없음. Owner-local: 없음(기존API계약유지). Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- GivenpaidTEST주문fixture, When내역을보면, Then한국어상태·TEST·금액과내에셋이동이보인다.
- Givenrefunded주문/다운로드404, When파일을요청하면, Then권한복구를주장하지않고환불상태를안내한다.
- Givenunknown상태/조회503, When재시도하면, Then원시내부값노출없이확인중과복구동작을제공한다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-12에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-21`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-21`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-21/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-21 (구매 내역의 한국어 상태와 에셋 재다운로드 연결)를 구현하라. docs/product-audit-v2/tickets/OS-21.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-21독립브랜치로작업하라.
코드탐색: apps/web/src/components/account-panels.tsx; apps/web/src/components/asset-library.tsx; apps/web/src/features/marketplace/presentation.ts / BillingPanel / AssetLibrary.download. 현재문제: billing은raw order.status를표시하고구매에셋연결이빈약하다.내에셋다운로드는이미있다. 최소범위: 기존orders상태한국어매핑·금액/TEST표시·marketplace주문에서내에셋으로연결·권한404/환불안내. 주문상세API신설없음.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고0.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

### OS-22 — 팀원 fixture 통합 회귀와 Owner 인계 리포트

이전 이슈: https://github.com/WooSungHyun03/ObjectScan/issues/35 / 신규 / **P0** / **Member B** / **0.5인일** / 난이도 M / 리스크 낮음 / **Ready after Team dependencies**

#### 실제 코드 근거·재현

앱 SHA `debc1f7`,검토 HEAD `e411f87`. 심볼 `test fixtures / local smoke report`. 파일: `tests/e2e` (디렉터리), `tests` (디렉터리), `scripts` (디렉터리), `docs/product-audit-v2` (디렉터리).
현재CI가Supabase서비스키·DBfixture에의존한다. 팀원완료증거와Owner실연동증거를분리해야한다.
재현: 해당 화면→위 과업→오류/작업복귀/파일선택 fixture를 실행하여 현재 처리를 관찰한다. [현재 검증 인덱스](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/11_EVIDENCE_AND_OPEN_QUESTIONS.md)와 이번 실제/모의 구분을 먼저 확인한다.

#### 경쟁사 benchmark·사용자 가치

[Meshy 첫 작업/결과 내보내기](https://docs.meshy.ai/en/webapp/getting-started) — 공식문서 확인2026-11-12,계정/플랜제한과직접체험여부는[비교표](https://github.com/WooSungHyun03/ObjectScan/blob/main/docs/product-audit-v2/02_COMPETITOR_PARITY_MATRIX.md). 경쟁사의생성품질을입증한것이아니다. 사용자과업의불명/불필요한반복을줄이며예상효과는아직가설이다.

OS-12에서공통fixture entry가이미제공된다. 새harness를다시만들지말고기존Team fixture를8과업으로묶어실행하고리포트/권한경계/Owner인계만검증한다.

#### 최소 Scope · 제외

OS-12가제공한키없는entry에서완료된기능fixture를8과업으로통합하고세viewport·회귀·TEAM_PASS/OWNER_PENDING리포트를검증한다. 새harness구현은제외한다.
제외: 신규 모델·성능연구·자동facecrop·AI보정·실결제·운영계정·DB/migration·GPU/배포 설정. 이미 있는 기능을새로만들지 않는다.

#### 재사용·계약·Owner 의존

현재 React/Next UI,Three/R3F/Drei,glTF-Transform/meshoptimizer,기존fetch API와typed contracts를재사용. 새runtime의존성 없음이기본. 추가가필요하면라이선스·번들·보안·제거가능성을PR에검토한다.
TEAM_GATE=component/mock/unit;OWNER_GATE=DB/RLS/GPU/PG/deploy. protected route를dummy key로부팅하지않고기존component fixture shell에서렌더. 테스트인증서버우회/운영mockroute추가금지.
선행 Team: OS-01, OS-02, OS-03, OS-04, OS-06, OS-07, OS-08, OS-09, OS-10, OS-11, OS-12, OS-17, OS-18, OS-19, OS-20, OS-21. Owner-local: 없음(기존API계약유지). Owner없는mock개발은즉시가능하며Owner전에는실연동완료로표시하지않는다. 변경파일은위목록과각feature helper/fixture로제한한다.

#### Acceptance Criteria

- Given 빈env와DB/GPU없이, When팀원harness명령을실행하면, Then가입/작업/편집/거래UIfixture가실행된다.
- Given360/768/1440viewport, When회귀하면, Then캡처·axe·키보드·실패복구결과가SHA와함께남는다.
- Given Owner연동미완, When리포트를생성하면, ThenTEAM_PASS와SERVICE_PENDING을분리하고배포완료를주장하지않는다.

#### 권한·통합 경계

TEAM은 외부 API키/인증 계정/SMTP/PG/GPU 환경/DB 설정·migration/배포·관리자 설정에 접근하지 않는다. `.env.local`이나 `.env.test.local`을 요청하거나 로드하지 않는다. typed API/adapter fixture로 완료 증거를 만든다. Supabase schema/RLS/storage policy/Worker/결제 정산/운영 `.github` secrets 변경은 OWNER-LOCAL에 인계한다. 기존 `api.ts`를 광범위 수정하지 않는다. 금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 이 경로가 필요해지면 Team 범위를 확장하지 말고 Owner 계약으로 분리한다.

공유 files는 티켓별 helper로 분리하고 UI→adapter 경계만 연결한다. `packages/shared/src/index.ts` 단일파일에 동시에 patch하지 않고 feature별 `contracts/*.ts`와 fixture를 사용, export 통합은 OS-22에서 직렬 처리한다. TEAM 완료는 UI/로컬 계약 완료이며 Owner 연결 전 서비스 전체 완료가 아니다.

#### 실행·테스트·제출 증거

repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-22`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 기존 key-free fixture entry와 `playwright.team.config.ts`를 재사용하여 `npx playwright test --config playwright.team.config.ts --grep OS-22`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 harness를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-22/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 /home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 OS-22 (팀원 fixture 통합 회귀와 Owner 인계 리포트)를 구현하라. docs/product-audit-v2/tickets/OS-22.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-01, OS-02, OS-03, OS-04, OS-06, OS-07, OS-08, OS-09, OS-10, OS-11, OS-12, OS-17, OS-18, OS-19, OS-20, OS-21의반영을확인한뒤 ticket/os-22독립브랜치로작업하라.
코드탐색: tests/e2e; tests; scripts; docs/product-audit-v2 / test fixtures / local smoke report. 현재문제: 현재CI가Supabase서비스키·DBfixture에의존한다. 팀원완료증거와Owner실연동증거를분리해야한다. 최소범위: OS-12가제공한키없는entry에서완료된기능fixture를8과업으로통합하고세viewport·회귀·TEAM_PASS/OWNER_PENDING리포트를검증한다. 새harness구현은제외한다.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고0.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

## 개별 티켓 전체 — Owner-local

### OS-05 — 기존 추론 운영 smoke·취소·오류 안내 확인

**OWNER-LOCAL Codex 전용** / 이전이슈 https://github.com/WooSungHyun03/ObjectScan/issues/12 / P0 운영 필수 / 추정0.5인일(외부대기제외,Team합계제외) / 선행 없음(기존 대상 read-only 확인부터 시작) / 미완료

#### 실제 근거·문제

`docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md` 및 `evidence/owner-local-preflight.json`의현행코드·환경을기준으로한다. 이전본문은v1보존본에있으며V6가실행범위를대체한다.

#### 이 컴퓨터에서 Codex가 자동 처리할 절차

실행 중인 user systemd Worker의 운영상태 확인·기존설정백업·대기작업확인·로컬대상고정후기존단일입력추론1회선택. source/checkpoint/precision을변경하지않고입력→mask→기존추론→GLB/UV→download를확인.실패는기존오류코드와복구로만처리.
먼저 `node docs/product-audit-v2/owner-local-preflight.mjs /home/m4ml/Desktop/ObjectScan/ObjectScan-v2`로값없는read-only검사. 대상환경/프로젝트/branch/SHA확인→로컬fixture·dry-run계약검증→변경diff·백업·rollback준비→승인된Owner-local실행→사후검증 순서다. 현재 사용자는 실제 운영 작업을 요청했으므로 계획에서 멈추지 않는다.

#### 사용자만 수행할 외부 단계

Worker/GPU접속또는서비스재기동권한이부족할때만요청.대기 작업과 현재 사용자를 확인하고 기존 운영 검증 범위에서 직접 수행한다.
도메인 교체와 요청된 Owner-local 실행은 이미 승인됐다. 백업·검증 후 직접 수행하고 로그인·2FA 등 본인만 가능한 단계에서 요청한다.

#### 키 없는 예제·팀 계약

선행Team의typedadapter/mock응답,unknown/timeout/409/404를검증한다. `.env.example`는변수이름·설명만,실제키는로컬보안파일에보관하고Team/Git/Issue에노출하지않는다. mock통과는운영성공증거가아니다.

#### Acceptance Criteria

- Given현재대상과백업, When읽기전용검사를수행하면, Then환경·SHA·미확인항목이비밀값없이기록된다.
- Given로컬정상/실패/재시도fixture, When절차를검증하면, Then기존권한·원장·파일보존과rollback경로를확인할수있다.
- Given실제연동실행승인, When본인권한으로검증하면, Then성공/실패·취소·재시도결과와실제/모의구분을남기며미실행이면blocked다.

#### 운영 전 안전 확인·백업·Rollback·완료

모델학습/성능/VRAM최적화/품질비교/파라미터탐색전부폐기.과거실GPU성공은이번freshsmoke와분리.
private backup에는권한600, DB는정책확인된dump, DNS/alias는변경전값과TTL을보존한다. rollback은기존설정/배포로복귀하며원장/원본/메일데이터를삭제하지않는다. 실제적용전정확한변경diff와복구절차가준비되어야한다. 본인인증이필요한단계만구체적으로요청한다.

#### Owner-local Codex 실행 프롬프트

```text
/home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 docs/product-audit-v2/tickets/OS-05.md 전체를읽고 OWNER-LOCAL 작업만수행하라. 실행 중인 user systemd Worker의 운영상태 확인·기존설정백업·대기작업확인·로컬대상고정후기존단일입력추론1회선택. source/checkpoint/precision을변경하지않고입력→mask→기존추론→GLB/UV→download를확인.실패는기존오류코드와복구로만처리. 선행 없음(기존 대상 read-only 확인부터 시작)와현재SHA/설정을확인하고안전한read-only검사·로컬테스트·설정예제·backup/diff/rollback준비는직접하라. Team기능구현이나모델연구로넘어가지말라. 승인된 Owner-local 변경은 백업·검증 후 직접 수행한다. 본인 인증만 요청한다. 사용자에게필요한것은 Worker/GPU접속또는서비스재기동권한이부족할때만요청.대기 작업과 현재 사용자를 확인하고 기존 운영 검증 범위에서 직접 수행한다. 비밀값을출력하지말고실제/모의/대기를구분하라.
```

### OWN-01 — SMTP·인증 콜백 연결과 외부 메일 확인

**OWNER-LOCAL Codex 전용** / 이전이슈 https://github.com/WooSungHyun03/ObjectScan/issues/26 / P0 운영 필수 / 추정0.5인일(외부대기제외,Team합계제외) / 선행 OS-02 / 미완료

#### 실제 근거·문제

`docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md` 및 `evidence/owner-local-preflight.json`의현행코드·환경을기준으로한다. 이전본문은v1보존본에있으며V6가실행범위를대체한다.

#### 이 컴퓨터에서 Codex가 자동 처리할 절차

현재설정존재여부를값없이확인하고localhostMailpit회귀를실행.사용자SMTP설정후redirect allowlist와외부가입/복구확인.
먼저 `node docs/product-audit-v2/owner-local-preflight.mjs /home/m4ml/Desktop/ObjectScan/ObjectScan-v2`로값없는read-only검사. 대상환경/프로젝트/branch/SHA확인→로컬fixture·dry-run계약검증→변경diff·백업·rollback준비→승인된Owner-local실행→사후검증 순서다. 현재 사용자는 실제 운영 작업을 요청했으므로 계획에서 멈추지 않는다.

#### 사용자만 수행할 외부 단계

SMTP대시보드로그인/2FA와본인이수신한메일의인증단계.
도메인 교체와 요청된 Owner-local 실행은 이미 승인됐다. 백업·검증 후 직접 수행하고 로그인·2FA 등 본인만 가능한 단계에서 요청한다.

#### 키 없는 예제·팀 계약

선행Team의typedadapter/mock응답,unknown/timeout/409/404를검증한다. `.env.example`는변수이름·설명만,실제키는로컬보안파일에보관하고Team/Git/Issue에노출하지않는다. mock통과는운영성공증거가아니다.

#### Acceptance Criteria

- Given현재대상과백업, When읽기전용검사를수행하면, Then환경·SHA·미확인항목이비밀값없이기록된다.
- Given로컬정상/실패/재시도fixture, When절차를검증하면, Then기존권한·원장·파일보존과rollback경로를확인할수있다.
- Given실제연동실행승인, When본인권한으로검증하면, Then성공/실패·취소·재시도결과와실제/모의구분을남기며미실행이면blocked다.

#### 운영 전 안전 확인·백업·Rollback·완료

기존auth provider와이메일DNS보존;메일실패시신규가입완료로표시하지않음.
private backup에는권한600, DB는정책확인된dump, DNS/alias는변경전값과TTL을보존한다. rollback은기존설정/배포로복귀하며원장/원본/메일데이터를삭제하지않는다. 실제적용전정확한변경diff와복구절차가준비되어야한다. 본인인증이필요한단계만구체적으로요청한다.

#### Owner-local Codex 실행 프롬프트

```text
/home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 docs/product-audit-v2/tickets/OWN-01.md 전체를읽고 OWNER-LOCAL 작업만수행하라. 현재설정존재여부를값없이확인하고localhostMailpit회귀를실행.사용자SMTP설정후redirect allowlist와외부가입/복구확인. 선행 OS-02와현재SHA/설정을확인하고안전한read-only검사·로컬테스트·설정예제·backup/diff/rollback준비는직접하라. Team기능구현이나모델연구로넘어가지말라. 승인된 Owner-local 변경은 백업·검증 후 직접 수행한다. 본인 인증만 요청한다. 사용자에게필요한것은 SMTP대시보드로그인/2FA와본인이수신한메일의인증단계. 비밀값을출력하지말고실제/모의/대기를구분하라.
```

### OWN-02 — 모델·에셋 권리와 TEST 요금·보관 정책 확정

**OWNER-LOCAL Codex 전용** / 이전이슈 https://github.com/WooSungHyun03/ObjectScan/issues/27 / P0 해당 기능 실연동 시 필요 / 추정0.5인일(외부대기제외,Team합계제외) / 선행 없음 / 미완료

#### 실제 근거·문제

`docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md` 및 `evidence/owner-local-preflight.json`의현행코드·환경을기준으로한다. 이전본문은v1보존본에있으며V6가실행범위를대체한다.

#### 이 컴퓨터에서 Codex가 자동 처리할 절차

기존LICENSE/source/checkpoint목록과운영설정을로컬에서비교하고미확정권리/가격/수수료/보관기간표작성.이미정한도메인교체결정은재질문하지않음.
먼저 `node docs/product-audit-v2/owner-local-preflight.mjs /home/m4ml/Desktop/ObjectScan/ObjectScan-v2`로값없는read-only검사. 대상환경/프로젝트/branch/SHA확인→로컬fixture·dry-run계약검증→변경diff·백업·rollback준비→승인된Owner-local실행→사후검증 순서다. 현재 사용자는 실제 운영 작업을 요청했으므로 계획에서 멈추지 않는다.

#### 사용자만 수행할 외부 단계

권리확인결과와운영정책의본인승인.필요시권리자허락은본인이확보.
도메인 교체와 요청된 Owner-local 실행은 이미 승인됐다. 백업·검증 후 직접 수행하고 로그인·2FA 등 본인만 가능한 단계에서 요청한다.

#### 키 없는 예제·팀 계약

선행Team의typedadapter/mock응답,unknown/timeout/409/404를검증한다. `.env.example`는변수이름·설명만,실제키는로컬보안파일에보관하고Team/Git/Issue에노출하지않는다. mock통과는운영성공증거가아니다.

#### Acceptance Criteria

- Given현재대상과백업, When읽기전용검사를수행하면, Then환경·SHA·미확인항목이비밀값없이기록된다.
- Given로컬정상/실패/재시도fixture, When절차를검증하면, Then기존권한·원장·파일보존과rollback경로를확인할수있다.
- Given실제연동실행승인, When본인권한으로검증하면, Then성공/실패·취소·재시도결과와실제/모의구분을남기며미실행이면blocked다.

#### 운영 전 안전 확인·백업·Rollback·완료

연구제한모델활성화나LIVE결제를승인으로추측하지않음.
private backup에는권한600, DB는정책확인된dump, DNS/alias는변경전값과TTL을보존한다. rollback은기존설정/배포로복귀하며원장/원본/메일데이터를삭제하지않는다. 실제적용전정확한변경diff와복구절차가준비되어야한다. 본인인증이필요한단계만구체적으로요청한다.

#### Owner-local Codex 실행 프롬프트

```text
/home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 docs/product-audit-v2/tickets/OWN-02.md 전체를읽고 OWNER-LOCAL 작업만수행하라. 기존LICENSE/source/checkpoint목록과운영설정을로컬에서비교하고미확정권리/가격/수수료/보관기간표작성.이미정한도메인교체결정은재질문하지않음. 선행 없음와현재SHA/설정을확인하고안전한read-only검사·로컬테스트·설정예제·backup/diff/rollback준비는직접하라. Team기능구현이나모델연구로넘어가지말라. 승인된 Owner-local 변경은 백업·검증 후 직접 수행한다. 본인 인증만 요청한다. 사용자에게필요한것은 권리확인결과와운영정책의본인승인.필요시권리자허락은본인이확보. 비밀값을출력하지말고실제/모의/대기를구분하라.
```

### OWN-03 — Toss TEST 서버 복귀·webhook·환불 실연동

**OWNER-LOCAL Codex 전용** / 이전이슈 https://github.com/WooSungHyun03/ObjectScan/issues/28 / P0 운영 필수 / 추정0.5인일(외부대기제외,Team합계제외) / 선행 OS-10 / 미완료

#### 실제 근거·문제

`docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md` 및 `evidence/owner-local-preflight.json`의현행코드·환경을기준으로한다. 이전본문은v1보존본에있으며V6가실행범위를대체한다.

#### 이 컴퓨터에서 Codex가 자동 처리할 절차

기존키존재와모드만확인하고localproviderfixture회귀.별도Preview의현재SHA/지역/반환URL확인후새TEST주문인증·callback·requery·중복·환불·권한회수검증.
먼저 `node docs/product-audit-v2/owner-local-preflight.mjs /home/m4ml/Desktop/ObjectScan/ObjectScan-v2`로값없는read-only검사. 대상환경/프로젝트/branch/SHA확인→로컬fixture·dry-run계약검증→변경diff·백업·rollback준비→승인된Owner-local실행→사후검증 순서다. 현재 사용자는 실제 운영 작업을 요청했으므로 계획에서 멈추지 않는다.

#### 사용자만 수행할 외부 단계

카드사/간편결제TEST인증또는PG대시보드로그인·2FA.키는로컬보안파일에본인입력.
도메인 교체와 요청된 Owner-local 실행은 이미 승인됐다. 백업·검증 후 직접 수행하고 로그인·2FA 등 본인만 가능한 단계에서 요청한다.

#### 키 없는 예제·팀 계약

선행Team의typedadapter/mock응답,unknown/timeout/409/404를검증한다. `.env.example`는변수이름·설명만,실제키는로컬보안파일에보관하고Team/Git/Issue에노출하지않는다. mock통과는운영성공증거가아니다.

#### Acceptance Criteria

- Given현재대상과백업, When읽기전용검사를수행하면, Then환경·SHA·미확인항목이비밀값없이기록된다.
- Given로컬정상/실패/재시도fixture, When절차를검증하면, Then기존권한·원장·파일보존과rollback경로를확인할수있다.
- Given실제연동실행승인, When본인권한으로검증하면, Then성공/실패·취소·재시도결과와실제/모의구분을남기며미실행이면blocked다.

#### 운영 전 안전 확인·백업·Rollback·완료

LIVE결제/자동정산금지;SSO보호로webhook이막히는지확인하며무조건보호해제하지않음.
private backup에는권한600, DB는정책확인된dump, DNS/alias는변경전값과TTL을보존한다. rollback은기존설정/배포로복귀하며원장/원본/메일데이터를삭제하지않는다. 실제적용전정확한변경diff와복구절차가준비되어야한다. 본인인증이필요한단계만구체적으로요청한다.

#### Owner-local Codex 실행 프롬프트

```text
/home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 docs/product-audit-v2/tickets/OWN-03.md 전체를읽고 OWNER-LOCAL 작업만수행하라. 기존키존재와모드만확인하고localproviderfixture회귀.별도Preview의현재SHA/지역/반환URL확인후새TEST주문인증·callback·requery·중복·환불·권한회수검증. 선행 OS-10와현재SHA/설정을확인하고안전한read-only검사·로컬테스트·설정예제·backup/diff/rollback준비는직접하라. Team기능구현이나모델연구로넘어가지말라. 승인된 Owner-local 변경은 백업·검증 후 직접 수행한다. 본인 인증만 요청한다. 사용자에게필요한것은 카드사/간편결제TEST인증또는PG대시보드로그인·2FA.키는로컬보안파일에본인입력. 비밀값을출력하지말고실제/모의/대기를구분하라.
```

### OWN-04 — 실행 환경·DB 검증·Preview 배포와 운영 승인

**OWNER-LOCAL Codex 전용** / 이전이슈 https://github.com/WooSungHyun03/ObjectScan/issues/29 / P0 운영 필수 / 추정1인일(외부대기제외,Team합계제외) / 선행 OS-22, OS-05, OWN-01, OWN-02, OWN-03, OWN-06 / 미완료

#### 실제 근거·문제

`docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md` 및 `evidence/owner-local-preflight.json`의현행코드·환경을기준으로한다. 이전본문은v1보존본에있으며V6가실행범위를대체한다.

#### 이 컴퓨터에서 Codex가 자동 처리할 절차

현재env이름존재·로컬schema21개·GPU/worker/웹상태를read-only확인.키없는harness와Ownerlocal실연동증거를구분하고정확한SHA로별도Preview준비. DBbackup후연동migration검증. OS-07의키없는sharp진단helper를기존upload normalized응답에optional필드로연결하되DB저장/새알고리즘없이검증한다. 테스트전operatingresource변경없음.
먼저 `node docs/product-audit-v2/owner-local-preflight.mjs /home/m4ml/Desktop/ObjectScan/ObjectScan-v2`로값없는read-only검사. 대상환경/프로젝트/branch/SHA확인→로컬fixture·dry-run계약검증→변경diff·백업·rollback준비→승인된Owner-local실행→사후검증 순서다. 현재 사용자는 실제 운영 작업을 요청했으므로 계획에서 멈추지 않는다.

#### 사용자만 수행할 외부 단계

Supabase/Vercel로그인·2FA또는실제배포반영직전실행확인.
도메인 교체와 요청된 Owner-local 실행은 이미 승인됐다. 백업·검증 후 직접 수행하고 로그인·2FA 등 본인만 가능한 단계에서 요청한다.

#### 키 없는 예제·팀 계약

선행Team의typedadapter/mock응답,unknown/timeout/409/404를검증한다. `.env.example`는변수이름·설명만,실제키는로컬보안파일에보관하고Team/Git/Issue에노출하지않는다. mock통과는운영성공증거가아니다.

#### Acceptance Criteria

- Given현재대상과백업, When읽기전용검사를수행하면, Then환경·SHA·미확인항목이비밀값없이기록된다.
- Given로컬정상/실패/재시도fixture, When절차를검증하면, Then기존권한·원장·파일보존과rollback경로를확인할수있다.
- Given실제연동실행승인, When본인권한으로검증하면, Then성공/실패·취소·재시도결과와실제/모의구분을남기며미실행이면blocked다.

#### 운영 전 안전 확인·백업·Rollback·완료

mainstack무단merge/forcepush금지.서비스키는Team에전달하지않음.기존배포ID/WorkerURL기록후복구가능해야함.
private backup에는권한600, DB는정책확인된dump, DNS/alias는변경전값과TTL을보존한다. rollback은기존설정/배포로복귀하며원장/원본/메일데이터를삭제하지않는다. 실제적용전정확한변경diff와복구절차가준비되어야한다. 본인인증이필요한단계만구체적으로요청한다.

#### Owner-local Codex 실행 프롬프트

```text
/home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 docs/product-audit-v2/tickets/OWN-04.md 전체를읽고 OWNER-LOCAL 작업만수행하라. 현재env이름존재·로컬schema21개·GPU/worker/웹상태를read-only확인.키없는harness와Ownerlocal실연동증거를구분하고정확한SHA로별도Preview준비. DBbackup후연동migration검증. OS-07의키없는sharp진단helper를기존upload normalized응답에optional필드로연결하되DB저장/새알고리즘없이검증한다. 테스트전operatingresource변경없음. 선행 OS-22, OS-05, OWN-01, OWN-02, OWN-03, OWN-06와현재SHA/설정을확인하고안전한read-only검사·로컬테스트·설정예제·backup/diff/rollback준비는직접하라. Team기능구현이나모델연구로넘어가지말라. 승인된 Owner-local 변경은 백업·검증 후 직접 수행한다. 본인 인증만 요청한다. 사용자에게필요한것은 Supabase/Vercel로그인·2FA또는실제배포반영직전실행확인. 비밀값을출력하지말고실제/모의/대기를구분하라.
```

### OWN-05 — be-celeb.org ObjectScan 전환·메일 보존·복구

**OWNER-LOCAL Codex 전용** / 이전이슈 https://github.com/WooSungHyun03/ObjectScan/issues/30 / P0 운영 필수 / 추정1인일(외부대기제외,Team합계제외) / 선행 OWN-04 / 미완료

#### 실제 근거·문제

`docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md` 및 `evidence/owner-local-preflight.json`의현행코드·환경을기준으로한다. 이전본문은v1보존본에있으며V6가실행범위를대체한다.

#### 이 컴퓨터에서 Codex가 자동 처리할 절차

교체결정은완료.현재apex/www/MX/TXT/CAA/프록시/SSL/기존alias를privatebackup. Vercel의현재권장레코드를조회해apex/www웹라우팅변경안만작성.기존데이터와메일레코드보존.새Preview의auth/upload/TEST/download검증후전환절차와5분검증·rollback체크작성.
먼저 `node docs/product-audit-v2/owner-local-preflight.mjs /home/m4ml/Desktop/ObjectScan/ObjectScan-v2`로값없는read-only검사. 대상환경/프로젝트/branch/SHA확인→로컬fixture·dry-run계약검증→변경diff·백업·rollback준비→승인된Owner-local실행→사후검증 순서다. 현재 사용자는 실제 운영 작업을 요청했으므로 계획에서 멈추지 않는다.

#### 사용자만 수행할 외부 단계

필요한 Cloudflare/Vercel 로그인·2FA만. 도메인 사용·교체 승인을 다시 묻지 않는다.
도메인 교체와 요청된 Owner-local 실행은 이미 승인됐다. 백업·검증 후 직접 수행하고 로그인·2FA 등 본인만 가능한 단계에서 요청한다.

#### 키 없는 예제·팀 계약

선행Team의typedadapter/mock응답,unknown/timeout/409/404를검증한다. `.env.example`는변수이름·설명만,실제키는로컬보안파일에보관하고Team/Git/Issue에노출하지않는다. mock통과는운영성공증거가아니다.

#### Acceptance Criteria

- Given현재대상과백업, When읽기전용검사를수행하면, Then환경·SHA·미확인항목이비밀값없이기록된다.
- Given로컬정상/실패/재시도fixture, When절차를검증하면, Then기존권한·원장·파일보존과rollback경로를확인할수있다.
- Given실제연동실행승인, When본인권한으로검증하면, Then성공/실패·취소·재시도결과와실제/모의구분을남기며미실행이면blocked다.

#### 운영 전 안전 확인·백업·Rollback·완료

이감사에서는DNS변경안함.실패시정확한기존웹레코드와alias복구,MX/TXT/데이터삭제없음. IP하드코딩금지.
private backup에는권한600, DB는정책확인된dump, DNS/alias는변경전값과TTL을보존한다. rollback은기존설정/배포로복귀하며원장/원본/메일데이터를삭제하지않는다. 실제적용전정확한변경diff와복구절차가준비되어야한다. 본인인증이필요한단계만구체적으로요청한다.

#### Owner-local Codex 실행 프롬프트

```text
/home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 docs/product-audit-v2/tickets/OWN-05.md 전체를읽고 OWNER-LOCAL 작업만수행하라. 교체결정은완료.현재apex/www/MX/TXT/CAA/프록시/SSL/기존alias를privatebackup. Vercel의현재권장레코드를조회해apex/www웹라우팅변경안만작성.기존데이터와메일레코드보존.새Preview의auth/upload/TEST/download검증후전환절차와5분검증·rollback체크작성. 선행 OWN-04와현재SHA/설정을확인하고안전한read-only검사·로컬테스트·설정예제·backup/diff/rollback준비는직접하라. Team기능구현이나모델연구로넘어가지말라. 승인된 Owner-local 변경은 백업·검증 후 직접 수행한다. 본인 인증만 요청한다. 사용자에게필요한것은 필요한 Cloudflare/Vercel 로그인·2FA만. 도메인 사용·교체 승인을 다시 묻지 않는다. 비밀값을출력하지말고실제/모의/대기를구분하라.
```

### OWN-06 — 구매 라이선스·버전 불변 snapshot 서버·DB 연동

**OWNER-LOCAL Codex 전용** / 이전이슈 https://github.com/WooSungHyun03/ObjectScan/issues/36 / P0 운영 필수 / 추정1.5인일(외부대기제외,Team합계제외) / 선행 OS-04 / 미완료

#### 실제 근거·문제

`docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md` 및 `evidence/owner-local-preflight.json`의현행코드·환경을기준으로한다. 이전본문은v1보존본에있으며V6가실행범위를대체한다.

#### 이 컴퓨터에서 Codex가 자동 처리할 절차

현재orders/asset_purchases/schema를검토하고로컬전용DB에서additive snapshot migration·transaction·RLS/중복정산테스트. legacy는unknown. typedfixture를OS-04와맞춰선택값을노출.
먼저 `node docs/product-audit-v2/owner-local-preflight.mjs /home/m4ml/Desktop/ObjectScan/ObjectScan-v2`로값없는read-only검사. 대상환경/프로젝트/branch/SHA확인→로컬fixture·dry-run계약검증→변경diff·백업·rollback준비→승인된Owner-local실행→사후검증 순서다. 현재 사용자는 실제 운영 작업을 요청했으므로 계획에서 멈추지 않는다.

#### 사용자만 수행할 외부 단계

운영DBmigration반영직전본인확인/접속인증만.
도메인 교체와 요청된 Owner-local 실행은 이미 승인됐다. 백업·검증 후 직접 수행하고 로그인·2FA 등 본인만 가능한 단계에서 요청한다.

#### 키 없는 예제·팀 계약

선행Team의typedadapter/mock응답,unknown/timeout/409/404를검증한다. `.env.example`는변수이름·설명만,실제키는로컬보안파일에보관하고Team/Git/Issue에노출하지않는다. mock통과는운영성공증거가아니다.

#### Acceptance Criteria

- Given현재대상과백업, When읽기전용검사를수행하면, Then환경·SHA·미확인항목이비밀값없이기록된다.
- Given로컬정상/실패/재시도fixture, When절차를검증하면, Then기존권한·원장·파일보존과rollback경로를확인할수있다.
- Given실제연동실행승인, When본인권한으로검증하면, Then성공/실패·취소·재시도결과와실제/모의구분을남기며미실행이면blocked다.

#### 운영 전 안전 확인·백업·Rollback·완료

DB백업과forwardfix계획;원장파괴적rollback금지.테스트정산은localmock만.
private backup에는권한600, DB는정책확인된dump, DNS/alias는변경전값과TTL을보존한다. rollback은기존설정/배포로복귀하며원장/원본/메일데이터를삭제하지않는다. 실제적용전정확한변경diff와복구절차가준비되어야한다. 본인인증이필요한단계만구체적으로요청한다.

#### Owner-local Codex 실행 프롬프트

```text
/home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 docs/product-audit-v2/tickets/OWN-06.md 전체를읽고 OWNER-LOCAL 작업만수행하라. 현재orders/asset_purchases/schema를검토하고로컬전용DB에서additive snapshot migration·transaction·RLS/중복정산테스트. legacy는unknown. typedfixture를OS-04와맞춰선택값을노출. 선행 OS-04와현재SHA/설정을확인하고안전한read-only검사·로컬테스트·설정예제·backup/diff/rollback준비는직접하라. Team기능구현이나모델연구로넘어가지말라. 승인된 Owner-local 변경은 백업·검증 후 직접 수행한다. 본인 인증만 요청한다. 사용자에게필요한것은 운영DBmigration반영직전본인확인/접속인증만. 비밀값을출력하지말고실제/모의/대기를구분하라.
```

### OWN-07 — 삭제·보관 hold·storage cleanup 서버 정합성

**OWNER-LOCAL Codex 전용** / 이전이슈 https://github.com/WooSungHyun03/ObjectScan/issues/37 / P0 해당 기능 실연동 시 필요 / 추정1.5인일(외부대기제외,Team합계제외) / 선행 OS-11, OWN-06 / 미완료

#### 실제 근거·문제

`docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md` 및 `evidence/owner-local-preflight.json`의현행코드·환경을기준으로한다. 이전본문은v1보존본에있으며V6가실행범위를대체한다.

#### 이 컴퓨터에서 Codex가 자동 처리할 절차

현재DELETE assets/data-deletion/maintenance보존조건검토.로컬고정fixture로pending/paid/refunded/유효권한/실패storage삭제재시도계약구현준비와schema계획작성.승인후원장보존hold/정리manifest별도구현.
먼저 `node docs/product-audit-v2/owner-local-preflight.mjs /home/m4ml/Desktop/ObjectScan/ObjectScan-v2`로값없는read-only검사. 대상환경/프로젝트/branch/SHA확인→로컬fixture·dry-run계약검증→변경diff·백업·rollback준비→승인된Owner-local실행→사후검증 순서다. 현재 사용자는 실제 운영 작업을 요청했으므로 계획에서 멈추지 않는다.

#### 사용자만 수행할 외부 단계

보관정책확정과원격삭제활성화직전확인만.
도메인 교체와 요청된 Owner-local 실행은 이미 승인됐다. 백업·검증 후 직접 수행하고 로그인·2FA 등 본인만 가능한 단계에서 요청한다.

#### 키 없는 예제·팀 계약

선행Team의typedadapter/mock응답,unknown/timeout/409/404를검증한다. `.env.example`는변수이름·설명만,실제키는로컬보안파일에보관하고Team/Git/Issue에노출하지않는다. mock통과는운영성공증거가아니다.

#### Acceptance Criteria

- Given현재대상과백업, When읽기전용검사를수행하면, Then환경·SHA·미확인항목이비밀값없이기록된다.
- Given로컬정상/실패/재시도fixture, When절차를검증하면, Then기존권한·원장·파일보존과rollback경로를확인할수있다.
- Given실제연동실행승인, When본인권한으로검증하면, Then성공/실패·취소·재시도결과와실제/모의구분을남기며미실행이면blocked다.

#### 운영 전 안전 확인·백업·Rollback·완료

현재구매중차단을제거하지않음.휴지통/완전계정삭제범위확대금지,실제원격삭제전dry-runmanifest필수.
private backup에는권한600, DB는정책확인된dump, DNS/alias는변경전값과TTL을보존한다. rollback은기존설정/배포로복귀하며원장/원본/메일데이터를삭제하지않는다. 실제적용전정확한변경diff와복구절차가준비되어야한다. 본인인증이필요한단계만구체적으로요청한다.

#### Owner-local Codex 실행 프롬프트

```text
/home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 docs/product-audit-v2/tickets/OWN-07.md 전체를읽고 OWNER-LOCAL 작업만수행하라. 현재DELETE assets/data-deletion/maintenance보존조건검토.로컬고정fixture로pending/paid/refunded/유효권한/실패storage삭제재시도계약구현준비와schema계획작성.승인후원장보존hold/정리manifest별도구현. 선행 OS-11, OWN-06와현재SHA/설정을확인하고안전한read-only검사·로컬테스트·설정예제·backup/diff/rollback준비는직접하라. Team기능구현이나모델연구로넘어가지말라. 승인된 Owner-local 변경은 백업·검증 후 직접 수행한다. 본인 인증만 요청한다. 사용자에게필요한것은 보관정책확정과원격삭제활성화직전확인만. 비밀값을출력하지말고실제/모의/대기를구분하라.
```

### OWN-08 — poster 저장·검증·공개 미리보기 API 연결

**OWNER-LOCAL Codex 전용** / 이전이슈 https://github.com/WooSungHyun03/ObjectScan/issues/38 / P0 해당 기능 실연동 시 필요 / 추정1인일(외부대기제외,Team합계제외) / 선행 OS-09 / 미완료

#### 실제 근거·문제

`docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md` 및 `evidence/owner-local-preflight.json`의현행코드·환경을기준으로한다. 이전본문은v1보존본에있으며V6가실행범위를대체한다.

#### 이 컴퓨터에서 Codex가 자동 처리할 절차

별도poster field/metadata필요성검토하고기존previewGLB와분리. MIME/magicbytes/decode1600px2MB재인코딩,소유권·moderation후공개,private원본미노출API/로컬migration준비.
먼저 `node docs/product-audit-v2/owner-local-preflight.mjs /home/m4ml/Desktop/ObjectScan/ObjectScan-v2`로값없는read-only검사. 대상환경/프로젝트/branch/SHA확인→로컬fixture·dry-run계약검증→변경diff·백업·rollback준비→승인된Owner-local실행→사후검증 순서다. 현재 사용자는 실제 운영 작업을 요청했으므로 계획에서 멈추지 않는다.

#### 사용자만 수행할 외부 단계

인증 권한이 없을 때 필요한 로그인·2FA만.
도메인 교체와 요청된 Owner-local 실행은 이미 승인됐다. 백업·검증 후 직접 수행하고 로그인·2FA 등 본인만 가능한 단계에서 요청한다.

#### 키 없는 예제·팀 계약

선행Team의typedadapter/mock응답,unknown/timeout/409/404를검증한다. `.env.example`는변수이름·설명만,실제키는로컬보안파일에보관하고Team/Git/Issue에노출하지않는다. mock통과는운영성공증거가아니다.

#### Acceptance Criteria

- Given현재대상과백업, When읽기전용검사를수행하면, Then환경·SHA·미확인항목이비밀값없이기록된다.
- Given로컬정상/실패/재시도fixture, When절차를검증하면, Then기존권한·원장·파일보존과rollback경로를확인할수있다.
- Given실제연동실행승인, When본인권한으로검증하면, Then성공/실패·취소·재시도결과와실제/모의구분을남기며미실행이면blocked다.

#### 운영 전 안전 확인·백업·Rollback·완료

외부URLfetch금지;실패시genericfallback,새poster참조만비활성화하여기존GLB미리보기유지.
private backup에는권한600, DB는정책확인된dump, DNS/alias는변경전값과TTL을보존한다. rollback은기존설정/배포로복귀하며원장/원본/메일데이터를삭제하지않는다. 실제적용전정확한변경diff와복구절차가준비되어야한다. 본인인증이필요한단계만구체적으로요청한다.

#### Owner-local Codex 실행 프롬프트

```text
/home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 docs/product-audit-v2/tickets/OWN-08.md 전체를읽고 OWNER-LOCAL 작업만수행하라. 별도poster field/metadata필요성검토하고기존previewGLB와분리. MIME/magicbytes/decode1600px2MB재인코딩,소유권·moderation후공개,private원본미노출API/로컬migration준비. 선행 OS-09와현재SHA/설정을확인하고안전한read-only검사·로컬테스트·설정예제·backup/diff/rollback준비는직접하라. Team기능구현이나모델연구로넘어가지말라. 승인된 Owner-local 변경은 백업·검증 후 직접 수행한다. 본인 인증만 요청한다. 사용자에게필요한것은 인증 권한이 없을 때 필요한 로그인·2FA만. 비밀값을출력하지말고실제/모의/대기를구분하라.
```

### OWN-09 — 외부 GLB private 수입 등록·게시 서버 연결

**OWNER-LOCAL Codex 전용** / 이전이슈 https://github.com/WooSungHyun03/ObjectScan/issues/39 / P0 해당 기능 실연동 시 필요 / 추정2인일(외부대기제외,Team합계제외) / 선행 OS-17, OWN-06 / 미완료

#### 실제 근거·문제

`docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md` 및 `evidence/owner-local-preflight.json`의현행코드·환경을기준으로한다. 이전본문은v1보존본에있으며V6가실행범위를대체한다.

#### 이 컴퓨터에서 Codex가 자동 처리할 절차

기존64MiBGLBvalidator·privatebucket·프로젝트/아티팩트FK를검토하고provenance=import의명시적등록계약·권한·quota·idempotency·원본불변·moderation을로컬DB로검증.생성job성공을위조하지않고필요schema만additive.
먼저 `node docs/product-audit-v2/owner-local-preflight.mjs /home/m4ml/Desktop/ObjectScan/ObjectScan-v2`로값없는read-only검사. 대상환경/프로젝트/branch/SHA확인→로컬fixture·dry-run계약검증→변경diff·백업·rollback준비→승인된Owner-local실행→사후검증 순서다. 현재 사용자는 실제 운영 작업을 요청했으므로 계획에서 멈추지 않는다.

#### 사용자만 수행할 외부 단계

인증 권한이 없을 때 필요한 로그인·2FA만.
도메인 교체와 요청된 Owner-local 실행은 이미 승인됐다. 백업·검증 후 직접 수행하고 로그인·2FA 등 본인만 가능한 단계에서 요청한다.

#### 키 없는 예제·팀 계약

선행Team의typedadapter/mock응답,unknown/timeout/409/404를검증한다. `.env.example`는변수이름·설명만,실제키는로컬보안파일에보관하고Team/Git/Issue에노출하지않는다. mock통과는운영성공증거가아니다.

#### Acceptance Criteria

- Given현재대상과백업, When읽기전용검사를수행하면, Then환경·SHA·미확인항목이비밀값없이기록된다.
- Given로컬정상/실패/재시도fixture, When절차를검증하면, Then기존권한·원장·파일보존과rollback경로를확인할수있다.
- Given실제연동실행승인, When본인권한으로검증하면, Then성공/실패·취소·재시도결과와실제/모의구분을남기며미실행이면blocked다.

#### 운영 전 안전 확인·백업·Rollback·완료

외부URI/zip/remoteURL금지.도입불가시Team로컬편집/export는유지하고cloudsave는pending.작업의모든코드실행은Owner-local.
private backup에는권한600, DB는정책확인된dump, DNS/alias는변경전값과TTL을보존한다. rollback은기존설정/배포로복귀하며원장/원본/메일데이터를삭제하지않는다. 실제적용전정확한변경diff와복구절차가준비되어야한다. 본인인증이필요한단계만구체적으로요청한다.

#### Owner-local Codex 실행 프롬프트

```text
/home/m4ml/Desktop/ObjectScan/ObjectScan-v2에서 docs/product-audit-v2/tickets/OWN-09.md 전체를읽고 OWNER-LOCAL 작업만수행하라. 기존64MiBGLBvalidator·privatebucket·프로젝트/아티팩트FK를검토하고provenance=import의명시적등록계약·권한·quota·idempotency·원본불변·moderation을로컬DB로검증.생성job성공을위조하지않고필요schema만additive. 선행 OS-17, OWN-06와현재SHA/설정을확인하고안전한read-only검사·로컬테스트·설정예제·backup/diff/rollback준비는직접하라. Team기능구현이나모델연구로넘어가지말라. 승인된 Owner-local 변경은 백업·검증 후 직접 수행한다. 본인 인증만 요청한다. 사용자에게필요한것은 인증 권한이 없을 때 필요한 로그인·2FA만. 비밀값을출력하지말고실제/모의/대기를구분하라.
```
