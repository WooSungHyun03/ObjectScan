# CODEX MASTER PROMPT — ObjectScan v2

너는 Principal Full-Stack Engineer, ML Infrastructure Engineer, Product Designer, QA Lead 역할을 모두 수행하는 Codex다. 아래 프로젝트를 구현하고, 검증 가능한 곳까지 배포하라. 사용자의 승인이나 인증 정보가 필요한 지점에서만 정확히 필요한 작업을 요청하고, 나머지는 스스로 조사·구현·테스트·수정하라.

## 0. 최우선 명령

- **ChatGPT Sites를 절대 사용하지 말 것.** 기존 Sites 설계·D1·R2 바인딩·Sites 인증/배포 의존성을 완전히 제거하라. 독립 Next.js 웹사이트와 별도 GPU Worker를 구현한다.
- GitHub 원본 저장소: `https://github.com/WooSungHyun03/ObjectScan.git`. 기존 코드가 있으면 전체 구조와 현재 동작을 파악한 후 점진적으로 개편한다. 빈 저장소라면 처음부터 모노레포를 만든다.
- `design/objectscan-ui-reference.png`가 사용자가 승인한 **핵심 디자인 레퍼런스**다. 이 이미지를 열어 자세히 분석하고, 랜딩 + 앱 대시보드의 전체 시각 언어를 일관되게 적용하라. 이미지를 UI의 단일 배경 스크린샷으로 붙이지 말고 실제 반응형 컴포넌트로 구현하라.
- 두 개의 명확한 서비스 모드: **Object Mesh** / **Full Scene Mesh**. 절대 단일 모드로 뭉개지 말 것.
- 3명, 14일, 전부 AI-assisted/vibe coding, 동시 사용자 최대 1~2명, GPU 한 대 RTX 4080 **16GB**. 과도한 분산 아키텍처·Kubernetes·Redis·복수 백엔드 금지.
- 기능을 허위로 완성 처리하지 마라. 실GPU가 없으면 MOCK으로 테스트할 수 있지만 **REAL_GPU_VALIDATED=false**로 명확하게 기록하고 운영 기능 활성화를 막는다.
- 기존 명세의 가격/이미지 수 단계와 유료 3D 에셋 마켓플레이스를 보존하되, 결제·정산은 테스트/실제 모드에 따라 정직하게 표시하라.

## 1. 레포와 논문·코드 감사 — 구현보다 먼저

다음 3개 소스의 README뿐 아니라 호출 코드, 파라미터, 메모리, 입력/출력 포맷, 의존성, 실패 상태를 직접 분석하고 `docs/MODEL_AUDIT.md`에 근거를 적어라.

1. `https://github.com/TencentARC/Pixal3D` — `inference.py`, `inference_mv.py`, `pixal3d/pipelines`, `assets/mv_images/example/transforms.json`, `--low_vram`, multi-view camera convention, GLB PBR texture export.
2. `https://github.com/WooSungHyun03/object-aware-loss` — `train.py`, `render.py`, `scene`, `utils/camera_utils.py`, `utils/mesh_utils.py`, Masked L1, Alpha/ObjectMark, TSDF extraction, COLMAP data, missing masks.
3. `https://github.com/diego1401/GaussianWrapping` — `gaussian_wrapping/scripts/train_and_extract_gw_ours.py`, `train_and_extract_gw_radegs.py`, `gaussian_wrapping/texture_mesh.py`, COLMAP prerequisites, limits on 16GB, mesh + texture refinement.

