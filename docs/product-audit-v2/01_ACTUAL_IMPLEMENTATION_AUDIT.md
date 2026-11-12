# 실제 구현·실행 감사

확인2026-11-12 KST. 원문00_REQUEST.md 전체를읽고로컬v1인덱스/OS18개/OWN5개와GitHub #2~#30의현행본문/라벨/상태를전수확인했다. 이번에별도첨부된08_TICKET_INDEX.md는없었으며로컬과GitHub가동일파일이라고가정하지않았다. GitHub본문은절대링크변환등차이가있어두근거를별도보존한다.

## 버전·서비스
|대상|직접 확인|판정|
|---|---|---|
|앱repo|/home/m4ml/Desktop/ObjectScan/ObjectScan-v2|parent경로와구분|
|검토HEAD|e411f871e98884756b6495d790bfbc840f0101d0|v1문서추가,앱debc1f7|
|개발branch|feat/service-launch-v5 7ee1709|현재검토HEAD와앱차이없음|
|main|a67a0c1|문서기준,최신앱아님|
|PR|#1→main,#5→#1branch,#6→#5branch,#7→#6branch,#31→v5|stack open,무단merge안함|
|로컬웹|127.0.0.1:3010,PID1345517 Nextserver|실행중,이번실브라우저검사|
|로컬API/DB|Supabase56321/56322,Mailpit56324,migration21파일|disposablelocal테스트,원격변경없음|
|GPU|RTX4080 16376MiB,검사시1405MiB사용|장치발견은추론성공아님|
|Worker|objectscan-worker.service inactive/dead,ExecMainStatus0|현재생성가용미확인;임의재기동안함|
|공개ObjectScan|objectscan-six.vercel.app200|기존v4,최신v5구현과분리|
|v5Preview|objectscan-qz44npios-sunghyuns-projects-da008879.vercel.app302 SSO|이번비인증접근불가.이전실연동증거와구분|
|be-celeb.org|200,title 이지마케팅(EasyMarketing)|교체결정완료,이번실제전환안함|

## 사용자 연결점 재현 (최소8개)
|과업|이번 결과·종류|증거/한계|
|---|---|---|
|1 가입→메일확인→비밀번호복구|PASS 실제로컬 Mailpit|auth-email.spec.ts,외부SMTP아님|
|2 익명사진선택→로그인→private프로젝트|PASS 실제로컬|platform.spec.ts,disposable계정|
|3 signed upload→서버파일저장·타인차단|PASS 실제로컬|platform.spec.ts+database.test.ts|
|4 object/scene 분리·대상/마스크검토 화면|UI분리PASS;대상마스크실행이번미실시|기존SAM2실GPU증거유지,현재workerinactive.웹전체생성완료주장안함|
|5 생성요청/상태·실패복귀|기존계약/자동테스트PASS;새GPU실행없음|Worker26개mock회귀. JobTracker poll예외후타이머중단코드발견|
|6 texturedGLB viewer→편집→undo/간소화→GLB재열기|PASS 실제브라우저파일처리|editor.spec.ts,39MB기존실제산출물fixture포함.새생성아님|
|7 private편집버전저장→재열기→타인404|PASS 실제로컬API/Storage|editor.spec.ts,원본보존·버전ready|
|8 결과→판매폼→게시·검색·상세|PASS **MOCK API UI연결**|owner-local-connections.spec.ts;승인/실DB게시검증으로해석금지|
|9 콘텐츠신고→접수안내|PASS **MOCK API UI연결**,실제접수서버코드존재|ListingDetail/POST listings/id/report;신규신고기능티켓폐기|
|10 구매주문→checkout→callback→내에셋다운로드|PASS **MOCK PG/API UI연결**|실제카드인증/원장변경없음.권한은DB회귀와별도|
|11 환불·재구매·권한회수|PASS 로컬DB/provider mock|payments/database.tests.새실제Toss인증없음|
|12 에셋삭제확인→목록반영|PASS **MOCK API UI연결**|현재DELETE보존조건은코드검토;운영삭제안함|

## 있는 기능과 정확한 Gap
- Viewer `model-viewer.tsx`: Bounds/Center/OrbitControls/reset/wireframe/texture/grid/background/light/PNG/fullscreen **있음**. 방향preset없음. GLB를3D미리보기하는 public_preview_path는posterPNG가아님.
- Editor `use-mesh-editor.ts`:typedops,worker내GLB처리,undo/redo,cursor,saveKey,dirty,beforeunload/anchor확인 **있음**. nodehide/delete/simplify와64MiB검증 **있음**. 동작이력목록·삭제전확인은없음. face crop/paint/AI보정은없고이번범위제외.
- `mesh-editor.tsx:252` 삼각형·크기·UV/표면이미지 **있음**. 새basic품질패널금지;OS-06은한canvas버전비교/JSON만.
- `api.ts:95~110` mask reviewed/project.revision gate **있음**. stale승인방지신규알고리즘금지;OS-08은UI오류복구/접근성만.
- `dashboard.tsx:49` 프로젝트제목검색 **있음**. `marketplace.tsx` title/category/price-sort **있음**. license/가격localfilter와URL상태복원은없음.
- `listing-detail.tsx` 콘텐츠신고폼, `api.ts:1101` listing_report접수,admin reports조회 **있음**. 신고를새기능으로개발하지않음.
- `api.ts:765+` 게시 upsert **있음**. 판매자가기존listing내용을다시불러오는전용화면/계약은제한적. 추가seller전체대시보드는후속.
- `asset-library.tsx` 에셋다운로드/삭제구매중차단 UI **있음**. 정상파일cleanup/legacysnapshot/외부GLB등록은Owner연동영역.
- `GenerationCheckout.start` 매시도 crypto.randomUUID, `JobTracker.poll` catch후재예약없음은코드확인한복구위험. 실제금전중복발생을관찰한것은아님.
- Billing은credits/order/refund-request/manualpayout요청이있으나raw status와재다운로드연결이불친절. 실제송금은없고추가하지않음.

## 모델 지원 한계 (연구할 일감 아님)
기존SV실GPU1사례39,134,488B UV/textureGLB와다운로드검증은reports/RELEASE_EVIDENCE.md에있다. 1024MV OOM/512진단미자격,OAL21구멍/파편,GW32장fragmentedMesh는docs/validation참조. 이감사에서새벤치마크·학습·품질실험·VRAM효율연구를하지않았고후속연구티켓도남기지않는다. 가능한지원만gate하고나머지는한국어안내한다.
