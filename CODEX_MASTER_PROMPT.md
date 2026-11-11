# ObjectScan — Premium Korean 3D SaaS Redesign
## CODEX MASTER PROMPT v4 · Meshy-Inspired, Mascot-Led, Skill-Driven Design Harness

너는 ObjectScan의 **Principal Product Designer + Design Engineer + Staff Frontend Engineer + UX Researcher + QA Lead**다. 단순한 UI 리스킨이 아니라, 현재 프로젝트를 조사하고 브랜드·정보구조·사용자 여정·디자인 시스템·실제 동작하는 화면을 **서비스 수준으로 전면 개편**한다. 보고서/기획에서 끝내지 말고 구현·실브라우저 검사·반복 수정까지 완료한다.

## A. 프로젝트와 절대 제약

- 소스 저장소: `https://github.com/WooSungHyun03/ObjectScan.git`
- 작업 위치: 로컬의 실제 ObjectScan Git 루트. 먼저 `pwd`, `git status`, 트리, 기존 소스와 문서를 검사할 것.
- 마스코트 원본: `/home/m4ml/Desktop/ObjectScan/Mascot` (로컬 원본 이미지 파일; 직접 목록·해상도·알파·외관을 확인할 것).
- 디자인 벤치마크: `https://www.meshy.ai/` (**제품 소개, 탐색, CTA, 에셋 갤러리, 시작하기/제작 흐름 구조만 참고**). Meshy의 디자인·카피·이미지·로고·구성을 픽셀 단위로 복제하지 말 것.
- 최종 웹사이트는 **한국어를 1차 언어**로 하는 독립 배포 웹서비스. ChatGPT Sites 금지. 기존 Next.js/TypeScript + Supabase + Vercel + 별도 GPU 서버 구성을 유지하되, 로컬 저장소에서 실제 사용 중인 스택이 다르면 먼저 확인 후 변경 이유를 ADR에 기록하라.
- 단일 GPU RTX 4080 16GB, 동시 사용자 약 1~2명, 3인 개발팀, 2주 MVP. 기능/범위를 현실적으로 분리한다.
- 사용자가 보는 UI에서 **Pixal3D, SAM2, Object-Aware Loss, Gaussian Wrapping 등 구현 모델명과 내부 기술용어를 노출하지 않는다.** 대신 `사진으로 3D 만들기`, `객체만 3D로 만들기`, `공간 전체를 3D로 만들기`, `원하는 대상 선택` 같은 소비자 언어를 사용한다. 내부 adapter·logs·기술 문서에는 정확한 원래 모델명을 보존한다.
- 현재 repository의 `AGENTS.md`, `CODEX_MASTER_PROMPT.md`, `design/DESIGN_SPEC.md`, `docs/*`를 먼저 읽는다. 기존 요구사항(회원가입, 업로드, 마스크 선택, 3D 뷰어/편집, 과금, 마켓, GPU 파이프라인)은 삭제하지 않는다. 과거 디자인 시안은 **참고 수준으로 격하**하고 본 명세로 최신화한다.
- GUI를 흉내 내는 복잡한 웹앱으로 랜딩 페이지를 만들지 않는다. 랜딩·가격·마켓은 실제 상용 웹서비스처럼 명확하고 간결하게; 3D Editor에서만 필요한 편집 UI를 노출한다.
- 임의의 실적·고객 후기·실행 시간·품질 보장·사용자 수·가격을 지어내지 않는다. 미구현 기능에 가짜 성공 UI를 붙이지 않는다.
- 저작권/라이선스 확인을 개발 중단 사유로 삼지 말되, 3rd-party 의존성과 출처를 `docs/DEPENDENCIES.md`에 기록하라. 실제 배포 정책과 이용 권한 판단은 별도 검토 대상으로 남겨라.

## B. 필수 전문 디자인 도구 — 설치 → 실제 호출 → 산출물 검증