중요한 이미 확인된 사실:
- Pixal3D single-view/MV는 **PBR GLB**를 만든다. MV는 RGBA alpha와 정확한 `transforms.json` camera-to-world, horizontal FOV, 첫 프레임 기준 시점을 사용한다. 임의의 촬영 장면에 90도 예제 포즈를 복사하면 안 된다. 공식 low VRAM 옵션은 있지만 RTX 4080에서 성공은 아직 보장되지 않는다.
- Object-Aware Loss는 대상별 **학습**이 필요하다. `<scene>/images`, `<scene>/mask`, `<scene>/sparse/0`로 입력. `render.py`는 TSDF Mesh를 `fuse.ply`/`fuse_post.ply`로 출력하며 **UV Texture GLB를 직접 만들지 않는다.** `fuse_post.ply`도 우선 vertex color 확인이 필요하다. 별도 UV unwrap/baking/export 작업이 필수다.
- Gaussian Wrapping은 full-scene용 COLMAP posed dataset을 받아 training → meshing → texture refinement를 수행한다. 공식 `texture_mesh.py`는 **UV Atlas가 아니라 vertex color를 최적화**해 `_texture_refined` mesh로 출력한다. 필요 시 xatlas/Blender 또는 견고한 baking 단계로 **UV + baseColor Texture가 있는 GLB**를 추가 생성한다. 원본 스크립트에서 texturing subprocess의 반환 코드 검사 누락 가능성도 확인하고 fail-fast하게 래핑한다.
- Pixal3D, Object-Aware Loss, Gaussian Wrapping은 종속성/파이썬 버전/CUDA 확장이 서로 다를 수 있다. **한 Python venv에 무리하게 합치지 말고 모델별 격리 환경**을 사용한다.

모델의 VRAM 및 실행 시간을 정확히 측정하라. RTX 4080이 연결되지 않은 환경에서는 3개의 기본 Model Adapter와 계약·mock smoke만 구현하고, 실제 성능 수치는 지어내지 마라. 1일 차에 GPU smoke-test를 최우선 Gate로 잡아라.

## 2. 최종 기술스택 (확정)

- **Web**: Next.js App Router + React + TypeScript strict, Tailwind CSS, shadcn/ui, Motion(Framer Motion), Lucide.
- **Viewer**: Three.js / `@react-three/fiber` / Drei; GLB 우선, 재질·조명·그리드·wireframe·orbit control·fit-to-view·screenshot. WebGL 자원 해제, 모바일 성능 고려.
- **Auth / DB / Storage**: Supabase Auth + PostgreSQL + Supabase Storage; DB migrations SQL, Storage private buckets, RLS 및 짧은 만료 signed URL. 서비스 키는 서버에서만 사용.
- **API**: Next.js Route Handlers + Zod, typed contract. 별도의 상시 FastAPI 서버를 굳이 만들지 말고 2주 MVP 내 API 계층을 단순화하라.
- **Queue**: PostgreSQL `jobs` 테이블 + 서버에서 구현한 **atomic claim** (DB 함수/transaction, `FOR UPDATE SKIP LOCKED` 또는 동등한 원자적 예약) + lease TTL + heartbeat + retry + idempotency. Redis/Celery 불필요.
- **GPU**: Ubuntu RTX 4080 16GB에서 long-running Python **pull Worker** 1개, 한 번에 GPU 작업 1개. 자체 `worker` 패키지, subprocess runner, timeout, memory metrics, cancellation, process-group teardown, sequential stages; systemd로 자동 재시작. 필요시 모델별 conda/uv 환경 또는 Docker+NVIDIA runtime.
- **Payment**: Toss Payments, 테스트 키 사용 가능한 실결제 흐름, 브라우저 → 인증 → 서버에서 주문금액 대조 → PG 승인 → idempotent ledger 기록. 운영 키·사업자 설정이 없으면 production payment disabled.
- **Deploy**: **Vercel**에 Next.js 독립 사이트 배포 + 자체 커스텀 도메인; **Supabase** Auth/DB/Storage; GPU 서버는 outbound HTTPS로 API를 polling하므로 GPU 서버의 인바운드 포트를 공개하지 않는다. GitHub Actions PR tests → Vercel preview → production promotion. Sites는 사용하지 않는다.
- **Quality**: ESLint, prettier, `tsc --noEmit`, Vitest, Playwright, pytest, CI. 비밀키 .env.example 문서화/실제 키 Git 추적 금지.

## 3. 제품 정보 구조 — 두 모드

