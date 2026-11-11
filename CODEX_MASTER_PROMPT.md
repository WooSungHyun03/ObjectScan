# ObjectScan — Codex Service Launch & Full Product Revision v5

너는 ObjectScan의 Principal Product Engineer, Product Designer, Full-Stack Engineer, ML Infra Engineer, QA/SRE Lead 역할을 수행하는 자율 개발 에이전트다. 이 문서는 **실제 코드 수정 및 검증을 지시하는 실행 프롬프트**다. 계획·문서·목업만 만들고 끝내지 마라. 현재 작업물과 외부 계정을 검사하고, 가능한 작업을 실행하고, 결과를 테스트하라. 사용자 인증·결제 실계정·도메인 전환처럼 승인 또는 권한이 필요한 단계에서만 요청한다.

## 0. 프로젝트와 범위

- 로컬: `/home/m4ml/Desktop/ObjectScan`
- 마스코트: `/home/m4ml/Desktop/ObjectScan/Mascot`
- 원격 저장소: `https://github.com/WooSungHyun03/ObjectScan.git`
- 사이트 디자인의 제품·정보 구조 레퍼런스: `https://www.meshy.ai/`
- 서비스 목표 도메인: **`https://be-celeb.org/`** (Cloudflare DNS 관리)
- 독립 배포: **Next.js + Supabase + Vercel** (기존 기술스택이 더 진전되어 있다면 무조건 갈아엎지 말고 차이를 분석), RTX 4080 16GB GPU 서버에 별도 Pull Worker. ChatGPT Sites 사용 금지.
- 최종 결과: 한국어 기반의 실사용 가능한 서비스. 회원가입, 이미지 업로드, 객체/장면 3D 복원, 편집, GLB 다운로드, 이미지 수별 가격 산정, Toss Payments **테스트 결제**, 사용자간 3D 에셋 마켓플레이스.
- 팀 제약: 3인·2주·바이브코딩·동시 사용자 최대 1~2명. 복잡한 마이크로서비스, Kubernetes, 불필요한 Redis 도입 금지.

## 1. 시작 시 실제 현황 감사 — 추정 금지

1. 전체 파일 및 Git 상태, 현재 브랜치, README, AGENTS.md, CODEX_MASTER_PROMPT.md, DESIGN_SPEC.md, Task/Risk 문서, 실행 중인 웹앱·GPU Worker·DB·스토리지·CI, 기 구축 기능을 실제로 확인한다. **GitHub 기본 브랜치에 프롬프트 문서밖에 없더라도 로컬에는 구현 코드가 있을 수 있으므로 로컬을 먼저 조사한다.** 기존 정상 기능 삭제/재구축 금지.
2. `https://www.meshy.ai/` 및 사용자 경험상 중요한 페이지를 브라우저로 직접 확인한다. 참고할 것은 **서비스 정보 구조, 제작 시작 CTA, 기능 진입, 결과 갤러리, 요금 표기, 에셋 탐색의 사용성**이다. 픽셀 단위 베끼기, 상표·이미지·코드 복제 금지.
3. `Mascot/` 모든 파일을 읽고 이미지 크기·Alpha·기본 포즈·고해상도 여부·사용에 적합한 용도를 기록한다. 캐릭터 고유 외형(빨간 모자, 파란 코트, 빨간 장화, 베이지 털)을 유지하되 모든 화면에 남발하지 않는다. 마스코트가 ObjectScan 간판/로고를 들도록 강요하지 않는다.
4. 이용 가능한 디자인 도구를 확인한다. Taste Skill, UI UX Pro Max, Vercel Web Design Guidelines, Figma/MCP, MagicPath, browser automation, 이미지/3D 에셋 생성 도구. **실제 설치·연동되지 않은 도구를 사용했다고 주장하지 말고**, 가능하면 설치·사용하되 불가능하면 동등한 검증 방식으로 대체하고 기록한다.
5. `docs/AS_IS_AUDIT.md`에 **작동/화면만 존재/미구현/실GPU 미검증/결제 테스트 상태**를 증거와 함께 기록한다. 이후 작업과 테스트는 실제 상태에 따라 계획을 조정한다.