도구 이름만 언급하거나 설치만 했다고 사용 완료로 표시하지 마라. 도구별 **실제로 선택한 제안/스크린샷/디자인 파일/검사 로그**를 남긴다. 사용 가능한 도구를 먼저 검색하고, 기존 설치가 있다면 재설치하지 않는다. 명령이 바뀌었다면 공식 문서/CLI help로 최신 설치법을 확인한다. 외부 플러그인은 로그인·권한 동의가 필요할 경우 요청하고, 연결이 안 되어도 코드 구현은 멈추지 않는다. 연결되지 않았는데 Figma/MagicPath 작업을 했다고 주장하지 마라.

### 1. Taste Skill — 시각적 미감과 anti-generic 디자인

공식: `https://github.com/Leonxlnx/taste-skill` · `https://www.tasteskill.dev/docs`

```bash
npx skills add Leonxlnx/taste-skill
```

- Codex가 `design-taste-frontend` SKILL.md를 읽고 **실제 스크립트/아트디렉션과 브라우저 검수**를 실행하도록 한다.
- 제안되는 방향 3개 이상을 비교해 하나를 선택하고 선택 근거를 작성한다.
- 다만 자동 추천이 브랜드 원칙과 충돌하면 본 프로젝트의 브랜드 명세를 우선한다.
- **금지:** 무의미한 gradient blobs, purple-blue AI SaaS, 3개짜리 뻔한 feature cards 반복, 데모 같은 헤더, emoji 아이콘, fake glass panels, 광과잉 neon, 서체/spacing 무작위 혼용.

### 2. UI UX Pro Max — 설계 기준 및 디자인 시스템

공식: `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`

```bash
npx skills add nextlevelbuilder/ui-ux-pro-max-skill
```

또는 공식 `uipro` CLI를 사용할 수 있다면 설치 상태와 `uipro --help` / `uipro init --help` 확인 후 Codex에 맞게 설정한다. 반드시 SKILL.md의 실제 usage를 우선한다.

- 검색 키워드: `Korean consumer creative SaaS dark premium 3D asset marketplace`, `image upload wizard`, `3D editor product`, `pricing transaction ecommerce`, `accessible dashboard`.
- **최종 결과물**: `design-system/objectscan/MASTER.md`, 페이지별 override, palette tokens, type scale, spacing scale, radius, border/shadow, focus/hover/error states, motion rules.
- 메인 페이지와 편집기 같은 화면에 똑같은 밀도/레이아웃을 강요하지 않는다.
- 한국어 폰트(예: Pretendard 계열)의 실제 렌더링·자간·줄바꿈 및 라틴 숫자 혼합을 검증한다.

### 3. Vercel Web Interface Guidelines — 최종 QA

공식: `https://vercel.com/design/guidelines`

```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
```

- 스킬에 따라 실제 UI 코드를 검사하고 결과를 기록한다. focus states, semantic controls, contrast, form error, loading/cancel, mobile reflow, dialogs, keyboard navigation, animation preferences, text truncation 등.
- style lint만으로 통과한 것으로 간주하지 말 것. Playwright/브라우저 스크린샷과 함께 평가하라.

### 4. Figma — editable design source of truth

Figma Codex plugin/MCP를 연결된 환경에서 먼저 확인한다. CLI 환경이라면 공식 안내를 확인하여 다음을 사용 가능:

```bash
codex mcp add figma --url https://mcp.figma.com/mcp
```

- 계정 연결/쓰기 권한이 확인된 경우: Figma에 **모바일/데스크톱 랜딩, 제작 Wizard, 프로젝트 상세, 편집기, 마켓** 주요 화면을 수정 가능한 frame·auto layout·component·variable로 구성한다.
- master design tokens와 코드 CSS tokens를 매핑한다. Figma 링크, 각 프레임 스크린샷, 컴포넌트/변수 명세를 문서화한다.
- Figma 쓰기 접근이 차단되면 확인된 이유를 기록하고 로컬 스토리북/데모 페이지와 스크린샷을 대체 산출물로 사용한다. Figma 작업을 수행한 것처럼 말하지 말 것.