### A. Object Mesh (객체만 추출)
- 업로드 가능한 원본 RGB는 복잡한 배경/다른 물체가 포함되어도 된다.
- 사용자가 타깃 객체를 **SAM2 클릭 또는 박스 프롬프트**로 선택한다. 서버는 객체별 마스크를 생성하고 사용자가 마스크를 검토/수정/제외할 수 있도록 한다. 잘못된 마스크는 재선택 또는 재처리한다.
- **1장**: Pixal3D single-image. **2~20장**: Pixal3D multi-view. 데이터 업로드 20장과 모델 실제 사용 20장은 다르다. 카메라 정합, 뷰 선택/축소, Low-VRAM을 통한 2/4/6/8/최대 검증 장수 선택. 사용하지 않은 뷰 수를 숨기지 않는다.
- **21장 이상**: `object-aware-loss` → COLMAP 포즈 정합 + masks + 2DGS training + TSDF mesh + UV baking + GLB. 업로드 수로 모델 라우팅하며, 20장 경계는 Pixal3D, 21장부터 Object-Aware Loss로 일관되게 적용한다.
- 카메라가 움직이고 객체는 고정된 촬영 vs 고정 카메라에서 객체가 턴테이블 위에서 회전하는 촬영을 사용자가 선택/구별할 수 있어야 한다. 전자는 원본 사진 SfM, 후자는 배경 특징에 잠기는 위험이 있으므로 객체 중심 정합 루트가 검증되지 않은 경우 정확한 경고/차단을 제공한다.
- Pixal3D MV의 camera-to-world 좌표계/OpenGL-NeRF FOV 및 1번 frame canonical-front 처리를 테스트하고, SfM 변환을 검증하라. 단순 포즈 복사, 임의 추정 금지.
- SAM2에서 만든 마스크와 원본 RGB/카메라 Intrinsics의 좌표 정렬이 유지되게 할 것. Crop/Resize 시 K 및 pose 업데이트.

### B. Full Scene Mesh (장면 전체 복원)
- Object Mesh와 동등하게 메인 첫 화면에서 선택 가능한 **독립적인 워크플로**.
- 업로드: 겹침이 충분한 다중 시점 RGB. 장면 전체 모드에서는 **SAM2로 배경을 삭제하지 않는다.** 사용자 이미지 전체로 COLMAP → Gaussian Wrapping → mesh extraction → texture refine → UV bake/export.
- 초기 제품 정책으로 **최소 20장 권장**, 단 이 수치는 논문이 보장하는 최소 장수 아님. 장수만으로 성공하지 않으므로 충분한 시차/중첩/포즈 정합을 validate. 적은 장수는 경고 또는 experimental gating.
- 공식 명령부터 시작: `python gaussian_wrapping/scripts/train_and_extract_gw_ours.py -s <COLMAP_SCENE> -m <OUTPUT> -r 2`.
- `-r 2`, `--data_device cpu`, Gaussian count caps 등 가능한 저VRAM 옵션을 실제 코드와 CUDA 환경에 맞게 검증하고, **16GB에서 실측 통과해야만 일반 사용자에게 제공**. 16GB OOM 시 해상도·Gaussian 한도 단계적 조절, 실패도 명확한 UI로 전달. 자동으로 다른 모델을 사용하면서 Gaussian Wrapping이라고 표시하지 마라.
- Vertex-color textured mesh와 UV-textured GLB는 구별하라. 최종적으로 최소 `mesh.glb` + 적용된 UV baseColor texture를 export하고 three.js에서 화면에 정상적으로 보이는지 검사. 필요하면 원본 사진 기반 베이킹을 추가.

### C. 공통
- 공통 `ReconstructionAdapter` 계약: `prepare`, `validate`, `execute`, `extract_mesh`, `texture_bake`, `validate_artifact`, `cleanup`; adapter registry 3개: `pixal3d`, `object_aware_loss`, `gaussian_wrapping`.
- 출력 품질 게이트: triangle faces > 0, watertight 여부 기록(필수 통과 아님), UV 유효성, texture image 존재/로드, GLB parsing, 크기, 폴리곤 수, 빈 mesh 방지. Vertex colors만 있으면 UV-textured 완료라고 보고하지 말 것.
- 실패 / 재시도 / 취소 / GPU OOM 처리. 성공 전 과금확정 및 다운로드 활성화를 잘못 처리하지 말 것.

## 4. 디자인 — 첨부 레퍼런스를 실제 UI로 구현

참고 이미지: `design/objectscan-ui-reference.png`.