## 2. 도메인 및 Cloudflare 배포 — 안전이 최우선

- 최종 서비스 도메인은 `be-celeb.org`, HTTPS 및 www 리다이렉트/캐노니컬 정책까지 설계하라.
- **중요: `www.be-celeb.org`는 기존 BE CELEB 서비스가 사용 중일 수 있다.** 먼저 `be-celeb.org`와 `www.be-celeb.org`의 현재 응답, DNS, Cloudflare zone, Vercel 프로젝트 연결, 리다이렉트, SSL, 이메일 관련 MX/TXT 레코드 등을 읽기 전용으로 조사하라.
- 다른 서비스의 데이터·리소스·DNS·Vercel 프로젝트·SSL 설정을 **명시적 승인 없이** 삭제하거나 변경하지 마라. 루트 도메인 전환이 기존 서비스를 중단한다면 **교체 승인 절차와 롤백 계획을 먼저 제시**하고, 승인 전에는 새 Vercel preview/staging 배포에서 ObjectScan을 완성하라.
- Vercel CLI/API에서 도메인을 프로젝트에 연결하고 `domains inspect`가 반환하는 실제 레코드에 따라 Cloudflare DNS를 구성한다. 루트 A 레코드·www CNAME을 추측으로 하드코딩하지 마라. Cloudflare 프록시 설정이 충돌을 일으키면 공식 가이드에 따라 검증하라.
- Supabase Auth redirect URL, 이메일 링크, Toss success/fail callback, sitemap, robots, canonical, CSP/CORS, 서명 URL, OAuth 설정을 최종 도메인과 일치시켜라.
- 도메인 변경 전후의 HTTPS, 로그인, 업로드, 결제 테스트, 다운로드를 Playwright와 curl로 실측하고 DNS rollback 절차를 작성한다. **권한/확인이 안 되면 기존 BE CELEB는 그대로 유지하고 preview URL을 검증 결과로 제출**한다.

## 3. 메인 사이트를 Meshy 수준의 진짜 상용 서비스 경험으로 전면 개편

### 3-1. 카피라이팅과 불필요한 문구

- 고객이 보는 모든 일반 페이지에서 다음 문구 및 유사한 설명조의 카피를 찾아 제거·대체한다:
  - `학교 교육·연구용 · 비상업 서비스 이용 범위와 모델 출처`
  - `학교 교육·연구용 서비스에서는 에셋 판매·구매를 운영하지 않습니다. 이 화면에는 승인된 미리보기만 표시됩니다.`
  - `공개 예시 모델 · 제작 결과 아님`
  - `사진 속 대상을, 입체적인 작업으로`
- 교육용 과제 설명, 내부 알고리즘, 모델명, 기술 용어가 마케팅 화면에 튀어나오지 않게 한다. 단, 실제로 필요한 약관·저작권·제3자 고지·결제 고지·개인정보·운영 정책은 해당 페이지/법적 고지 위치에 정확히 유지한다. **법적 의무 또는 보안 안내를 무조건 숨기라는 뜻이 아니다.**
- 허위 이용자 수, 별점, 수상, 성공률, 생성 속도, 판매 실적, 고객 후기, 허위 기능 활성화, 가짜 결제 완료 등을 만들지 마라. 예시 시각 자료를 실제 모델 생성 결과라고 속이지 말고, 마케팅용 이미지와 실제 사용자의 출력물을 데이터 레벨에서 구별한다. 고객에게는 불필요한 기술적 설명을 내세우지 않는다.
- 카피는 간결하고 실질적인 한국어: 예) `사진을 올리고, 3D로 완성하세요`, `3D 모델 만들기`, `객체만 만들기`, `공간 전체 만들기`, `내 작업`, `3D 모델 편집`, `에셋 마켓`, `요금 안내`. 이것은 예시일 뿐, 실제로 3~5개 카피 대안을 작성하고 UI에서 비교한 뒤 가장 세련된 것을 선택하라.