### 5. MagicPath — 여러 방향의 실제 프로토타입

MagicPath ChatGPT plugin 또는 Codex 연결이 확인되면 공식 가이드 (`https://www.magicpath.ai/documentation`) 따라 연결하고 사용한다. 계정 연결이 없다면 명시하고 직접 구현 가능한 로컬 프로토타입을 우선한다.

- 최소 두 방향: A `Meshy-inspired premium creator` / B `ObjectScan editorial mascot service`.
- 두 방향에서 모바일/데스크톱의 hero·업로드·프로젝트 카드·마켓 카드를 비교하고, 실제 사용성 우수한 안을 선택한다.
- 클릭 가능한 흐름(제작 시작 → 사진 업로드 → 대상 선택 → 작업 완료 → 편집/다운로드)을 시연한다.
- 가능하다면 MagicPath의 Figma export를 사용해 편집 가능한 레이어로 변환하고, Codex 코드와 동기화한다. 실제 MagicPath 프로젝트/공유 링크 또는 export 기록을 남긴다.
- 도구별 중복 모델 생성을 피하고 Figma를 최종 design source of truth로 삼는다.

**필수 툴 사용 증빙:** `docs/design/TOOL_USAGE.md`에 name/version, 실제 실행 명령 또는 UI 동작, 결과 파일/링크, 제안 채택 여부, 장애/미연결 사유를 남긴다.

## C. Meshy 참고는 IA(정보구조) 중심, 시각 언어는 ObjectScan 고유

Meshy의 강점은 **사용자에게 무엇을 할 수 있는지 빠르게 보여주고, 로그인/제작으로 자연스럽게 이동시키는 것**이다. 다음 순서로 분석한다.

1. Meshy의 실제 공개 랜딩 페이지를 브라우저로 탐색. 메뉴·Hero·creation CTA·결과 preview·gallery·pricing·community 흐름을 캡처/요약. 사이트 변동 시 현재 보이는 것만 기록.
2. ObjectScan과 비교해 `참고할 IA`, `버릴 UI 패턴`, `차별화할 화면`을 매트릭스로 작성 (`docs/design/REFERENCE_AUDIT.md`).
3. 사용자 여정은 `사진 업로드 → 대상/공간 선택 → 필요시 객체 마스크 검토 → 제작/작업 대기 → 3D 모델 확인 → 간단 편집 → 다운로드/게시`로 간결화.
4. 외관은 **dark, premium, minimal, product-first**: dark midnight/graphite backgrounds, readable off-white type, restrained teal accent, mascot red only as editorial accent, spacious hierarchy. glow neon가 주인공이 되면 실패.
5. **캐릭터가 제품의 신뢰성과 기능을 방해해서는 안 된다**. 실제 3D 결과가 주인공, 마스코트는 안내자.
6. 독립적인 logo/wordmark. Meshy의 글꼴/시각 아이덴티티/실제 이미지의 복제 금지.

초기 토큰 후보 (스킬 검색/브라우저 시안 결과에 따라 조정, 이유 기록):

```css
--color-canvas: #0B1018;
--color-surface: #182231;
--color-elevated: #222D3D;
--color-text: #F4F6F8;
--color-muted: #A1ADBB;
--color-border: #344152;
--color-accent: #55D9C0;
--color-accent-hover: #71E8D2;
--color-mascot: #E6534E;
```

WCAG/APCA 대비 및 텍스트 가독성 검사 후 확정. 배경/카드/테두리 색상 톤을 혼용하지 말 것. 컬러는 semantic tokens로 구성하고 하드코딩 금지.

## D. 마스코트 — 실제 로컬 폴더를 기준으로 에셋 파이프라인

`/home/m4ml/Desktop/ObjectScan/Mascot`의 파일들을 실제로 열어 검사하고, 아래 manifest를 만든다:

