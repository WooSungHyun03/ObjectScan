# ObjectScan — 팀원 A 전용 실행 문서

**이 파일 하나만 해당 담당자에게 전달한다.** 담당 외 티켓 본문은 포함하지 않는다. 7개 티켓, 기존 추정 **7.5인일**. 추정은 테스트·수정·문서를 포함하며 AI가 즉시 끝낸다는 보장이 아니다.

## 현재 상태를 먼저 구분하기

2026-11-12의 확인된 상태다. 이후 변경 가능하므로 시작할 때 최신 main 코드를 확인한다.

- 통합 기준은 main이며, 이 문서 작성 기준 commit은 `d26eb72`다. 예전 감사의 main이 낡았다는 설명은 적용하지 않는다.
- https://be-celeb.org/ 는 ObjectScan으로 연결됐고 www는308로 대표 주소에 이동한다. **도메인 교체 자체를 다시 구현하거나 승인 요청하지 않는다.** 공개 사이트는 기존 Production 배포이며 최신 main 기능 모두가 공개 활성화된 것은 아니다.
- Worker는 `systemctl --user` 범위에서 실행 중이다. system 범위 inactive만 보고 장애라고 판단하지 않는다. 새 실제 GPU 생성 전체 검증과 CI/mock은 별개다.
- 구매 시점 snapshot migration22는 hosted에 적용됐고 컬럼 조회·health를 확인했다. **API/UI·새 실제 구매까지의 전체 검증은 아직 남았다.** migration을 중복 생성하지 않는다.
- 외부 SMTP·새 실제 TEST 결제·GLB ingress/poster·보관/정리·최종 도메인 인증 callback은 남은 통합 게이트다. 팀의 fixture 통과로 이들을 완료 처리하지 않는다.

## 담당 경계와 개발 환경

A/B 모두 제품 단위 풀스택 티켓 묶음이며 직무로 나누지 않는다. Team은 운영 키 없이 UI·typed contract·fixture를 구현한다. 운영 DB 설정/migration, GPU 환경, SMTP/API 키, 실제 PG, Cloudflare/Vercel/DNS/배포는 Owner-local 전용이다.

금지 경로: `supabase/**`, `gpu-worker/**`, `.env*`, `apps/web/src/lib/server/**`, `apps/web/src/lib/supabase/**`. 필요하면 이 경로를 수정하지 말고 Owner 인계 계약을 남긴다. 프로젝트의 server-only 컴포넌트 때문에 키가 요구되면 OS-12의 별도 fixture shell을 사용하며 production 인증 우회 route를 만들지 않는다.

팀원 PC의 checkout 경로는 자유다. 아래 옛 감사 근거의 로컬 경로는 실제 checkout 루트로 해석한다. OS-12/OS-22 테스트 명령은 만들 산출물이며 시작 시 존재 여부를 확인해야 한다. 전체 `npm test`의 DB integration은 Owner가 담당하고 Team은 키 없는 관련 unit/fixture/browser 검증을 수행한다.

## 바이브코딩 작업 방식

1. **이 파일 하나를 Codex에 첨부하고 아래 첫 실행 프롬프트를 보낸다.** 사람이 코드를 직접 분류하거나 셸 명령을 조합할 필요가 없다. 저장소를 못 찾는 경우에만 실제 checkout 위치를 알려준다.
2. Codex는 현재 코드·AGENTS·선행 변경을 확인하고 한 번에 티켓 하나만 구현한다. 이미 되는 기능은 재개발하지 않는다. 모델 연구·학습·새 알고리즘·무관한 리팩터링은 제외한다.
3. 각 티켓의 AC → 작은 구현 → 자동 테스트 → 실제 브라우저 확인 → 수정 → 재검증 순서로 진행한다. 정상·실패·재시도와 해당 권한 경계를 확인한다. 화면 변경은360/768/1440 및 키보드/접근성을 검수한다.
4. 선행 Team 변경이 없으면 fixture/helper 등 독립 부분만 진행한다. 차단된 부분을 완료로 표시하지 않고 다음 Ready 티켓을 선택한다. OS-12 전에는 기존 순수 helper/unit으로 시작하고 브라우저 fixture는 준비 후 연결한다.
5. 새 endpoint/응답 필드가 필요하면 필드명·타입·nullable·오류코드·fixture JSON을 기록해 Owner에 인계한다. 운영 권한을 얻거나 서버 파일을 고쳐서 우회하지 않는다.
6. 독립 티켓 브랜치에서 작업하고 변경 파일·검증 로그·스크린샷·SHA를 남긴다. main 통합은 최신 remote 확인·상대 검토·회귀 후 수행한다. force push/reset이나 다른 사람의 작업 삭제는 금지한다. 공유 파일은 feature helper로 분리하고 변경 순서를 맞춘다.
7. 각 티켓 끝에는 아래 결과 형식으로 답한다. 결과를 다음 Codex 대화에 넣으면 중단 지점부터 이어갈 수 있다.