### 3-2. 화면/브랜드 방향

- Meshy의 '창작 시작하기 쉬움 → 다양한 제작 결과 발견 → 가격 이해 → 재방문' 경험을 분석·차용하되 브랜드 표현은 ObjectScan 고유의 **프리미엄 다크 테마, 절제된 민트/시안 포인트, 빨간 모자의 3D 곰 마스코트, 고품질 3D 예시 자산**으로 설계한다.
- 레이아웃은 **웹서비스/커머스**여야 한다. 복잡한 엔지니어용 GUI, 3D 모델링 소프트웨어 같은 메인 랜딩, 쓸모없는 그라디언트·네온·글래스모피즘 남발, 모든 콘텐츠의 카드화, 설명만 가득한 AI SaaS 템플릿을 금지한다.
- 헤더: ObjectScan / 만들기 / 에셋 마켓 / 요금 안내 / 내 작업 / 로그인·가입. 반응형 모바일 메뉴.
- 랜딩: 강력한 하나의 헤드라인, 바로 사용 가능한 CTA, 실제 UI에서 제작 모드 선택, 고품질 object/scene 예시 비주얼, 창작물 갤러리, 간결한 사용법, 요금 섹션, 마켓 유입, 마지막 CTA.
- `/create`: 객체·장면 모드 선택, 파일 드래그앤드롭, 업로드 상태, 품질 가이드, 객체 모드만 대상 선택+마스크 검토, 작업 확인, 요청/대기/실패/완료 단계 표시.
- `/projects`, `/projects/[id]`: 소유자 권한, 업로드 관리, 상태, 진행 로그, 실시간 3D 뷰어, 편집, 다운로드, 마켓 게시.
- `/editor/[assetId]`: **필요할 때만 나타나는** Mesh 편집 도구, Orbit, 이동·회전·크기, reset, wireframe, 부품 선택, undo/redo, 저장 버전, 다운로드. 기존 Three.js/React Three Fiber/Drei TransformControls/three-mesh-bvh/Trimesh/Blender/xatlas/gltf-transform 등의 오픈소스를 비교·재사용. 실제 구현한 기능만 노출, 텍스처·UV 보존을 필수 검증.
- `/marketplace`, `/marketplace/[id]`, `/sell`: 실제 사용자 게시·탐색·카테고리·검색·필터·정렬·3D 미리보기·가격·구매 플로우·구매 후 권한 있는 다운로드·판매자 대시보드. 빈 마켓도 자연스럽게 표현하고 가짜 거래/판매자를 만들지 마라.
- `/pricing`, `/checkout`, `/billing`: 실제 UI로 플랜과 생성 차감/잔여 크레딧, 주문 내역, 가격 정책을 보여준다.
- `/login`, `/signup`, `/account`, `/support`, `/terms`, `/privacy`: 브랜드 일관성과 실용적인 안내.
- 360px, 768px, 1440px 모두에서 스크린샷 확인. 키보드, 모바일, 색 대비, 로딩/빈 결과/오류/장시간 작업 중 상태 점검.

### 3-3. 디자인용 3D 에셋 적극 제작

- 기존 `Mascot`을 출발점으로 투명 배경/고해상도 이미지를 선별·최적화하여 hero, 카드, 안내, 빈 상태에 활용하라. 마스코트의 고유성 유지.
- 프로젝트에 연동된 이미지 생성·3D 자산 생성 툴/서비스/스킬이 실제 존재한다면 **디자인 목적의 3D 에셋**(가구, 운동화, 생활용품, 인형, 공간 인테리어 등)을 여러 개 만들어 랜딩·갤러리·마켓플레이스에 활용한다. 복제 금지, 출처/생성 여부 내부 기록, 썸네일·포스터·GLB 미리보기는 가능한 범위에서 준비.
- 디자인용 3D asset과 실제 사용자 업로드→GPU 생성 결과를 **절대 혼동하지 말 것**. 모델 출력 예시라고 보여주려면 검증된 실제 모델 산출물을 사용한다.
- 3D WebGL은 선택적·지연 로드, 썸네일·비디오 fallback, 모바일 최적화 및 이미지 크기 관리. 결과물 미리보기에서는 진짜 GLB.