- `src filename / pixel dimensions / format / alpha actual yes-no / visible pose / background suitability / recommended placement / compression variant / alt text`
- **같은 개체 일관성**: 밝은 베이지 털, 빨간 모자, 파란 더플코트, 빨간 장화, 인형 질감. 스타일이 안 맞는 파일은 제외.
- 사용자 지정: 마스코트는 `ObjectScan`이라는 간판/로고를 들고 있지 않게 한다. 기존 에셋에 로고가 그려져 있다면 그 버전은 사용하지 않고, UI 텍스트/로고를 별도 컴포넌트로 배치한다.
- PNG가 실제 transparent alpha인지 검증한다. 이미지가 checkerboard 그림일 뿐이면 투명 PNG라고 부르지 말고 실제 background 제거/아트워크 수정이 필요하다고 기록한다.
- WebP/AVIF 최적화와 responsive sizes/lazy loading 수행. 원본 복사본은 보관, 사용본은 `apps/web/public/mascot/` 등으로 관리.
- 디자인 구획: Hero에는 캐릭터와 실제 3D 모델 preview를 조합하되 시선이 제작 CTA로 흐르도록. 빈 프로젝트 상태, 업로드 안내, 진행 중, 실패 복구, 완료/축하, 마켓 안내에서 각 1개씩 적절히 활용. 모든 화면에 반복 사용 금지.
- 웹 이미지의 실제 의미를 alt로 제공하고, 장식 용도는 alt="" 사용.

## E. 화면 및 UX — 반드시 실제 동작

**공통:** 한국어 자연스러운 카피, 키보드 접근, responsive. 사용자에게 제품 기능을 설명하고 첫 성공 경험까지 최단 경로 제공.

1. `/` Landing: 간결한 내비(`3D 제작`,`이용 방법`,`3D 에셋 마켓`,`요금`), 헤드라인 `사진만 있으면, 3D 모델이 됩니다.` 같은 구체적인 한국어 카피, 마스코트와 실제 사진 → textured mesh 예시, 1차 CTA `3D 모델 만들기`, 2차 CTA `작동 방식 보기`. 한 화면에 모든 정보를 넣지 않고 여백·리듬. 객체/공간 제작의 선택은 명확.
2. `/create`: 바로 체험할 수 있는 업로드. `객체만 만들기` / `공간 전체 만들기` 선택. 사진 장수, 형식, 생성 조건 및 어떤 방식으로 찍으면 좋은지 가이드를 제공. **내부 모델명은 UI에 없다.**
3. `/create/...`: 업로드 완료 → 객체 선택(객체 모드에서만, 클릭·박스·마스크 편집) → 이미지 검토(제외/추가) → 확인 → 제작 요청. Scene 모드는 마스크 단계 없음. 정확히 필요한 정보만 단계별 노출.
4. `/projects`, `/projects/[id]`: 진행 상황, 예외/오류 해결, 최종 mesh viewport와 texture, 원본/재시도/기록, 3D 편집 CTA. 실제 상태값과 일치.
5. `/editor/[assetId]`: **간단한 3D 편집만**, import mesh, orbit/zoom, object transform (move/rotate/scale), reset, wireframe, show/hide components, simple remove, mesh decimation where safe, undo/redo, save-as-new-version, GLB export. 선택/확인/기본 조작 우선. 2주 안에 자체 Blender를 만들지 않는다. 기존 `@react-three/fiber`, `@react-three/drei`, Three.js `TransformControls`, `@gltf-transform/*`, `three-mesh-bvh`, `trimesh`, Blender headless를 **기능별 적합성을 검증해서** 사용할 것. 자르기/복잡한 topology/texture rebake는 테스트 완료 전 experimental/off로 유지.
6. `/marketplace`, `/marketplace/[id]`: 고품질 3D 에셋 카드, 필터·정렬, 가격·미리보기·구매/등록, 사용자의 소유권·다운로드 권한. 초반 홈에 홍보하되 핵심 제작 흐름을 방해하지 않는다.
7. `/pricing`, `/auth`, `/settings`: 장수별 제작 가격·마켓 수수료·진행중 결제 등 조건을 정직하게 표시; 로그인·가입·복구·에러도 일관된 브랜드. 가격 미설정이면 가격을 지어내지 않음.
8. 모든 화면에 `empty / loading / error / offline / success / disabled / long text / mobile keyboard / no-data` 상태를 구현.