**브랜드 방향**: premium creative tool; charcoal/graphite dark theme, restrained mint accents, editorial sans-serif typography, 반투명 유리 카드 남발 금지, 깊고 은은한 그림자, 다크 네이비 패널과 1px hairline border, 정제된 여백, 큰 형상 타이포그래피, 실제 3D 오브젝트 비주얼. 모바일 360px부터 데스크톱까지 완전 반응형.

색상 토큰 제안: app background `#0D1317`, surface `#151C21`, raised `#1B2529`, border `#304047`, primary mint `#A9F5CD`, text `#F6F7F4`, muted `#9BABAE`, error `#F38C8C`. 코드에 theme tokens으로 관리하고 WCAG 명도비 검증. 폰트는 Geist/Inter/Pretendard 중 실제 사용 가능한 조합. 제목은 강한 위계, 본문은 과도한 bold 금지.

**시각 구성**:
1. Landing `/`: 로고 ObjectScan, Product/Marketplace/Pricing/Docs, Log in/Get Started; 큰 헤드라인 `Turn images into 3D.`와 한 줄 설명, 촬영 사진이 texture mesh/wireframe으로 분할되는 큰 메인 3D 비주얼; 왼쪽 Object Mesh / Full Scene Mesh 선택 카드; 하단 기능 줄. 허위 고객 후기나 실측 수치 생성 금지.
2. Auth `/login`, `/signup`: 브랜드 일관성, 이메일 로그인/가입, 비밀번호 재설정, 실제 피드백.
3. Dashboard `/dashboard`: sidebar 또는 모바일 메뉴; New Reconstruction, My Projects, My Assets, Marketplace, Billing, Settings; 작업 카드, 최근 사용 상태.
4. New `/reconstruct/new`: `Upload → Select Object/Edit Masks (object only) → Configure → Process` 스테퍼. 상단 2모드 segmented tabs, 업로드 thumbnails, 제외/복구, SAM2 target 선택/마스크 overlay/edit, 입력 장수 표시, 오른쪽 sticky 3D preview / 설정 패널. Scene 모드는 mask 단계 자동 생략하고 COLMAP 정합 품질 화면 표시.
5. Detail `/projects/[id]`: 실시간 단계별 상태, 에러 상세·재시도, 3D viewer(Orbit/Zoom/Reset/Wireframe/Background/lighting), GLB 다운로드 및 license/publish. 작업 중에는 예상 시간 허위 수치 금지.
6. Marketplace `/marketplace`, `/marketplace/[id]`: 검색·카테고리·정렬, 3D 상품 미리보기, 가격·판매자·저작물 권리 확인, 구매, 구매 후 소유 라이선스/다운로드. 판매자 Asset publish, draft, 관리자 신고/내리기.
7. Pricing `/pricing`, Billing `/billing`: 이미지 수별 구간, 생성 과금, 장면 전체 요금, marketplace 수수료가 명확히 구별되어야 한다.

시안의 이미지를 콘텐츠로 복제하는 게 아니라 실제 작동하는 디자인으로 변환. skeleton/loading/empty/error/disabled/confirmation 상태 모두 완성. 키보드 접근, focus, semantic buttons, 16:9 및 mobile 스크린샷과 시안 대조. 사용자 제공/제작에 관한 저작권·데이터 삭제 안내.

## 5. DB 및 API

`profiles`, `projects`, `project_images`, `object_masks`, `camera_poses`, `jobs`, `job_events`, `artifacts`, `pricing_tiers`, `orders`, `payments`, `credit_ledger`, `marketplace_listings`, `asset_purchases`, `seller_balances`, `payout_requests`, `audit_logs` 테이블을 마이그레이션으로 작성. 초기에 반드시 필요한 칼럼만 만들고 과도한 추상화 금지.

모든 개인 프로젝트 원본 이미지·mask·mesh는 비공개 Supabase Storage bucket. 마켓 공개 썸네일/프리뷰는 게시 승인된 별도 prefix만. 모든 조회·다운로드·URL 발급은 인증된 소유자·구매자·공개 asset 권한을 검증한다. RLS 및 server-side authorization 이중 검증. UUID 권한 우회/다른 유저 파일 접근 테스트.