## 4. 3D 제작 기능을 실제로 활성화하라 — UI 버튼만 ON 하지 말 것

**실제 동작하는 생성 파이프라인을 최상위 P0 우선순위로 배치**한다. 현재 '생성 불가' 화면·disabled 버튼·모의작업만 있을 경우 원인부터 조사한다.

- 객체 1장: Pixal3D single-view.
- 객체 2–20장 업로드: Pixal3D multi-view, 반드시 카메라 포즈 확인 및 실제 16GB에서 검증한 시점 수만 사용. 업로드 수와 실제 추론에 사용한 수가 다르면 작업 상세에 정확하게 표시.
- 객체 21장 이상: Object-Aware Loss + SAM2 마스크 + COLMAP → 2DGS/TSDF → UV texture bake → GLB validation.
- 장면 전체: Gaussian Wrapping + COLMAP → surface/texture refinement → UV atlas bake & GLB 검증. 장면 모드에서는 배경 제거하지 않는다.
- 입력은 복잡한 배경을 포함한 원본 RGB이며, **객체 모드에서만** SAM2 클릭/박스 대상 선택, 일괄 mask 생성·검토·수정. 원본 이미지/마스크/포즈·intrinsics 일치 확인.
- GPU 서버: Ubuntu RTX 4080 16GB. 모델별 독립 conda/venv와 고정 upstream revision, max concurrent GPU job=1, DB atomic claim/lease, heartbeat, 재시도, 취소, GPU OOM 제어, timeouts, stdout/stderr, 이벤트 기록.
- Vercel 서버리스 함수에서 수분~수십분 GPU 학습을 직접 기다리지 마라. Supabase DB 상태/Private Storage, Python pull worker, 인증된 HTTPS API, 실시간 단계 진행으로 설계한다.
- 실제 1장 샘플과 다중시점 샘플로 end-to-end smoke: 업로드→대상 선택→실GPU 모델 실행→mesh+UV+texture 산출→GLB parse→실제 3D viewer→다운로드→프로젝트 재열기.
- 기능별 실제 GPU 통과 전에는 허위 성공상태/유료 생성 활성화를 하지 말 것. 개발용 모의모드는 개발환경에서만, 일반 서비스 UI에서 테스트 결과를 '실제 성공'으로 속이지 않는다. 실패하면 원인·로그·수정 계획을 명확히 보고한다.

## 5. 요금제/구매 경험 — Toss Payments TEST 결제

- `무료 체험`, `스타터`, `크리에이터`, `프로`처럼 이해하기 쉬운 플랜 카피를 제안하되 **기존 BM의 생성 건당 이미지 수 기반 과금**을 유지한다. 플랜은 선결제 크레딧 패키지/혜택으로 설계 가능하며, 플랜별 혜택과 '작업마다 차감되는 크레딧'의 관계를 명확히 표시한다. 중복 과금 금지.
- 기본 구간: 객체 1–20장, 21–40장, 41–60장, 61–80장 등 20장 증가 구간. 장면 전체는 별도의 요금 규칙. 가격·수수료·크레딧 전환율은 **DB/관리자 설정과 테스트 픽스처**로 구성해 하드코딩 최소화. 가격이 확정되지 않았다면 UI에 거짓으로 '공식 가격'을 공표하지 말고 관리자 설정을 통해 확정하도록 한다.
- Toss Payments SDK v2의 테스트 클라이언트 키+테스트 시크릿을 이용한다. 클라이언트 위젯 → 서버가 보관한 orderId/amount 확인 → 서버 승인(confirm) → idempotent ledger → 크레딧 지급/구매 권한. success URL만으로 결제 성공 처리하지 마라.
- 테스트 키는 실제 돈을 청구하지 않으므로 **테스트 결제를 실제 카드 청구라고 주장하지 말 것**. 마케팅 UI는 정식 서비스 수준으로 만들되, 결제 화면/영수증과 사용자의 금전적 판단에 영향을 주는 곳에서는 테스트 환경임을 분명히 한다.
- 정상/실패/취소/중복 승인/금액 변조/재시도/잔액 부족/환불/중복 webhook 테스트. 비용 확정·크레딧 차감은 atomic transaction으로, 실패 시 환불/회복 정책 포함.
- PG 사업자 실계약, 운영 키, 정산 연동이 없는 경우 운영 결제를 조용히 활성화하지 않는다.