### 고객 카피 기준

- GOOD: `사진을 올려주세요`, `복원할 물체를 선택해 주세요`, `사진 8장 중 6장을 사용할게요`, `3D 모델이 준비됐어요`, `사진을 추가하면 결과가 좋아질 수 있어요`.
- BAD: `Inference Started`, `SAM2 Detection`, `Pixal3D MV`, `Gaussian Wrapping`, `LLM-powered`, `Reconstruction Adapter`, `One-step diffusion`, `초고속 세계 최고`, `혁신적인 AI 경험을 시작하세요`.
- 내부 모델명은 **서버 로그·운영 대시보드·디버깅 문서·어댑터 코드**에서만 사용 가능. 고객-facing JSON 응답의 상세 오류도 내부 경로/모델명을 드러내지 않도록 정제.

## F. 소프트웨어공학 관점 — 도메인 분리, 유지보수, 기능 회귀 방지

- 기존 기술스택과 모듈 경계를 존중하고 프런트엔드는 `features/auth`, `features/create`, `features/projects`, `features/editor`, `features/marketplace`, `features/billing`, `components/ui`, `components/brand`, `lib/design-tokens`, `lib/api` 등 도메인 중심 구조로 정리.
- 서비스 비즈니스 로직을 페이지 컴포넌트에 집어넣지 않는다. UI/도메인/네트워크/모델 어댑터 분리. 타입 계약 단일 출처, Zod validation, server-side price & permission checks.
- 단일 글로벌 GPU 슬롯, 큐/재시도/OOM/취소/실패 상태를 디자인과 실제 API가 일치하도록 통합한다. 실GPU 인증되지 않은 모델은 이용자가 결제/작업 요청할 수 없도록 비활성/실험 안내.
- Hero/카드에서 실제 생성에 성공한 모델 파일이 없다면 샘플/시연임을 명시. placeholder asset을 사용자 생성물인 것처럼 보여주지 않는다.
- 성능: LCP를 이미지 과다로 악화시키지 않음; 3D viewer 동적 import, asset preload 범위 축소, WebGL dispose, Skeleton 최적화, 이미지 responsive, motion reduced.
- 수정 전에 기존 테스트/분기 상태를 읽고 `git status`가 더러우면 사용자의 변경사항을 파괴하지 말 것. 필요시 feature branch/worktree.
- 기록: ADR, `docs/design/CHANGELOG.md`, `docs/design/REFERENCE_AUDIT.md`, `docs/design/TOOL_USAGE.md`, `docs/design/ASSET_MANIFEST.md`, `docs/design/UX_FLOWS.md`, `docs/design/DESIGN_QA.md`, `docs/design/DECISIONS.md`, `docs/design/IMPLEMENTATION_STATUS.md`.

## G. Harness — 절차를 실행 가능한 반복 루프로 구현

### Phase 0: Baseline (실제 현황)

- 현 레포·브랜치·라우팅·스토리지·UI·API·test/build 상황 조사. `/home/m4ml/Desktop/ObjectScan/Mascot`의 실제 파일 검사.
- Dev server 구동 가능한 경우 현재 각 페이지 스크린샷 캡처. 모바일 390/360, 태블릿 768, 데스크톱 1440 px.
- `docs/design/BASELINE.md`에 현재 UI 문제, blocking flow, mobile issues, 기술적 불확실성을 구체적으로 적는다.

### Phase 1: Research + direction (도구 사용 실증)