```text
티켓 / 담당:
기준 SHA → 결과 SHA / 브랜치 또는 PR:
변경 파일과 사용자에게 달라진 점:
AC별 PASS / FAIL / NOT_RUN:
검증 명령 · exit code · 화면 증거:
MOCK 또는 실제 연동 여부:
Owner/상대 팀원에 필요한 계약·선행:
남은 문제와 rollback:
다음 Ready 티켓 / 재개 지점:
```

TEAM_PASS는 UI/로컬 계약 검증 완료다. OWNER_PENDING은 실제 서버 연결/외부 인증 대기다. 선행이 없는 상태를 PASS로 만들거나 테스트 출력을 꾸며내지 않는다.

## 첫 실행 프롬프트 — 그대로 복사

```text
너는 ObjectScan의 팀원 A 작업을 맡은 구현 에이전트다. 첨부한 MEMBER_A.md 전체를 읽고 로컬 ObjectScan 저장소를 찾아 git 상태와 최신 origin/main, 적용 AGENTS를 확인하라. 저장소가 없으면 https://github.com/WooSungHyun03/ObjectScan 의 접근 가능 여부를 확인하고 checkout을 준비하라. 기존 변경을 덮어쓰지 마라.
이 문서의 담당 7개 티켓만 맡고 첫 티켓 OS-01부터 시작하라. 한 번에 한 티켓씩 실제 코드를 확인→구현→자동 검증→화면 확인→수정→재검증하라. 계획만 쓰고 끝내지 마라. AC를 충족하면 검증 증거와 다음 Ready 티켓을 기록하고 이어가라. 의존성 미충족이면 독립 범위를 진행하거나 다음 Ready 티켓을 선택하고 차단 이유를 남겨라.
키/운영 DB/migration/GPU/SMTP/PG 실인증/배포에 접근하지 말고 typed adapter와 fixture로 개발하라. Owner 의존 작업은 계약과 OWNER_PENDING으로 인계하라. 다른 담당자의 파일을 넓게 고치지 마라.
새 AI 모델/학습/성능 연구를 하지 말고 이미 있는 기능을 중복 개발하지 마라. 각 티켓별 변경 파일, AC 결과, 실행 명령·exit code, MOCK/실제 구분, SHA·브랜치/PR·캡처, 남은 문제와 다음 재개 지점을 보고하라.
```

## 중단·사용 한도 후 재개 프롬프트

```text
첨부한 MEMBER_A.md와 직전 결과 보고를 읽고 중단 지점부터 이어가라. git 상태·현재 SHA·이미 반영된 변경과 마지막 검증 로그를 먼저 확인하라. 완료한 티켓을 처음부터 다시 구현하거나 다른 사람의 변경을 지우지 마라. 진행 중 티켓의 남은 AC부터 구현·검증하고 완료 증거를 갱신한 뒤 다음 Ready 티켓으로 넘어가라. 이전의 MOCK 통과/실연동 대기 구분을 보존하라. 실행하지 않은 검증은 NOT_RUN으로 남겨라.
```

## 내 티켓과 권장 착수 순서

