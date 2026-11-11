# 현재 상태 감사 — 2026-11-12 KST

## 판정
**2주 내 목표는 단일 이미지 객체 제작의 신뢰 가능한 제한 MVP다.** 모든 사진 수와 공간 복원을 지원하는 상용 완제품은 현재 근거로 약속할 수 없다. 이번 감사는 제품 코드를 변경하지 않았다. 기존 증거 재검토와 새 로컬 테스트를 구분했다.

|기준|확인된 상태|근거|
|---|---|---|
|작업 저장소|부모 ObjectScan 아래 실제 Git repo ObjectScan-v2|git status/log/remote|
|최신 개발 기준|feat/service-launch-v5 7ee1709, 앱 소스 debc1f7|reports/RELEASE_EVIDENCE.md, git log|
|GitHub main|a67a0c1, 최신 앱 미통합|원격 branch/PR 조회|
|PR|#1→main, #5→#1 branch, #6→#5 branch, draft #7→#6 branch|[PR7](https://github.com/WooSungHyun03/ObjectScan/pull/7)|
|공개 운영|objectscan-six.vercel.app 200; 이전 v4 기준, 생성/결제 비활성|evidence/deployment-readonly.json + 기존 release report|
|최신 Preview|objectscan-qz44npios-sunghyuns-projects-da008879.vercel.app; 비인증302 SSO|이번 읽기 전용 검사. 기존 보고서 READY/icn1 정확 SHA 증거와 구분|
|최종 후보 도메인|be-celeb.org 200, 현재 title 이지 마케팅(Easy Marketing), 다른 서비스 충돌|이번 HTTP title 확인; 기존 문서상 sw-system 서비스. Owner 승인 전 DNS 변경 금지|
|로컬|127.0.0.1:3010, compiled v5, 로컬 Supabase56321|이번 Chromium/E2E|
|GPU|RTX4080 16376MiB, 조회 시1366MiB 사용, worker systemd active|이번 nvidia-smi/systemctl 조회. 장치 존재는 모델 성공 증명이 아님|

## 기능 인벤토리
검증 분류는 파일 존재가 아니라 아래 범위에 적용한다. **이전 실제 검증**도 실행 시점·입력 범위를 한정한다.

