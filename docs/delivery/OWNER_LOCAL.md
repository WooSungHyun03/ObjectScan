# ObjectScan — Owner-local 전용 실행 문서

**이 파일 하나만 해당 담당자에게 전달한다.** 담당 외 티켓 본문은 포함하지 않는다. 10개 티켓, 기존 추정 **10인일**. 추정은 테스트·수정·문서를 포함하며 AI가 즉시 끝낸다는 보장이 아니다.

## 현재 상태를 먼저 구분하기

2026-11-12의 확인된 상태다. 이후 변경 가능하므로 시작할 때 최신 main 코드를 확인한다.

- 통합 기준은 main이며, 이 문서 작성 기준 commit은 `d26eb72`다. 예전 감사의 main이 낡았다는 설명은 적용하지 않는다.
- https://be-celeb.org/ 는 ObjectScan으로 연결됐고 www는308로 대표 주소에 이동한다. **도메인 교체 자체를 다시 구현하거나 승인 요청하지 않는다.** 공개 사이트는 기존 Production 배포이며 최신 main 기능 모두가 공개 활성화된 것은 아니다.
- Worker는 `systemctl --user` 범위에서 실행 중이다. system 범위 inactive만 보고 장애라고 판단하지 않는다. 새 실제 GPU 생성 전체 검증과 CI/mock은 별개다.
- 구매 시점 snapshot migration22는 hosted에 적용됐고 컬럼 조회·health를 확인했다. **API/UI·새 실제 구매까지의 전체 검증은 아직 남았다.** migration을 중복 생성하지 않는다.
- 외부 SMTP·새 실제 TEST 결제·GLB ingress/poster·보관/정리·최종 도메인 인증 callback은 남은 통합 게이트다. 팀의 fixture 통과로 이들을 완료 처리하지 않는다.

## Owner의 남은 범위

이 문서의10인일은 초기 전체 범위 추정으로, 이미 끝난 도메인 라우팅·Worker 관리·migration22를 다시 수행하는 잔여 공수 추정이 아니다. 다음 작업 전 현재 구현을 재확인하고 남은 부분만 수행한다.

- OS-05: 기존 추론의 새 운영 smoke·취소/실패 복구 확인. 모델/정밀도/체크포인트 변경 없음.
- OWN-01: 실제 외부 메일 가입/복구와 최종 도메인 callback.
- OWN-02: 권리와 기존 가격/수수료/보관 정책의 미결 항목 확인. 임의 운영 가격 확정 금지.
- OWN-06: 기존 migration22를 재사용해 API/권한/UI 계약과 새 실제 구매 snapshot 연결 검증.
- OWN-03: TEST 승인/재조회/중복/환불/원장. LIVE·송금 비활성 유지.
- OWN-07/08/09: 삭제·보관 정합성 / 실제 모델 poster / 외부 GLB private 등록의 남은 서버 연결.
- OWN-04: 팀 인계 후 정확 SHA Preview, 전체 흐름 검증과 release evidence.
- OWN-05: **라우팅 완료**. 남은 외부 인증/PG callback·로그·복구 게이트 확인. Cloudflare/DNS 전환을 재실행하지 않는다.