| 순서 | 티켓·문제                                                                                                         | 인일 | Team/연결 선행 | Owner 실연동 |
| ---- | ----------------------------------------------------------------------------------------------------------------- | ---: | -------------- | ------------ |
| 1    | [OS-01](https://github.com/WooSungHyun03/ObjectScan/issues/8) 현재 지원 범위·실패 이유·차감 안내를 생성 전에 표시 |  0.5 | 없음           | 없음         |
| 2    | [OS-03](https://github.com/WooSungHyun03/ObjectScan/issues/10) 통신 단절 뒤 작업 polling 재개와 중복 클릭 방지    |  1.5 | OS-01          | 없음         |
| 3    | [OS-06](https://github.com/WooSungHyun03/ObjectScan/issues/13) 기존 편집 정보로 원본·버전 비교와 JSON 내보내기    |    1 | 없음           | 없음         |
| 4    | [OS-09](https://github.com/WooSungHyun03/ObjectScan/issues/16) 실제 모델에서 만든 썸네일 확인·마켓 카드 표시      |    1 | OS-19          | OWN-08       |
| 5    | [OS-17](https://github.com/WooSungHyun03/ObjectScan/issues/24) 외부 GLB 로컬 편집에서 개인 저장·게시로 이어가기   |  1.5 | OS-06          | OWN-09       |
| 6    | [OS-20](https://github.com/WooSungHyun03/ObjectScan/issues/33) 편집 동작 이력·삭제 확인·저장 오류 복구            |  1.5 | OS-06          | 없음         |
| 7    | [OS-11](https://github.com/WooSungHyun03/ObjectScan/issues/18) 삭제 확인·중복 클릭 차단·권리 보존 오류 안내       |  0.5 | 없음           | OWN-07       |

## 2주 작업 배치

| 일  | 개발·버퍼           |
| --- | ------------------- |
| D1  | OS-01 .5 + OS-03 .5 |
| D2  | OS-03 1             |
| D3  | OS-06 1             |
| D4  | OS-09 1             |
| D5  | OS-17 1             |
| D6  | OS-17 .5 + OS-20 .5 |
| D7  | OS-20 1             |
| D8  | OS-11 .5 + 버퍼 .5  |
| D9  | 버퍼1               |
| D10 | 버퍼1               |

A7.5/B8인일, 두 사람 차이0.5인일. 합계15.5/20인일로 통합·문제 해결 버퍼22.5%. A는 OS-09 전에 B의 OS-19를 기다리고, OS-06 편집 helper 이후 OS-17/20을 직렬 작업한다.

## 티켓 상세 — 구현 범위·AC·검증·개별 프롬프트

공통 프롬프트와 최신 상태가 과거 감사 문구보다 우선한다. 아래 개별 티켓 전체를 같은 대화에 넣으면 해당 티켓만 이어서 실행할 수 있다. 추가 문서는 근거이며 본문을 읽기 위해 여러 티켓 파일을 따로 전달할 필요는 없다.

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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-01`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-01`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-01/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-01 (현재 지원 범위·실패 이유·차감 안내를 생성 전에 표시)를 구현하라. docs/product-audit-v2/tickets/OS-01.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-01독립브랜치로작업하라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-03`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-03`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-03/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-03 (통신 단절 뒤 작업 polling 재개와 중복 클릭 방지)를 구현하라. docs/product-audit-v2/tickets/OS-03.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-01의반영을확인한뒤 ticket/os-03독립브랜치로작업하라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-06`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-06`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-06/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-06 (기존 편집 정보로 원본·버전 비교와 JSON 내보내기)를 구현하라. docs/product-audit-v2/tickets/OS-06.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-06독립브랜치로작업하라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-09`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-09`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-09/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-09 (실제 모델에서 만든 썸네일 확인·마켓 카드 표시)를 구현하라. docs/product-audit-v2/tickets/OS-09.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-19의반영을확인한뒤 ticket/os-09독립브랜치로작업하라.
코드탐색: apps/web/src/features/marketplace/asset-card.tsx; apps/web/src/components/publish-form.tsx; apps/web/src/components/model-viewer.tsx / AssetCard / CameraTools. 현재문제: viewer PNG 다운로드는 이미 있지만 마켓카드는 일반 아이콘이다. 스크린샷 기능 자체를 중복 제작하지 않는다. 최소범위: 기존 capture 재사용한 사용자 확인 poster·실패fallback·card rendering typed contract. public storage/API 연결은 OWN-08.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 OWN-08은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-17`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-17`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-17/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-17 (외부 GLB 로컬 편집에서 개인 저장·게시로 이어가기)를 구현하라. docs/product-audit-v2/tickets/OS-17.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-06의반영을확인한뒤 ticket/os-17독립브랜치로작업하라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-20`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-20`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-20/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-20 (편집 동작 이력·삭제 확인·저장 오류 복구)를 구현하라. docs/product-audit-v2/tickets/OS-20.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-06의반영을확인한뒤 ticket/os-20독립브랜치로작업하라.
코드탐색: apps/web/src/components/editor/mesh-editor.tsx; apps/web/src/components/editor/inspector-panel.tsx; apps/web/src/components/editor/use-mesh-editor.ts / MeshEditor / useMeshEditor / dirty. 현재문제: 변환·노드hide/delete·간소화·undo/redo disabled 상태·beforeunload/링크이탈확인·저장key재사용은이미있다. 삭제는즉시실행되고동작목록이없어어디까지되돌릴지찾기어렵다. 최소범위: 기존ops/cursor로한국어동작이력과현재위치표시·선택지점으로되돌리기·부품삭제확인·저장실패재시도안내. 기존undo/dirty/이탈확인기능은재구현하지않고회귀로보존. facecrop/brush/알고리즘추가없음.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-11`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-11`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-11/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-11 (삭제 확인·중복 클릭 차단·권리 보존 오류 안내)를 구현하라. docs/product-audit-v2/tickets/OS-11.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-11독립브랜치로작업하라.
코드탐색: apps/web/src/components/asset-library.tsx; apps/web/src/components/account-panels.tsx / AssetLibrary.deleteAsset / SettingsPanel. 현재문제: 현재에셋영구삭제/구매중차단과계정삭제검토요청이있다. 안전한busy/실패복구UX만추가한다. 최소범위: 삭제dialog대상명·busyguard·취소·409권리보류·503재시도. 휴지통/복원/정리manifest/DB삭제정책은OWN-07.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 OWN-07은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고0.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```
