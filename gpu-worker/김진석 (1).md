# ObjectScan — 팀원 B 전용 실행 문서

**이 파일 하나만 해당 담당자에게 전달한다.** 담당 외 티켓 본문은 포함하지 않는다. 10개 티켓, 기존 추정 **8인일**. 추정은 테스트·수정·문서를 포함하며 AI가 즉시 끝낸다는 보장이 아니다.

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
너는 ObjectScan의 팀원 B 작업을 맡은 구현 에이전트다. 첨부한 MEMBER_B.md 전체를 읽고 로컬 ObjectScan 저장소를 찾아 git 상태와 최신 origin/main, 적용 AGENTS를 확인하라. 저장소가 없으면 https://github.com/WooSungHyun03/ObjectScan 의 접근 가능 여부를 확인하고 checkout을 준비하라. 기존 변경을 덮어쓰지 마라.
이 문서의 담당 10개 티켓만 맡고 첫 티켓 OS-12부터 시작하라. 한 번에 한 티켓씩 실제 코드를 확인→구현→자동 검증→화면 확인→수정→재검증하라. 계획만 쓰고 끝내지 마라. AC를 충족하면 검증 증거와 다음 Ready 티켓을 기록하고 이어가라. 의존성 미충족이면 독립 범위를 진행하거나 다음 Ready 티켓을 선택하고 차단 이유를 남겨라.
키/운영 DB/migration/GPU/SMTP/PG 실인증/배포에 접근하지 말고 typed adapter와 fixture로 개발하라. Owner 의존 작업은 계약과 OWNER_PENDING으로 인계하라. 다른 담당자의 파일을 넓게 고치지 마라.
새 AI 모델/학습/성능 연구를 하지 말고 이미 있는 기능을 중복 개발하지 마라. 각 티켓별 변경 파일, AC 결과, 실행 명령·exit code, MOCK/실제 구분, SHA·브랜치/PR·캡처, 남은 문제와 다음 재개 지점을 보고하라.
```

## 중단·사용 한도 후 재개 프롬프트

```text
첨부한 MEMBER_B.md와 직전 결과 보고를 읽고 중단 지점부터 이어가라. git 상태·현재 SHA·이미 반영된 변경과 마지막 검증 로그를 먼저 확인하라. 완료한 티켓을 처음부터 다시 구현하거나 다른 사람의 변경을 지우지 마라. 진행 중 티켓의 남은 AC부터 구현·검증하고 완료 증거를 갱신한 뒤 다음 Ready 티켓으로 넘어가라. 이전의 MOCK 통과/실연동 대기 구분을 보존하라. 실행하지 않은 검증은 NOT_RUN으로 남겨라.
```

## 내 티켓과 권장 착수 순서

| 순서 | 티켓·문제                                                                                                        | 인일 | Team/연결 선행                                                                                                 | Owner 실연동 |
| ---- | ---------------------------------------------------------------------------------------------------------------- | ---: | -------------------------------------------------------------------------------------------------------------- | ------------ |
| 1    | [OS-12](https://github.com/WooSungHyun03/ObjectScan/issues/19) 키·DB 없는 공통 UI fixture 시작점                 |  0.5 | 없음                                                                                                           | 없음         |
| 2    | [OS-02](https://github.com/WooSungHyun03/ObjectScan/issues/9) 가입·복구 링크 오류와 메일 대기의 복구 UI          |    1 | 없음                                                                                                           | OWN-01       |
| 3    | [OS-04](https://github.com/WooSungHyun03/ObjectScan/issues/11) 구매 당시 이용 조건과 legacy 누락값 조회 UI       |  0.5 | 없음                                                                                                           | OWN-06       |
| 4    | [OS-19](https://github.com/WooSungHyun03/ObjectScan/issues/32) 결과 뷰어 앞·뒤·좌·우 시점과 재맞춤               |    1 | 없음                                                                                                           | 없음         |
| 5    | [OS-07](https://github.com/WooSungHyun03/ObjectScan/issues/14) 기존 sharp 선명도 경고·중복 안내·사진 순서 정리   |  1.5 | OS-01                                                                                                          | OWN-04       |
| 6    | [OS-08](https://github.com/WooSungHyun03/ObjectScan/issues/15) 마스크 실패·재선택·이전 단계 복귀의 안내와 접근성 |    1 | OS-01                                                                                                          | 없음         |
| 7    | [OS-10](https://github.com/WooSungHyun03/ObjectScan/issues/17) TEST 결제 응답 유실·중복 복귀의 상태 복구 UI      |    1 | OS-01                                                                                                          | OWN-03       |
| 8    | [OS-18](https://github.com/WooSungHyun03/ObjectScan/issues/25) 마켓 라이선스·가격 필터와 URL 검색 상태           |  0.5 | 없음                                                                                                           | 없음         |
| 9    | [OS-21](https://github.com/WooSungHyun03/ObjectScan/issues/34) 구매 내역의 한국어 상태와 에셋 재다운로드 연결    |  0.5 | 없음                                                                                                           | 없음         |
| 10   | [OS-22](https://github.com/WooSungHyun03/ObjectScan/issues/35) 팀원 fixture 통합 회귀와 Owner 인계 리포트        |  0.5 | OS-01, OS-02, OS-03, OS-04, OS-06, OS-07, OS-08, OS-09, OS-10, OS-11, OS-12, OS-17, OS-18, OS-19, OS-20, OS-21 | 없음         |

## 2주 작업 배치

| 일  | 개발·버퍼           |
| --- | ------------------- |
| D1  | OS-12 .5 + OS-02 .5 |
| D2  | OS-02 .5 + OS-04 .5 |
| D3  | OS-19 1             |
| D4  | OS-07 1             |
| D5  | OS-07 .5 + OS-08 .5 |
| D6  | OS-08 .5 + OS-10 .5 |
| D7  | OS-10 .5 + OS-18 .5 |
| D8  | OS-21 .5 + 버퍼 .5  |
| D9  | OS-22 .5 + 버퍼 .5  |
| D10 | 버퍼1               |

A7.5/B8인일, 두 사람 차이0.5인일. 합계15.5/20인일로 통합·문제 해결 버퍼22.5%. B의 첫날 OS-12는 A도 사용한다. OS-19는 A의 OS-09 전에 반영하고 OS-22는 모든 Team 티켓 뒤에 진행한다.

## 티켓 상세 — 구현 범위·AC·검증·개별 프롬프트

공통 프롬프트와 최신 상태가 과거 감사 문구보다 우선한다. 아래 개별 티켓 전체를 같은 대화에 넣으면 해당 티켓만 이어서 실행할 수 있다. 추가 문서는 근거이며 본문을 읽기 위해 여러 티켓 파일을 따로 전달할 필요는 없다.

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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-12`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-12`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-12/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-12 (키·DB 없는 공통 UI fixture 시작점)를 구현하라. docs/product-audit-v2/tickets/OS-12.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-01, OS-02, OS-03, OS-04, OS-06, OS-07, OS-08, OS-09, OS-10, OS-11, OS-17, OS-18, OS-19, OS-20, OS-21의반영을확인한뒤 ticket/os-12독립브랜치로작업하라.
코드탐색: tests/e2e; tests; scripts; docs/product-audit-v2 / test fixtures / local smoke report. 현재문제: 현재CI가Supabase서비스키·DBfixture에의존한다. 팀원완료증거와Owner실연동증거를분리해야한다. 최소범위: 서버서비스없이도정적export가능한UI harness/Storybook형fixture route또는Vite fixture shell을검토해최소React harness구현. browser API intercept만으로SSR인증우회가안됨을반영. 첫날0.5인일에키없는entry와공통API adapter·최소2개상태fixture의실행을제공한다. 전체8과업·캡처통합은OS-22로분리.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고0.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```

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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-02`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-02`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-02/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-02 (가입·복구 링크 오류와 메일 대기의 복구 UI)를 구현하라. docs/product-audit-v2/tickets/OS-02.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-02독립브랜치로작업하라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-04`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-04`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-04/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-04 (구매 당시 이용 조건과 legacy 누락값 조회 UI)를 구현하라. docs/product-audit-v2/tickets/OS-04.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-04독립브랜치로작업하라.
코드탐색: apps/web/src/components/account-panels.tsx; apps/web/src/components/listing-detail.tsx; apps/web/src/features/marketplace/presentation.ts / BillingPanel / licenseLabels. 현재문제: 금액 snapshot은 있으나 license snapshot은 없다. UI는 현재 listing 조건을 과거 구매조건처럼 표시하면 안 된다. 최소범위: snapshot typed view-model·fixture와 구매내역 조건 표시. absent=기록 확인중 legacy 표시. DB/주문 생성/권한/서버 transaction은 OWN-06.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 OWN-06은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고0.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-19`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-19`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-19/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-19 (결과 뷰어 앞·뒤·좌·우 시점과 재맞춤)를 구현하라. docs/product-audit-v2/tickets/OS-19.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-19독립브랜치로작업하라.
코드탐색: apps/web/src/components/model-viewer.tsx; apps/web/src/components/viewer.tsx / ModelViewer / CameraTools / Bounds. 현재문제: orbit/reset/배경/조명/PNG는이미존재.방향preset과renderer재생성없는맞춤으로초보조작을줄인다. 최소범위: Drei기존Bounds/OrbitControls target으로front/back/left/right/fit버튼,현재axis정의설명,키보드/360toolbar.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-07`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-07`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-07/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-07 (기존 sharp 선명도 경고·중복 안내·사진 순서 정리)를 구현하라. docs/product-audit-v2/tickets/OS-07.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-01의반영을확인한뒤 ticket/os-07독립브랜치로작업하라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-08`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-08`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-08/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-08 (마스크 실패·재선택·이전 단계 복귀의 안내와 접근성)를 구현하라. docs/product-audit-v2/tickets/OS-08.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-01의반영을확인한뒤 ticket/os-08독립브랜치로작업하라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-10`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-10`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-10/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-10 (TEST 결제 응답 유실·중복 복귀의 상태 복구 UI)를 구현하라. docs/product-audit-v2/tickets/OS-10.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-01의반영을확인한뒤 ticket/os-10독립브랜치로작업하라.
코드탐색: apps/web/src/components/payment-result.tsx; apps/web/src/components/checkout-button.tsx; apps/web/src/features/billing/checkout-panel.tsx; tests/e2e/payment-result.spec.ts / PaymentResult.confirm / CheckoutButton.checkout. 현재문제: 기존실제TEST/환불기록과callback재시도UI는있다. 요청중복·불명/만료주문·복귀경계만보강한다. 최소범위: provider mock과 기존order조회로 중복busyguard·정상/실패/불명상태·재진입 회귀. 실제키·웹훅·provider검증·원장수정 제외.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 OWN-03은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고1인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-18`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-18`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-18/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-18 (마켓 라이선스·가격 필터와 URL 검색 상태)를 구현하라. docs/product-audit-v2/tickets/OS-18.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-18독립브랜치로작업하라.
코드탐색: apps/web/src/components/marketplace.tsx; apps/web/src/features/marketplace/asset-card.tsx / Marketplace / Listing. 현재문제: 검색·카테고리·가격정렬과신고접수는이미있다.기존응답의license/price로목록을좁히고검색복귀상태를보존한다. 최소범위: 기존목록응답에대한라이선스·가격localfilter와URLquery/back복원. 결과가서버페이지일부면현재불러온목록한정표시.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고0.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-21`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 첫날0.5인일 공통 fixture entry와 `playwright.team.config.ts`에 자기 feature fixture를 추가하여 `npx playwright test --config playwright.team.config.ts --grep OS-21`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 fixture를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-21/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-21 (구매 내역의 한국어 상태와 에셋 재다운로드 연결)를 구현하라. docs/product-audit-v2/tickets/OS-21.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 없음의반영을확인한뒤 ticket/os-21독립브랜치로작업하라.
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

repo: `<ObjectScan 저장소 루트>`. 먼저 `git status`, `git log -1`, 루트/하위AGENTS, `docs/product-audit-v2/01_ACTUAL_IMPLEMENTATION_AUDIT.md`와 이 티켓 전체를 읽는다. 기준은 최신 `origin/main`이다. 과거 앱 debc1f7/감사e411f87은 근거 이력이다. 선행PR을포함한팀 dev branch에서 `ticket/OS-22`를 만들고 타인변경을 덮어쓰지 않는다.

키없는 Unit: `npx vitest run tests/domain.test.ts tests/customer-copy.test.ts packages/mesh-editor/src/editor.test.ts` (마지막 실제 경로는 `rg --files packages/mesh-editor`로 확인). `npm run typecheck`, `npm run lint`와 티켓 fixture unit/integration을 실행한다. 기존 `npm test` 전체에는 DB integration이 포함되므로 Team에 DB접속을 요구하지 않는다. Owner는 기존 전체 suite를 별도로 실행한다. OS-12의 기존 key-free fixture entry와 `playwright.team.config.ts`를 재사용하여 `npx playwright test --config playwright.team.config.ts --grep OS-22`로 실행 가능하게 한다. 이 명령은 **구현할 산출물**이며 현재 존재하는 것으로 주장하지 않는다. OS-22는 이를 하나로 통합하고 중복 harness를 제거한다. UI를 테스트하기 위해 프로덕션 인증 우회 route를 만들지 않는다.

정상·오류·재시도/권한fixture를 최소3개 작성, 360/768/1440 캡처·키보드·axe·GLB roundtrip(해당시)을 제출한다. `output/playwright/OS-22/`에 SHA,명령,exit code와 redacted로그를 남기며 JWT/keys/signedURL은 저장하지 않는다. mock 캡처는 **MOCK**임을 문서에 명시한다. 기존서버를써야하는실연동회귀는Owner-only다.

#### 완료·Rollback

AC와 관련 unit/browser회귀가 통과하고 다른팀원 리뷰가 끝나야 Team완료. 새 UI는localfeature gate 또는선택적adapter로 rollback가능하게하고 원본GLB·private파일·기존API권한·기존결제상태를보존한다. 실패/미연동/미검증을 완료로 바꾸지 않는다. 모델 연구·새학습·품질실험·새crop알고리즘은하지않는다.

#### 독립 실행 Codex 프롬프트

```text
프로젝트 <ObjectScan 저장소 루트>에서 OS-22 (팀원 fixture 통합 회귀와 Owner 인계 리포트)를 구현하라. docs/product-audit-v2/tickets/OS-22.md 전체와 현재AGENTS,01_ACTUAL_IMPLEMENTATION_AUDIT.md,12_INTEGRATION_PLAN.md를읽고git상태와선행 OS-01, OS-02, OS-03, OS-04, OS-06, OS-07, OS-08, OS-09, OS-10, OS-11, OS-12, OS-17, OS-18, OS-19, OS-20, OS-21의반영을확인한뒤 ticket/os-22독립브랜치로작업하라.
코드탐색: tests/e2e; tests; scripts; docs/product-audit-v2 / test fixtures / local smoke report. 현재문제: 현재CI가Supabase서비스키·DBfixture에의존한다. 팀원완료증거와Owner실연동증거를분리해야한다. 최소범위: OS-12가제공한키없는entry에서완료된기능fixture를8과업으로통합하고세viewport·회귀·TEAM_PASS/OWNER_PENDING리포트를검증한다. 새harness구현은제외한다.
키·Supabase설정/migration·GPU·PG·배포작업은금지다. Owner의존 없음은 typed adapter와fixture로분리하라. 정상/오류/재시도와360/768/1440화면을검증하고위명령으로unit/type/lint/browser를실행하라. 기존기능을보존하고0.5인일추정을넘는scope를추가하지말라. AC별로그·SHA·캡처를남기고mock통과/실연동대기를구분하여PR로제출하라. 모델연구/새알고리즘을시작하지말라.
```
