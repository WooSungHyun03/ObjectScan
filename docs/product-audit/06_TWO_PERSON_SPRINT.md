# 2명·10근무일 실행 계획
**각자7.5인일, 총15인일 개발(120시간) + 총5인일 버퍼(25%,40시간)**. 1인일8시간으로 가정하며 개발량은 테스트/UX수정 포함. 통합지연·리뷰·GPU실험실패·Owner대기 우회는 버퍼. Owner작업은0인일로본것이아니라외부승인시간이므로분모에서제외. 차이0%, 10~15%이내목표충족. 둘다UI/API/DB/3D/테스트를섞었고고정직무가아니다.

|담당|티켓|합계|난이도/위험|
|---|---|---|---|
|A|OS-01 .5, OS-03 1.5, OS-05 1.5, OS-07 1.5, OS-09 1, OS-11 1.5|7.5|계약·복구 UI/API·GPU회귀·CPU진단·마켓·DB삭제|
|B|OS-02 1, OS-04 1.5, OS-06 1.5, OS-08 1.5, OS-10 1, OS-12 1|7.5|인증UX·DB권리·3D편집metadata·마스크·결제·CI통합|

## D1~D10 보드 (상호리뷰 포함 버퍼를 표시)
|일|팀원 A|팀원 B|시작/완료 게이트|
|---|---|---|---|
|D1|OS-01 .5 + OS-03 .5|OS-02 1|기준SHA/AGENTS확인;계약먼저merge|
|D2|OS-03 1|OS-04 1|공통api.ts 소유시간예약,helper분리|
|D3|OS-05 1|OS-04 .5 + OS-06 .5|credit/rights계약고정;GPU1slot|
|D4|OS-05 .5 + OS-07 .5|OS-06 1|SV실험 timebox 실패도증거;UV카드완료|
|D5|OS-07 1|OS-08 1|diagnostic helper분리;target/mask stale계약|
|D6|OS-09 1|OS-08 .5 + OS-10 .5|poster OS-06후;mask OS-03후|
|D7|OS-11 1|OS-10 .5 + 버퍼 .5|OS-04 snapshot후삭제hold;결제mock완료|
|D8|OS-11 .5 + 버퍼 .5|버퍼1|모든feature PR통합·상호리뷰;Owner는별도|
|D9|버퍼1|OS-12 1|선행12개중11개완료 후전체smoke/gate|
|D10|버퍼1|버퍼1|새기능없음,회귀수정/Owner인계/미통과보류|

A버퍼2.5/B버퍼2.5。 WIP 각1, 최대2(리뷰대기만). Critical path OS-01→OS-03→OS-08→OS-12 및 OS-04→OS-11→OS-12. Owner SMTP/권리/TEST검증/Preview가늦어도localmock·기능검증은진행하지만 공개MVP완료선언은불가.

## 브랜치·충돌·일일 통합
main에서 바로 기능branch를 파지 않는다. `feat/service-launch-v5@7ee1709`의stack PR구조를먼저확인하고 팀공유통합branch 기준을고정한다. 기존남의branch를rebase/forcepush하지않는다. 각 ticket branch→작은PR→상대리뷰→직렬merge. api.ts(shared router)는A/B동시대규모수정금지,전용helper와계약fixture로분리. migration번호merge직전확인;DB파괴적reset은disposablelocal만.

매일 `npm run lint && npm run typecheck && npm test && npm run build`와 localsmoke;UI변경시360/768/1440Playwright캡처·axe·수동키보드. Python수정시Worker26개회귀+해당fixture. GPU실제run은직렬·시간제한·hash있는manifest. OS-12가명령을자동화해도앞선티켓이검증을미루지않는다.

## 현실적 완료 판정
두주후 제한SV/private프로젝트/검토/복구/기본편집/TEST거래권리까지 로컬AC충족이목표. Owner승인과외부E2E없이는공개상용출시완료아님. P0위험이증가하면OS-09→OS-07순서로P1범위를내리고절약시간을P0에사용;절대P2로교체하지않는다. 예측치와실제소요를매일backlog.json과PR에갱신하되20인일을초과예약하지않는다.