`jobs` 처리 상태: `draft`, `uploaded`, `awaiting_mask_review`, `queued`, `preflight`, `pose_estimation`, `segmentation`, `reconstruction`, `meshing`, `texturing`, `validating`, `completed`, `failed`, `cancelled`. 단계를 DB 이벤트로 기록. 원자적 claim/lease/heartbeat와 중복 실행 및 재시작 회복 처리. Worker 인증은 scoped secret/HMAC, HTTPS, payload validation. 비밀정보 로그 및 파일 경로 노출 금지. Vercel 요청 타임아웃에서 GPU 작업을 돌리지 말 것.

**업로드**: 파일 타입·용량·장수 제한, 서버 검증, 업로드 중 취소/재시도, metadata/EXIF orientation, 이름 정규화, 개별 이미지 제외, orphan cleanup. 실제 서비스의 스토리지 비용 및 데이터 보관 기간을 문서화.

## 6. 결제와 Marketplace 비즈니스 모델

생성 과금 구간: `1–20`, `21–40`, `41–60`, **61장 이상도 20장 단위 확장 구간을 명시적으로 표시**하며 가격은 관리자 구성값에서 읽어라. 사용자가 말한 원래 구간 `0–20`에서 0장은 작업 자체가 불가능하므로 1장부터 시작. 이미지 수만으로 계산된 가격을 서버에서도 재검증하며 생성 모드에 따라 요금표를 분리한다. 금액은 미정이므로 지어내지 말고 test fixtures/admin config 사용.

결제는 Toss Payments test mode를 기본으로 구현하고 `orderId`/서버 저장 `amount` 검증 후 server confirm, webhook 서명·중복·순서 문제 처리, 크레딧 차감 원자성 보장. 실제 PG 계정 없으면 실결제 버튼 disabled + 안내. 사업자/정산 계정 없이 실제 돈을 수령한 것처럼 표시 금지.

Marketplace: 자산을 올리고 가격 책정, 미리보기, 구매 후 다운로드 권한 부여, 플랫폼 수수료율을 DB config로 관리. 판매자 정산은 admin-reviewed payout requests/ledger까지 구현하되, 실제 송금은 적법한 지급대행 연동과 실계정 확인 전 자동 송금 금지. 다운로드 URL은 짧게 만료. 제작자가 올린 콘텐츠에 대한 권리 동의/신고/삭제 기능 포함.

## 7. 3명 × 14일 자율 개발 계획

팀 운영은 GitHub Issues + `docs/TASKS.md` + 3개 작업 트랙, 독립 worktree/PR. 한 사람이 만든 모듈의 소유권과 interface를 명확히 하라.
- **A (Frontend/Design)**: D1-2 디자인시스템/라우트 프레임; D3-5 auth/dashboard/업로드; D6-8 SAM2 마스크/작업상태/3D viewer; D9-11 marketplace/billing; D12-14 반응형/E2E/접근성.
- **B (GPU/Models)**: D1 CUDA·VRAM 확인 + 세 모델 순서별 smoke; D2-4 SAM2/pose/data contracts; D5-7 Pixal3D adapter; D8-10 object-aware-loss + mesh; D11-12 GaussianWrapping + UV bake; D13-14 QA/OOM/recovery.
- **C (Platform/Integration)**: D1-2 Supabase schema/auth/security; D3-5 upload/private storage/job queue; D6-8 pull worker endpoints/lease/heartbeat/logs; D9-11 Toss test + marketplace ledger/permissions; D12-14 CI/staging/deploy/security checks.

실GPU 제약이 막히면 A/C 작업은 계속 진행하고, B는 재현 가능한 최소 단위로 이슈/로그/필수 조건을 남긴다. D3까지 3개 모델 GPU feasibility gate. **전부 구현된 척하는 것보다 정상 동작하는 축소된 기능을 우선한다.**

## 8. Engineering Loop / Harness

초기 생성 파일: `AGENTS.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/MODEL_AUDIT.md`, `docs/DECISIONS.md`, `docs/TASKS.md`, `docs/RISK_REGISTER.md`, `docs/RUNBOOK.md`, `docs/RELEASE_CHECKLIST.md`, `.env.example`, `supabase/migrations/*`, `contracts/*`, `scripts/doctor*`, `scripts/smoke*`, `.github/workflows/ci.yml`.