Owner는 로컬에 이미 있는 인증된 CLI/권한으로 직접 실행한다. 접근 가능한 일을 사용자에게 명령 실행으로 떠넘기지 않는다. 본인 로그인·2FA·CAPTCHA·카드사 인증만 요청한다. 비밀 값은 채팅/Git/Issue/스크린샷에 기록하지 않는다. DB 변경은 백업·로컬 검증 후 additive 방식으로 진행하고 운영 reset/drop은 금지한다.

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
너는 ObjectScan의 Owner-local 작업을 맡은 구현 에이전트다. 첨부한 OWNER_LOCAL.md 전체를 읽고 로컬 ObjectScan 저장소를 찾아 git 상태와 최신 origin/main, 적용 AGENTS를 확인하라. 저장소가 없으면 https://github.com/WooSungHyun03/ObjectScan 의 접근 가능 여부를 확인하고 checkout을 준비하라. 기존 변경을 덮어쓰지 마라.
이 문서의 담당 10개 티켓만 맡고 첫 티켓 OS-05부터 시작하라. 한 번에 한 티켓씩 실제 코드를 확인→구현→자동 검증→화면 확인→수정→재검증하라. 계획만 쓰고 끝내지 마라. AC를 충족하면 검증 증거와 다음 Ready 티켓을 기록하고 이어가라. 의존성 미충족이면 독립 범위를 진행하거나 다음 Ready 티켓을 선택하고 차단 이유를 남겨라.
이미 수행한 Worker 관리·migration22·도메인 전환은 재실행하지 말고 실제 상태와 남은 통합 게이트만 확인하라. 기존 인증 권한으로 직접 수행하고 본인만 가능한 인증 단계에서만 요청하라. 백업·권한·원장·원본 보존과 rollback을 확인하라. LIVE 결제/송금은 켜지 마라.
새 AI 모델/학습/성능 연구를 하지 말고 이미 있는 기능을 중복 개발하지 마라. 각 티켓별 변경 파일, AC 결과, 실행 명령·exit code, MOCK/실제 구분, SHA·브랜치/PR·캡처, 남은 문제와 다음 재개 지점을 보고하라.
```

## 중단·사용 한도 후 재개 프롬프트

```text
첨부한 OWNER_LOCAL.md와 직전 결과 보고를 읽고 중단 지점부터 이어가라. git 상태·현재 SHA·이미 반영된 변경과 마지막 검증 로그를 먼저 확인하라. 완료한 티켓을 처음부터 다시 구현하거나 다른 사람의 변경을 지우지 마라. 진행 중 티켓의 남은 AC부터 구현·검증하고 완료 증거를 갱신한 뒤 다음 Ready 티켓으로 넘어가라. 이전의 MOCK 통과/실연동 대기 구분을 보존하라. 실행하지 않은 검증은 NOT_RUN으로 남겨라.
```

## 내 티켓과 권장 착수 순서

| 순서 | 티켓·문제                                                                                                     | 인일 | Team/연결 선행                               | Owner 실연동 |
| ---- | ------------------------------------------------------------------------------------------------------------- | ---: | -------------------------------------------- | ------------ |
| 1    | [OS-05](https://github.com/WooSungHyun03/ObjectScan/issues/12) 기존 추론 운영 smoke·취소·오류 안내 확인       |  0.5 | 없음                                         | 본인         |
| 2    | [OWN-01](https://github.com/WooSungHyun03/ObjectScan/issues/26) SMTP·인증 콜백 연결과 외부 메일 확인          |  0.5 | OS-02                                        | 본인         |
| 3    | [OWN-02](https://github.com/WooSungHyun03/ObjectScan/issues/27) 모델·에셋 권리와 TEST 요금·보관 정책 확정     |  0.5 | 없음                                         | 본인         |
| 4    | [OWN-06](https://github.com/WooSungHyun03/ObjectScan/issues/36) 구매 라이선스·버전 불변 snapshot 서버·DB 연동 |  1.5 | OS-04                                        | 본인         |
| 5    | [OWN-03](https://github.com/WooSungHyun03/ObjectScan/issues/28) Toss TEST 서버 복귀·webhook·환불 실연동       |  0.5 | OS-10                                        | 본인         |
| 6    | [OWN-07](https://github.com/WooSungHyun03/ObjectScan/issues/37) 삭제·보관 hold·storage cleanup 서버 정합성    |  1.5 | OS-11, OWN-06                                | 본인         |
| 7    | [OWN-08](https://github.com/WooSungHyun03/ObjectScan/issues/38) poster 저장·검증·공개 미리보기 API 연결       |    1 | OS-09                                        | 본인         |
| 8    | [OWN-09](https://github.com/WooSungHyun03/ObjectScan/issues/39) 외부 GLB private 수입 등록·게시 서버 연결     |    2 | OS-17, OWN-06                                | 본인         |
| 9    | [OWN-04](https://github.com/WooSungHyun03/ObjectScan/issues/29) 실행 환경·DB 검증·Preview 배포와 운영 승인    |    1 | OS-22, OS-05, OWN-01, OWN-02, OWN-03, OWN-06 | 본인         |
| 10   | [OWN-05](https://github.com/WooSungHyun03/ObjectScan/issues/30) be-celeb.org ObjectScan 전환·메일 보존·복구   |    1 | OWN-04                                       | 본인         |

## 티켓 상세 — 구현 범위·AC·검증·개별 프롬프트

공통 프롬프트와 최신 상태가 과거 감사 문구보다 우선한다. 아래 개별 티켓 전체를 같은 대화에 넣으면 해당 티켓만 이어서 실행할 수 있다. 추가 문서는 근거이며 본문을 읽기 위해 여러 티켓 파일을 따로 전달할 필요는 없다.

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
