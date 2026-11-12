# 검증·자료·미확인
확인2026-11-12 KST. GitHubbefore본문은삭제하지않고기존원문은v1tickets에보존한다. 계정비밀·provider키·JWT·signedURL·브라우저authstate는공개증거에서제외한다.

## 이번 새 검증
- Node60passed/1optionalskipped(9filespass/1skip),TypeScriptweb/editor/shared통과. 
- Worker26passed19.48s,실GPU아닌workerunit회귀. 
- Chromium기존9passed46.8s,로컬Mailpit/privateAPI/편집실제파일처리/원본불변버전·권한/39MBfixture/반응형axe. 
- 전용connections1passed3.8s:실제로컬인증,판매/검색/신고/주문/PG응답/다운로드/삭제는명시적mock API. 실제원장/카드사인증·서버권한증거와다름. 
- lint0errors8warnings(기존img등),새build는실행중인compiled3010의.next를덮지않도록수행하지않음. 과거CI기록을이번build통과로표시하지않음. 
- Ownerpreflight:env이름존재boolean만·21migration파일·GPU재고·Workerinactive·local56321/3010health200·공개200·Preview302. 

## 재현 명령
Owner전용: `node docs/product-audit-v2/owner-local-preflight.mjs` / `node --check docs/product-audit-v2/owner-local-preflight.mjs`. 
Owner-onlydisposablelocal: `npm test`;`npm run typecheck`;`npm run lint`;`gpu-worker/.venv/bin/python -m pytest gpu-worker/tests`. 
기존browser: `TEST_EDUCATION_MODE=false OBJECTSCAN_EDITOR_LARGE_GLB=/home/m4ml/Desktop/ObjectScan/ObjectScan-v2/artifacts/pixal-smoke/mesh.glb npx playwright test --config artifacts/launch-v5/playwright.release.config.ts`. 
추가연결: `npx playwright test --config docs/product-audit-v2/owner-local-playwright.config.ts`. 기존앱3010/APP_URL일치·localtestenv가필요하며Team실행요구가아니다. 

## 공개 브라우저·근거
- [fixture-assets-1440.png](evidence/fixture-assets-1440.png) — mock fixture UI
- [fixture-assets-360.png](evidence/fixture-assets-360.png) — mock fixture UI
- [fixture-assets-768.png](evidence/fixture-assets-768.png) — mock fixture UI
- [kiri-1440.png](evidence/kiri-1440.png) — 공개 직접 화면
- [kiri-360.png](evidence/kiri-360.png) — 공개 직접 화면
- [kiri-768.png](evidence/kiri-768.png) — 공개 직접 화면
- [local-create-1440.png](evidence/local-create-1440.png) — 공개 직접 화면
- [local-create-360.png](evidence/local-create-360.png) — 공개 직접 화면
- [local-create-768.png](evidence/local-create-768.png) — 공개 직접 화면
- [local-demo-1440.png](evidence/local-demo-1440.png) — 공개 직접 화면
- [local-demo-360.png](evidence/local-demo-360.png) — 공개 직접 화면
- [local-demo-768.png](evidence/local-demo-768.png) — 공개 직접 화면
- [local-home-1440.png](evidence/local-home-1440.png) — 공개 직접 화면
- [local-home-360.png](evidence/local-home-360.png) — 공개 직접 화면
- [local-home-768.png](evidence/local-home-768.png) — 공개 직접 화면
- [meshy-1440.png](evidence/meshy-1440.png) — 공개 직접 화면
- [meshy-360.png](evidence/meshy-360.png) — 공개 직접 화면
- [meshy-768.png](evidence/meshy-768.png) — 공개 직접 화면
- [meshy-workspace-1440.png](evidence/meshy-workspace-1440.png) — 공개 직접 화면
- [meshy-workspace-360.png](evidence/meshy-workspace-360.png) — 공개 직접 화면
- [meshy-workspace-768.png](evidence/meshy-workspace-768.png) — 공개 직접 화면
- [polycam-1440.png](evidence/polycam-1440.png) — 공개 직접 화면
- [polycam-360.png](evidence/polycam-360.png) — 공개 직접 화면
- [polycam-768.png](evidence/polycam-768.png) — 공개 직접 화면
- [tripo-1440.png](evidence/tripo-1440.png) — 공개 직접 화면
- [tripo-360.png](evidence/tripo-360.png) — 공개 직접 화면
- [tripo-768.png](evidence/tripo-768.png) — 공개 직접 화면

[이번경쟁사HTTP/언어관찰](evidence/competitor-browser.json) · [Owner환경진단](evidence/owner-local-preflight.json). 공식URL/플랜/검증구분은02문서참고. CLI실행스크립트는bash로호출(파일실행permission없어직접실행실패후수정),브라우저테스트는실행된결과만pass표시. 

## 기존 실제 증거 (이번 새실행 아님)
[release evidence](../../reports/RELEASE_EVIDENCE.md),[SV](../validation/pixal-single-fp16.json),[SAM2](../validation/hosted-sam2.json),[MV제약](../validation/pixal-mv-oom.json),[OAL제약](../validation/oal-object21.json),[GW제약](../validation/gw-scene32.json). 모델연구재개근거가아니다. 

## 열린 질문/블로커
현재Worker정지이유·현재대기작업은서비스재기동전Owner가확인해야한다. 외부SMTP새메일/PG자동callback·webhook/실GPU새추론/새schema snapshot/실제도메인전환은미검증. 도메인사용여부는질문아님(교체결정완료). Team이름/GitHub계정은제공되지않아dev-A/dev-B라벨로담당표시하고임의계정배정하지않는다. 

## 이번 로컬 회귀 추가 화면
- [local-upload.png](evidence/local-upload.png) — disposablelocal,기존editor/privatefixture
- [local-editor-mobile.png](evidence/local-editor-mobile.png) — disposablelocal,기존editor/privatefixture
- [local-editor-39MB.png](evidence/local-editor-39MB.png) — disposablelocal,기존editor/privatefixture
- [local-editor-1440.png](evidence/local-editor-1440.png) — disposablelocal,기존editor/privatefixture
[공개DNS스냅샷](evidence/public-dns-inventory.json) — 계정인증없이읽기전용,전체zone백업아님. [sharp기능확인](evidence/sharp-capability.json) — 기존stats.sharpness/entropy의CPUfixture검사이며새알고리즘개발이나모델연구아님.

추가Team-key-free선택suite:domain/customer-copy/editor3파일 **32pass**. 전체60개에포함되는부분집합이므로합산하지않는다. key-freeUIharness는OS-12에서구현할산출물이며현재완성돼있다고보고하지않는다.

## 계획·GitHub 최종 검사
[문서/공수/DAG 검사](evidence/plan-validation.txt) · [실제GitHub상태검증](evidence/github-verification.json). 기존23개개정/분리/폐기매핑,신규8개만생성,Team17개모두milestone1·dev담당라벨,Owner10개는dev라벨/Team마일스톤없음,폐기4개와#2는not_planned를REST로재확인했다.
