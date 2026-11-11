# 근거 인덱스
조사일2026-11-12 KST; JSON UTC21시대는KST다음날06시대다. 기준7ee1709 / 앱debc1f7. 원시비밀환경·브라우저authstate·트레이스·signedURL은공개하지않는다.

## 이번 직접 검증
- [공개 경쟁사 관찰](evidence/browser-observations.json): Chromium공개랜딩1440/360. Tripo403 challenge로실사용불가.
- [settled 화면/DOM](evidence/followup.json): Meshy workspace(생성미실행),ObjectScan publicroutes,Polycam/KIRI. 초기Polycam흰화면은결함판정에서제외하고settled이미지를사용.
- [배포 읽기전용](evidence/deployment-readonly.json): 공개200/Preview302/다른도메인200title. 운영설정은변경하지않음.
- [테스트 요약](evidence/test-results.txt):Node60pass1skip,TypeScriptpass,Worker26pass,Chromium9pass. 실제코드아닌로컬fixture흐름검증.
- [설치 버전](evidence/installed.json):npm실제설치목록;최신업스트림버전으로오해금지.

## 화면
- [kiri-1440.png](evidence/kiri-1440.png) — 공개 직접 관찰
- [kiri-360.png](evidence/kiri-360.png) — 공개 직접 관찰
- [kiri-web-1440-settled.png](evidence/kiri-web-1440-settled.png) — 공개 직접 관찰
- [kiri-web-360-settled.png](evidence/kiri-web-360-settled.png) — 공개 직접 관찰
- [kiri-web-768-settled.png](evidence/kiri-web-768-settled.png) — 공개 직접 관찰
- [local-create-1440-settled.png](evidence/local-create-1440-settled.png) — 공개 직접 관찰
- [local-create-360-settled.png](evidence/local-create-360-settled.png) — 공개 직접 관찰
- [local-create-768-settled.png](evidence/local-create-768-settled.png) — 공개 직접 관찰
- [local-market-1440-settled.png](evidence/local-market-1440-settled.png) — 공개 직접 관찰
- [local-market-360-settled.png](evidence/local-market-360-settled.png) — 공개 직접 관찰
- [local-market-768-settled.png](evidence/local-market-768-settled.png) — 공개 직접 관찰
- [local-pricing-1440-settled.png](evidence/local-pricing-1440-settled.png) — 공개 직접 관찰
- [local-pricing-360-settled.png](evidence/local-pricing-360-settled.png) — 공개 직접 관찰
- [local-pricing-768-settled.png](evidence/local-pricing-768-settled.png) — 공개 직접 관찰
- [meshy-1440.png](evidence/meshy-1440.png) — 공개 직접 관찰
- [meshy-360.png](evidence/meshy-360.png) — 공개 직접 관찰
- [meshy-create-1440-settled.png](evidence/meshy-create-1440-settled.png) — 공개 직접 관찰
- [meshy-create-360-settled.png](evidence/meshy-create-360-settled.png) — 공개 직접 관찰
- [meshy-create-768-settled.png](evidence/meshy-create-768-settled.png) — 공개 직접 관찰
- [objectscan-1440-settled.png](evidence/objectscan-1440-settled.png) — 공개 직접 관찰
- [objectscan-360-settled.png](evidence/objectscan-360-settled.png) — 공개 직접 관찰
- [objectscan-768-settled.png](evidence/objectscan-768-settled.png) — 공개 직접 관찰
- [polycam-1440-settled.png](evidence/polycam-1440-settled.png) — 공개 직접 관찰
- [polycam-1440.png](evidence/polycam-1440.png) — 공개 직접 관찰
- [polycam-360-settled.png](evidence/polycam-360-settled.png) — 공개 직접 관찰
- [polycam-360.png](evidence/polycam-360.png) — 공개 직접 관찰
- [polycam-768-settled.png](evidence/polycam-768-settled.png) — 공개 직접 관찰
- [tripo-1440.png](evidence/tripo-1440.png) — challenge/접근불가, 제품화면 아님
- [tripo-360.png](evidence/tripo-360.png) — challenge/접근불가, 제품화면 아님

## 이전 실제 검증 (이번 반복 실행 아님)
- [release evidence](../../reports/RELEASE_EVIDENCE.md):실GPU한장→privateGLB/실제TEST/환불/서울Preview/fixture격리.
- [모델 감사](../MODEL_AUDIT.md), [운영 runbook](../RUNBOOK_V5.md).
- [SV](../validation/pixal-single-fp16.json), [MV OOM](../validation/pixal-mv-oom.json), [MV512진단](../validation/pixal-mv-512.json), [객체21](../validation/oal-object21.json), [scene32](../validation/gw-scene32.json), [hosted SAM2](../validation/hosted-sam2.json).

## 조사 명령·한계
`git status/log/branch -a`, `gh pr list`, `gh issue list --state all`,manifest/lock/migrations/TS/Python코드rg읽기,`systemctl is-active objectscan-worker.service`,`nvidia-smi`,읽기전용HTTP. `npm test`,`npm run typecheck`,`gpu-worker/.venv/bin/python -m pytest gpu-worker/tests`와3010용Playwright config로9회귀를실행. 이번lint/build새실행없음. GPU/Toss실결제/외부메일검증은새실행하지않음.

공식 경쟁사URL/확인일/검증유형/플랜은02_COMPETITOR_MATRIX.md에있다. 기술공식문서는04에있다. UI UX Pro Max local search(task recovery,error validation)와Vercel [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) 실제읽기,확인2026-11-12. 화면비평에사용했으며새Figma/MagicPath디자인작업을수행한것으로보고하지않는다. 생성품질/전체한국어지원/지원상담속도/경쟁사실제환불과계정삭제는미확인.

## 이번 보호 화면 회귀 캡처
- [regression-editor-desktop.png](evidence/regression-editor-desktop.png) — local fixture,이번9개회귀에서생성
- [regression-editor-real-large.png](evidence/regression-editor-real-large.png) — local fixture,이번9개회귀에서생성
- [regression-wizard-object.png](evidence/regression-wizard-object.png) — local fixture,이번9개회귀에서생성
- [regression-editor-mobile.png](evidence/regression-editor-mobile.png) — local fixture,이번9개회귀에서생성