|화면/기능|분류|현재 증거·제한|
|---|---|---|
|한국어 랜딩/모바일/요금/마켓 탐색|실제 동작 검증|이번 360/768/1440 캡처 및 9 Chromium 회귀. semantic dark/마스코트 적용됨|
|가입 확인/비밀번호 복구|실제 동작 검증(로컬), 접근 불가(외부 메일)|auth-email.spec.ts + Mailpit. 외부 SMTP 신규 메일은 미확인|
|프로젝트/private 업로드/권한|실제 동작 검증|platform.spec.ts; signed upload/RLS, 파일 정규화·SHA dedup 존재|
|대상 선택/마스크 승인·제외|실제 동작 검증|SAM2 CUDA 이전 실GPU, 현재 local API/UI 회귀. 수동 brush 없음. 서버 reviewed/revision gate는 이미 존재|
|이미지1장 textured GLB|실제 동작 검증(이전 단일 사례)|job ea25227c-abba-42ff-8e45-d4224b503a47; 원본39,134,488B; 964,287 triangles; UV734,969; texture3,286,528B; 489.46s adapter, peak12994MiB; 전체 브라우저 약10.8분. 이번 새 GPU 생성 없음|
|2~20장 MV|코드만 존재/실험 실패|1024 4뷰 OOM. 512 진단은 실촬영 카메라/마스크 경로 검증 아님. 지원 gate 유지|
|21장 이상 객체|코드만 존재/품질 실패|OAL30k 학습/UV GLB 존재하지만 구멍·파편으로 시각 탈락|
|장면 전체|코드만 존재/품질 실패|GW32장 학습·102.7MB GLB viewer 성공, 시각 파편 탈락. splat 성공을 Mesh 성공으로 대체하지 않음|
|큐/취소/재시도/환급|실제 동작 검증(자동)|atomic GPU1 slot, lease/fencing/heartbeat, process-group cancel, exactly-once credit. 브라우저 재접속 전체 경계는 OS-03 보강|
|3D 뷰어/기본 편집|실제 동작 검증|변환·노드 hide/delete·center/normalize·simplify·undo/redo·private version 저장·재열기·다운로드 roundtrip. 39MB fixture 이번 재검증. editor에 삼각형·파일크기·UV/표면이미지 기본 정보도 존재|
|face crop/paint/remesh/UV 편집|미구현|노드 삭제와 face 편집은 다름. geometry decimation과 retopology는 다름|
|로컬 외부 GLB 편집|실제 동작 검증|editor import/export. 외부 GLB를 cloud artifact로 등록·게시하는 bridge는 미구현|
|크레딧/TEST 거래/환불|실제 동작 검증(이전 실제 TEST)|실사용자 TEST 인증,1000원 주문/환불,중복 재조회,market fee100/net900 가상원장. LIVE 결제/송금 아님|
|최신 자동 callback/webhook 전달|코드만 존재/미검증|서울 이동 전 IP allowlist 문제 후 수동 callback 복구 증거. 이동 후 새 자동복귀·외부 webhook 전달 미확인|
|마켓 게시/검토/구매/권한|실제 동작 검증|이전 2계정 실제 TEST/환불,private39MB 다운로드,타인/환불 후 새링크404. 테스트 listing 제거. 현재 빈 마켓은 정상 상태|
|시장 poster·구매 라이선스 snapshot|미구현|asset-card 일반 icon; 주문 license_snapshot 없음. 금액 snapshot은 이미 존재|
|저장소 정리|부분 실제 동작 검증|maintenance cleanup pending/rejected 중심+1GiB budget. 정상 프로젝트 삭제·거래 hold 정리는 미완|
|요금 상품/운영 수수료|UI만 존재/운영 비활성|실충전 상품·공식 수수료 미확정. TEST 계산 원장과 구분|
|실판매자 지급/추천/리뷰/고급 리깅|미구현/이번 범위 제외|원장/수동 요청만. 실제 송금 금지|

## 코드·계약 추적
`apps/web/src/lib/server/api.ts`: gateProject→upload init/complete→target→mask approve/pose→job→artifact→publish/order/entitlement. `files.ts`: sharp decode, EXIF rotate, bounded image normalization, SHA exact dedup. `packages/shared/src`: route/schema. `gpu-worker/objectscan_worker`: queue lease→adapter subprocess→bake→GLB validation→finalize. `packages/mesh-editor/src/contracts.ts,index.ts`: typed edit operations/GLB processing. `supabase/migrations`: owner RLS, credit/order snapshots/lease/entitlement.

업로드 최대장수 설계200은 검증된 지원장수200이 아니다. 편집 허용 embedded GLB64MiB, texture8192px/16MP each/48MP total,5000nodes/64textures/256materials. 외부 URI·압축 required extensions·skin/animation은 제한된다. 단일 artifact의 UV 존재는 watertight/치수 정확도/상품성과 동의어가 아니다.

## 이번 자동 검증
- Node/Vitest **60 pass,1 optional skip**,9 files pass/1 skip.
- TypeScript web/editor/shared **통과**.
- Python Worker **26 pass** (19.38s).
- Chromium **9 pass** (47.8s): 이메일·private 업로드·편집 버전/권한·39MB LOD/full export·결제 callback mock·반응형/axe.
- build/lint: 이번은 문서만 추가하므로 새 실행하지 않음. 기존 CI app SHA 통과 기록은 별도; 이 감사에서 새 build 통과로 주장하지 않음.
- 이번 실제 GPU 생성/외부 SMTP/새 Toss 인증/프로덕션 배포 **미실시**. 로컬 브라우저 테스트는 disposable fixture만 변경.

기존 CI: [platform/worker run](https://github.com/WooSungHyun03/ObjectScan/actions/runs/43101840578), [추가 run](https://github.com/WooSungHyun03/ObjectScan/actions/runs/43101832566). 원시 traces/auth state/signed URL은 공개 증거에 포함하지 않는다.