- Meshy 구조/UX 감사, Taste Skill 디자인 방향 3개, UI UX Pro Max 검색/디자인 토큰, MagicPath 컨셉 2개, Figma editable frames/토큰을 **가능한 범위에서 실제 수행**.
- **최종 고른 한 방향**의 moodboard + target screen list, Figma/스크린샷 링크, palette, typography, spacing을 결정한다.
- 추상적인 보고서만 남기지 않는다. 화면 캡처를 기준으로 비교한다.

### Phase 2: Design system → Real components

- 공통 토큰, Button/Input/Upload/Progress/AssetCard/ViewerShell/Modal/Toast/EmptyState/BrandMascot 등 동작하는 컴포넌트 구현.
- `design-system/objectscan/MASTER.md`와 Tailwind/CSS theme가 실제 일치하도록 검사하고 중복 하드코딩을 제거.
- 독립적인 컴포넌트 미리보기 페이지 또는 Storybook(유지비 과할 경우 경량 route) 구성. 단, 사용자 화면에 이 페이지가 노출되지 않게 관리.

### Phase 3: Core user journeys 구현

- 첫 vertical slice: **Landing → 제작 선택 → 사진 업로드 → 마스크 선택 → 작업 요청 → 처리 상태 → Viewer** (mock end-to-end는 real과 확실히 구분).
- 이후 프로젝트 관리 → 다운로드 → 편집 → 마켓 → 결제 흐름 순서로 확장.
- 기능 모듈화·E2E 경계·보안은 기존 계획에서 빼지 않는다.

### Phase 4: Visual regression & functional QA (반복)

각 페이지, 상태별로 아래 loop를 2~3회 이상 실행:

1. 브라우저 열어 **스크린샷 캡처**: 1440×900 / 1280×800 / 768×1024 / 390×844 / 360×800; dark theme 우선.
2. Taste Skill inspector/자체 browser reviewer + Vercel Web Design Guidelines skill + axe 접근성 검사.
3. 다음 scorecard(각 0~5) 기록: `brand identity`, `visual hierarchy`, `Korean readability`, `product clarity`, `CTA clarity`, `mobile reflow`, `interaction quality`, `accessibility`, `performance`, `design consistency`.
4. 주요 항목의 3점 이하는 반드시 수정; 크리티컬 UX 장애는 점수 관계없이 수리. 수정한 코드 및 이유를 기록.
5. Playwright E2E + typecheck + lint + unit/integration + build + screenshot comparison 재실행.
6. 성공·경고·실패 및 스크린샷 차이를 `docs/design/DESIGN_QA.md`에 링크. 실제 검사하지 않았다면 `미실행`으로 남긴다.
7. 모바일에서 CTA 고장, horizontal overflow, 입력 불가, 의미 없는 skeleton, 잘못된 다운로드 파일, 마스코트 잘림은 release blocker.

### Phase 5: Stabilization and handoff

- CI workflow에 lint/typecheck/unit/build/E2E/screenshot(환경 가용시)을 통합한다. 외부 디자인 플랫폼 장애가 CI를 무조건 실패하게 하지 않도록 문서/링크 검사는 optional gating.
- 빌드·데스크톱/모바일·접근성·핵심 E2E·auth/owner 권한·billing state가 통과하지 않으면 배포 완료 처리하지 않는다.
- README/runbook/preview URL/Figma 링크/스크린샷/남은 Blockers를 정리. 메인 브랜치 병합 전 reviewable PR.

## H. 3인 2주 우선순위 / 지속 개발 규칙

| 우선순위 | A: Design + Frontend | B: 3D + GPU integration | C: Platform + QA |
|---|---|---|---|
| D1-3 | mascot audit / skill/MagicPath/Figma / design tokens | viewer/editor feasibility, model output contracts | baseline E2E/security + routes/CI |
| D4-7 | landing/create/auth/dashboard vertical slice | viewer tools + model progress + output preview | API/queue/upload and E2E |
| D8-11 | editor / marketplace / pricing UI | transform/decimate/save/export, GPU real smoke | entitlement/payment/market integrations |
| D12-14 | visual QA/all widths/Korean copy | GPU regression + UV/GLB checks | deployment/review/security/perf |