## 6. 사용자 간 3D Asset 마켓플레이스

- 자신이 생성하거나 업로드한 모델을 판매자가 에셋으로 게시, 가격·대표 이미지·설명·카테고리·태그·라이선스 선택, GLB 검증, 공개 승인/신고/내리기, 비공개 기본값.
- 구매자는 3D 미리보기, 가격/포함 파일 확인, 테스트 결제, 다운로드 권한 부여 및 구매 내역 확인. 미구매자의 원본 GLB 다운로드·서명 URL 추측 접근 금지.
- 플랫폼 수수료율은 설정값으로 관리. 거래 원장에 판매 금액·수수료·판매자 정산 예정 잔액 반영. **테스트 결제는 테스트 정산/가상 원장으로만 처리**하고 실제 송금/매출을 발생시킨 것으로 표시하지 말 것.
- 기존 모델이 생성한 에셋의 파일 및 구매한 라이선스/재판매 권한을 분명히 관리하고, 법적으로 필수 고지는 약관 등에 유지한다. 학교 연구용/비상업용 안내문을 일반 서비스의 주된 메인 문구로 강제하지 않는다.
- 구매/판매자 두 계정의 통합테스트: 자신의 에셋 게시, 다른 사용자 구매, 권한 발급, 수수료 계산, 판매자 원장, 무권한 다운로드 차단.

## 7. 모듈화·보안·유지보수

- 분리: `apps/web`, `packages/ui`, `packages/shared`, `packages/contracts`, `gpu-worker/adapters`, `gpu-worker/pipeline`, `supabase/migrations`, `scripts`, `docs` (기존 구조가 있다면 점진적 변환). 단일 프레임워크에서 기능별 모듈을 유지하며 과도한 분산은 피하라.
- View/Controller/Domain/Repository 분리, 모델명·모델 API는 서버쪽 `ReconstructionAdapter`에 격리. 고객 UI에는 내부 백본 이름을 노출하지 않는다. 공개 API 오류에도 경로/시크릿/모델 내부 stack trace 숨김.
- Supabase Auth, RLS, private storage, signed URL, 파일 제한, rate limiting, 업로드 악용 차단, 사용자 접근권한, IDOR, 테스트/운영 키 분리, server-only payment secret, 보존/삭제 정책.
- 3D viewer/editor는 미리보기만 바꾸는 fake edit을 금지. 저장 후 reload/GLB geometry/material/UV 유지 검증.
- 도메인·DB·GPU Worker·결제 모두 `.env.example`, README, ADR/Runbook/rollback, 비용 및 장애 대응 문서. 사용자 로그·파일·모델 weight·자격증명은 Git에 포함하지 않는다.

## 8. Harness / Loop Engineering — 실행 순서 및 완료 기준

### Stage A: 감사 + 합격 기준 명문화

- `docs/AS_IS_AUDIT.md`, `docs/PRODUCT_REQUIREMENTS.md`, `docs/DESIGN_AUDIT.md`, `docs/DOMAIN_MIGRATION.md`, `docs/EXECUTION_PLAN.md`, `docs/RISK_REGISTER.md` 작성.
- P0: 기존 서비스 훼손 금지, 계정/결제 안전, GPU 실제 생성, 업로드/다운로드; P1: 가격/마켓/편집; P2: 부가 애니메이션/화려한 장식.
- 각 기능은 명확한 Given-When-Then Acceptance Criteria와 증거(스크린샷/로그/API응답)를 정의.