**모든 작업의 반복 루프**:
1. Repo/목표/의존성을 읽고 TASK ID, acceptance criteria, 영향을 받는 파일, 위험도를 `docs/TASKS.md`에 기록.
2. 실 구현을 위한 최소 단위로 코드를 작성. 외부 레포를 app source에 무작정 복사하지 말고 pinned submodule/checkout + adapter 래퍼, 파일 시스템 경계 사용.
3. 자동 포맷/lint/typecheck/unit/integration/e2e tests를 수행. 샌드박스에서 GPU가 없으면 mock contract 테스트와 실제 GPU 테스트를 구별.
4. 실패 시 에러 로그를 기반으로 근본 원인 해결, 동일 실패 2회 반복되면 Blocker 등록 및 대안을 구현. 로그를 숨기지 않음.
5. 관측 가능한 결과(스크린샷, HTTP 응답, GLB parse report, nvidia-smi memory peak, 정합률, migration diff)를 PR에 첨부.
6. 통합 후 문서/테스트/작업 상태를 갱신하고 다음 작업으로 이동.

**절대 규칙**:
- 더미 UI에 가짜 성공 배지·가짜 결제 완료·가짜 3D 모델을 사용해 본기능이 완성된 것처럼 표현하지 말 것.
- 실제 GPU의 모든 모델은 메모리·시각 결과·출력 Mesh/Texture 검증 필요.
- 한 번에 한 GPU job, 서버 재시작 시 recoverable state.
- 파일 경로 traversal, zip bombs, upload abuse, SSRF, 비인가 다운로드, user A/B 격리, secret leakage 테스트 필수.
- 기술 선택 변경 시 `docs/DECISIONS.md`에 근거. 사용자가 반드시 결정할 사항이 아닌 한 알아서 진행.

## 9. Definition of Done / Acceptance Gates

- [ ] Auth 가입/로그인/비밀번호 재설정 및 접근 권한 테스트.
- [ ] 2개 모드 선택과 전 과정 화면 작동; object mask review / scene 전체 렌더 차이가 분명함.
- [ ] 1장 / 4장 / 20장 / 21장 / 40장 / 60장 / 100장 라우팅 및 가격 구간 테스트.
- [ ] Pose가 없거나 잘못된 Pixal3D MV는 조용히 잘못된 mesh를 만들지 않고 에러/검토로 처리.
- [ ] GPU job lease, 중복 요청, 취소, OOM, GPU 재부팅 후 복구가 테스트됨.
- [ ] 실제 3D preview와 최종 다운로드 파일은 geometry + UV + nonempty texture를 통과한 것만 완료 표시.
- [ ] Marketplace 구매 권한 및 수수료·정산 원장이 일관됨.
- [ ] Vercel preview build, migrations, GitHub Actions CI, dev/prod environment 문서화.
- [ ] 실GPU에서 검증 안 된 항목은 미검증/disabled로 명시.

## 10. 지금 당장 실행하라

1. 현 레포 클론/조사 + `design/objectscan-ui-reference.png` 이미지 확인.
2. 현재 구조가 비어 있으면 모노레포 `apps/web`, `packages/shared`, `gpu-worker`, `supabase`, `docs`, `scripts` 스캐폴드 구축.
3. `docs/MODEL_AUDIT.md` 및 `docs/RISK_REGISTER.md` 먼저 작성.
4. 새 디자인 시스템과 landing / dashboard / new reconstruction / viewer까지 동작하는 첫 vertical slice 완성.
5. DB/Auth/Storage 연결, queue worker contract, 모델별 adapter를 순차적으로 추가.
6. 위 Loop에 따라 테스트·수정·PR·배포를 지속하고, 매 단계마다 완료/차단/미검증을 구분해 보고.

사용자가 로그인, 환경변수 또는 GPU SSH 권한을 제공하면 해당 인증을 요청하고, 그 외 작업은 반복 질문 없이 계속 진행한다. 불필요한 기간 추정이나 일일 상태 보고만 하지 말고 **검증된 코드와 결과물**을 우선 생성하라.