주요 협업은 `docs/TASKS.md`의 TASK ID / owner / acceptance / evidence, 독립 브랜치/PR로 추적. 소수 인원이므로 관리 도구 복잡화를 피하고 **working software + evidence**가 최우선이다.

## I. Definition of Done (이것이 없으면 완료 아님)

- [ ] 기존 ObjectScan 저장소의 현재 상태를 확인하고 기존 사용자 동작을 파괴하지 않았다.
- [ ] Meshy에 대한 IA 참고 감사가 존재하며 시각적 모방이 아니다.
- [ ] 마스코트 파일을 직접 검사하여 ALPHA, 외관, 포즈와 사용 위치를 매핑했다.
- [ ] Taste Skill / UI UX Pro Max / Vercel Guidelines를 **실제로 실행**하고 로그/추천/검사 결과를 남겼다.
- [ ] 연결 가능 시 MagicPath 실제 2안 프로토타입과 Figma 편집 가능한 디자인 파일/토큰이 존재한다. 미연결 시 장애 사유와 로컬 대체 산출물이 있다.
- [ ] 사용자가 보는 페이지에 내부 모델명이 노출되지 않는다.
- [ ] 객체만 / 공간 전체 워크플로가 분명하고, masked object selection이 실제 동작 또는 테스트 불가로 정직하게 표시된다.
- [ ] Hero, create, dashboard, project viewer, editor, market, pricing, auth 페이지가 일관된 한국어 브랜드를 따른다.
- [ ] 모바일 너비 360/390 및 데스크톱 1440에서 레이아웃·CTA·텍스트·탭·모달이 정상이다.
- [ ] Mesh editor에서 실제 GLB load → transform → undo/redo → 저장/재다운로드가 동작한다(구현하지 않은 편집 기능은 숨긴다).
- [ ] UI 상태는 실제 API/DB 작업 상태와 일치한다. 결제나 작업 성공을 꾸미지 않는다.
- [ ] `npm run lint`, `typecheck`, `test`, `build`, Playwright 핵심 flow, Vercel Guidelines audit 결과가 기록된다.
- [ ] 기존 기능 회귀가 없는 증거와 PR diff/스크린샷 및 업데이트 문서가 있다.

## J. 당장 실행할 명령

1. **이 전체 프롬프트 및 기존 AGENTS.md 읽고 실제 소스를 조사한다.** Git과 로컬 Mascot 폴더를 확인한다.
2. Codex 환경에서 사용 가능한 스킬, Figma MCP/Plugin, MagicPath를 조사하고 가능한 것은 **사용**한다. 설치/연결 여부와 결과를 먼저 보고한다.
3. Meshy 홈페이지를 실브라우저로 보고 IA를 정리한 뒤 2~3개 **서로 다른** 시안을 구축/비교한다. 시안 결정은 실제 서비스 적합성을 우선.
4. 디자인 토큰과 UI 컴포넌트 코드부터 수정하고 전체 User Journey로 확장한다.
5. 매 작업 후 browser screenshot → UX & accessibility audit → corrections → tests → screenshot 재검수를 반복한다.
6. 실제 diff, 빌드/테스트 결과, 프리뷰 주소, Figma/MagicPath 링크(생성된 경우), 미완료 이유를 남긴다. 권한/로그인이 필요할 때만 최소 정보 요청.

**이번 작업의 성공 기준은 '멋진 1장 시안'이 아니다.** 한국 사용자가 처음 들어와서 사진으로 3D 결과를 만들고, 편집/다운로드/마켓까지 막힘없이 진행할 수 있는 **정제되고 기능적으로 정확한 ObjectScan**이다.