### Stage B: 디자인 구현 Loop

`레퍼런스 분석 → 브랜드 디자인 토큰 → 2~3가지 시안 → 실제 React 구현 → Playwright 1440/768/390 스크린샷 → UX·접근성 감사 → 수정 → 재검증`.

- 시안이 실제 앱 화면으로 구현될 때까지 반복. 디자인 협업 도구와 스킬을 사용 가능할 때 실제 호출; 불가능하면 정확히 원인을 기록.
- 스크린샷에 폴더·기기 폭·날짜·변경 이력 기재, 결과 링크 보존.

### Stage C: 모델/결제/마켓 기능 Loop

`작업 티켓 작성 → 가장 작은 수직 기능 구현 → 유닛/통합 테스트 → 실제 실행 → 에러 재현·원인 분석 → 수정 → 회귀 테스트 → 리뷰 가능한 커밋/PR`.

- 문제를 무시하고 다음 기능으로 이동하지 마라. 권한이 없는 외부 환경 또는 불가피한 GPU OOM은 BLOCKED+증거를 남기고 다른 독립 업무를 진행.

### Stage D: 릴리스 Gate

- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, `pytest` 수행(실제 프로젝트에 맞춘 scripts). GitHub Actions.
- 데스크톱/모바일 CTA 클릭, 회원가입, 권한, 직접 업로드, 결제 테스트, 작업 상태, GPU 생성, GLB 진짜 로딩, 편집/저장, 마켓 거래, 보안 오류·회복, 도메인 SSL/redirect, DNS rollback을 E2E로 검증.
- `reports/RELEASE_EVIDENCE.md`: 기능별 `PASS / FAIL / BLOCKED`, 실제 모델 실행 시간/VRAM peak, 결제 테스트 결과, DB 데이터 무결성, 관련 로그/스크린샷·PR/커밋 링크.
- 모델 검증 실패이면 관련 고객 결제/제작 기능은 활성화하지 않으며, 무엇이 막혔는지 투명하게 남긴다.

## 9. 즉시 실행 — 문서만 만들고 중지 금지

1. 로컬 ObjectScan의 실제 코드/실행상태 확인.
2. 기존 BE CELEB 도메인 점유 확인 및 비파괴 배포 계획 수립.
3. UI에서 비즈니스가 아닌 학술 설명/억지 모델 출처 문구 제거·전면 카피 개선.
4. 실제 회원가입→업로드→GPU 작업 시작→GLB 완성 경로를 P0로 복구/구현. mock 우회 금지.
5. Meshy 참고 디자인 전면 개편 및 마스코트·3D 디자인 에셋 제작.
6. Toss 테스트 요금/결제와 사용자간 거래를 구현.
7. 자동 테스트와 브라우저 검사, 통합 리뷰, 배포 preview까지 수행.
8. 도메인 변경·외부 계정에 명시적 조치가 필요하면 딱 필요한 승인/로그인만 요청. 승인 전까지 다른 독립 작업을 계속한다.

**완료 보고 포맷:** `완료 기능 / 실제 테스트 증거 / 미검증 또는 차단 / Vercel URL / DNS 전환 필요 여부 / PR·커밋 / 다음 우선순위`.

참고 공식 문서:
- Meshy: https://www.meshy.ai/
- Vercel custom domain: https://vercel.com/docs/domains/set-up-custom-domain
- Toss Payments SDK v2: https://docs.tosspayments.com/guides/v2/payment-widget/integration

지금부터 직접 조사·코드 수정·테스트·검증을 시작하라. **진짜 서비스처럼 보여야 하지만, 실제로 동작하지 않는 기능·결제·에셋을 진짜처럼 속여서는 안 된다.**
