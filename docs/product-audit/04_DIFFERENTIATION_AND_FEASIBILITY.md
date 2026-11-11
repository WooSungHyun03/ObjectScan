# 차별화·기술 가능성
최종 Sprint 추천은 **① 입력 진단/검토 ② 끊겨도 복구되는 한국어 제작 ③ 버전별 Mesh 품질 카드**다. 세 가지 모두 생성 모델 성능을 발명하지 않고 기존 SV 경로의 신뢰를 개선한다. 시장 수요·전환 개선은 가설이며 고객 인터뷰/실사용 측정 전 입증된 강점으로 광고하지 않는다.

점수는 가치/실현성/차이 각1~5의 **제품 판단**이며 실측 성능 점수가 아니다. 공수는 테스트 포함 엔지니어 추정.

|후보·타깃/문제|경쟁 차이·예상가치|대체/구현범위|위험·측정|점수 가치/실현/차이·공수|
|---|---|---|---|---|
|1 입력 선명도/유사 진단: 초보 촬영자|한국어 구체적 재촬영 사유, 단순 최대장수보다 도움|sharp CPU+hash,OS-07|오탐;고정fixture검출/사용자override|5/5/3·1.5d **추천**|
|2 실패·이탈 복구: 느린 생성 대기자|처리/차감 확정상태 설명의 일관성|기존lease/API,OS-03|경합;중복job/debit0,재접속동일ID|5/4/3·1.5d **추천**|
|3 품질·버전 카드: 다른툴로 가져갈 제작자|GLB내 실제 UV/크기/삼각형을 한국어로 안내|gltfTransform,OS-06|거짓치수/방수보증 금지;파일재계산일치|4/5/3·1.5d **추천**|
|4 선택대상 검토: 복잡배경 사용자|mask 자체는KIRI/RealityScan도지원;검토·복구 연결이 후보|기존SAM2 point/box OS-08|stale승인;변경후 재승인|4/4/2·1.5d|
|5 다중촬영 coverage 설명: 실물복원 사용자|등록카메라/실패사진 근거 안내|COLMAP기존report연결|pose없는데coverage점수생성금지|4/2/3·2d연구후재견적|
|6 생성→다듬기→게시: 취미판매자|한국어 권리/버전 통합;편집깊이는Tripo대비제한|기존editor+snapshot/poster|거래권리/UV손실,OS-04/09|4/4/2·2.5d분할|
|7 object+scene자동라우팅: 공간제작자|모드선택혼란감소,하지만둘다품질전제|기존gate/Worker,OS-13~15|MV OOM/scene파편,상용활성금지|5/1/2·각2d연구|
|8 UV보존 face crop: 배경조각 제거|node삭제보다직접정리|three-mesh-bvh raycast+custom split,OS-16|UV seam/material/undo/삼각형증식|4/2/2·2dspike 후견적|
|9 마스코트 도움말: 첫사용자|친근한 브랜드,기능우위아님|기존mascot·reduced-motion;copy회귀|주요CTA방해금지;태스크테스트|3/5/2·.5d별도후순위|
|10 소유GLB수입/게시: 외부제작자|생성실패와무관하게활용|기존검증+provenance OS-17|권리/악성파일;RLS·예산|4/3/2·2d제한slice|

## 실제 재사용 라이브러리·버전·입출력
버전은 최신 추천이 아니라 **현재 manifest 범위/lock 실제**다. 상세 installed.json 증거를 참고한다. 새로운 업그레이드나 학습 스택 교체를 Sprint에 넣지 않는다.

|기술|현재 범위·상태/입출력|가능/불가능·유지보수 확인|
|---|---|---|
|Three ^0.183/R3F ^9.4/Drei ^10.7|기존 React viewer/editor,GLB→scene|TransformControls 재사용. 실제 간소화/UV crop을 자동 제공하지 않음|
|glTF-Transform ^4.5.1(web)/^4.3(editor),meshoptimizer ^1|GLB→document→editedGLB,이미코드사용|[simplify 공식](https://gltf-transform.dev/modules/functions/functions/simplify) meshoptimizer simplifier 필요. decimation이며 구멍복구/retopology 아님. 문서접근확인2026-11-12|
|three-mesh-bvh ^0.9.18|기존의존성,geometry spatialquery|[공식repo](https://github.com/gkjohnson/three-mesh-bvh) raycasting 가속. object segmentation/UV보존절단은 별도 알고리즘. 공식repo접근확인2026-11-12|
|sharp ^0.35.5|bounded decode/normalize→jpeg/hash|[공식 raw output](https://sharp.pixelplumbing.com/api-output/)로 CPU축소픽셀 추출 가능; blur classifier는 직접구현/검증. 공식changelog0.35.5 확인2026-11-12|
|COLMAP pinned외부환경|images→registeredcamera/sparsemodel|[공식FAQ](https://colmap.github.io/faq.html) feature/overlap/tradeoff 있음. 1장으로진짜coverage 산출불가. binaries/env pin은models.lock/기존report기준|
|SAM2 pinned모델환경|points/box+image→mask|이미CUDA검증. 자동다중뷰동일대상·brush·완벽마스크는 보장안됨. checkpoint권리와 별도환경유지|
|Trimesh4.6+/xatlas0.0.10+/scipy1.14+/fast-simplification0.1.9+|기존 bake stack,mesh→UVtexturedGLB|최소범위 의존성, 실제환경결과를 lock으로고정. geometry crop만으로UV정확성보장없음|
|Blender/Open3D|현재핵심런타임아님|추가headless서비스·기하복구스택 도입은2주에서제외. 설치/유지보수검증없는추천안함|

### GPU·보안·저장 예산
GPU 동시1, 웹과Worker분리 유지. GPU추가메모리소모가없는CPU진단을 우선한다. 단일 image run peak약12.99GiB는 여유보장아님;하위프로세스 포함재측정. 모듈환경을하나로pip합치지않고pinnedsource/venv유지. GLB64MiB/texture/node 예산, EXIF/해상도·외부URI제한,서버소유권검증유지. signedURL은권한검사후짧은TTL,환불후새발급차단. 파일삭제는원장/구매권한hold와정합해야한다.

### 하지 않을 기능
자동 rig/고급생성texture paint/완전remesh/photoreal성공률보장/측량치수보증/실판매대금송금/대규모동시성/신규GPU구입은제외. OAL/GW비상업LICENSE를학교프로젝트발언만으로상업허락으로해석하지않는다. 연구시연과유료운영을Owner가분리결정한다.

## 추가 후보 검증 계획
후보5는 registered/total camera와 reprojection error를 별도 기록하고 metric 없는 경우 미정 표시. 후보6은 원본→편집→게시·권리확인 완료까지 사용성 태스크와 API 권한검증으로 평가한다. 후보7은 실촬영 fixture의 메모리/UV/시각평가를 모두 통과해야 추천으로 승격. 후보8은 checkerboard texture의 crop seam·material 보존·undo roundtrip으로 측정한다. 후보9는 첫 제작을 찾는 사용자 태스크에서 mascot 노출/비노출을 비교하며 현재 데이터는 없다. 후보10은 타인파일/외부URI/예산초과 거부와 본인파일 게시 E2E로 측정한다. 오픈소스는 각각 COLMAP, 기존 Three/editor, pinned Worker, BVH+custom UV split, 기존 React asset, glTF-Transform 검증 경로를 재사용한다. 새 비용 발생 서비스 없이 로컬에서 범위를 검증한다.
