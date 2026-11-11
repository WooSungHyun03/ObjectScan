# 경쟁 서비스 비교
확인일 **2026-11-12 KST**. 아래 [ID]는 말미의 공식 URL을 가리키며 모두 **공식 문서/가격** 검증이다. 직접 공개 브라우저 사용은 별도 표기한다. 로그인 생성/유료 기능은 실제 실행하지 않았다. 형상 품질·정확도·생성 성공률의 상호 우열은 **미확인**이다. 기능 존재와 품질 보증을 구분한다.

## 대상과 가격·조건
|서비스|사용 맥락·입력·편집|가격 snapshot/제한|
|---|---|---|
|Meshy|웹 asset 생성. image/text→viewer→remesh/retexture→export [M4]. Multi-view 기본1+참조3, 플랜/버전 제한 [M3]|Free100 monthly credits [M2]. task cost는 모델/텍스처/해상도별이며 web/API 별도. [M2]와 최신[M5] 수치 차이가 있어 고정 생성단가로 비교하지 않음. free/paid 권리 다름|
|Tripo|웹 Studio·API. part segmentation/transform/texture 편집 및 multi-view [T1,T3,T4]|Free200 credits/월,public/noncommercial 제한. Pro **$20/월 환산·$240 연간결제** 표시 [T1]; 월결제20달러로 해석 금지. API는 별도[T2]|
|Polycam|사진 스캔/공간 측량·library/crop/rotate/measure [P2,P6]. Single-image AI는 **iOS** [P3]|Free150photo/GLTF 중심; Basic300photo, **$150/년 또는 $30/월** [P1,P2]. Business·LiDAR·장치별 제한 있음|
|KIRI|Photo scan/featureless/3DGS/mesh,web+mobile [K2]. auto object mask [K3]|Basic0:150photos,max2GB/scan; Pro **$17.99/월 또는 $79.99/년**,일반 advanced export 최대500photos/5GB, 3DGS with Mesh는300photos/5GB,advanced tools [K1]|
|RealityScan|추가: 사진 복원·자동 마스크/촬영 가이드 비교. desktop/mobile이므로 웹SaaS와 동일하지 않음 [R1,R2]|매출$1M 미만 등 무료 조건, 초과$1250/seat/year 조건 [R3]. EULA 적용 확인 필요|
|Fab|추가: 생성이 아닌 **에셋 거래/미리보기** benchmark [F2]|공식 publisher share88% [F1]. ObjectScan 수수료를88/12로 결정한 것은 아님|

가격은 세금/지역/프로모션·결제주기에 따라 변동 가능. 이번 계정 구매 검증 없음. Polycam Object 문서와 devices 문서의 Android Gaussian Splat 지원 서술이 불일치하므로 **장치별 지원 미확정**으로 둔다. Meshy의 신모델 비용도 과거 문서와 혼합하지 않는다.

## 필수 기능 비교·Gap 매트릭스
|영역|경쟁사/기능|경쟁사 근거|ObjectScan 현재 상태·증거|사용자에게 미치는 영향|격차 심각도(1~5)|개선 제안|구현 비용·GPU/서버 영향|우선순위|
|---|---|---|---|---|---|---|---|---|
|첫 생성 유입|Meshy landing→workspace 입력 UI|직접 공개 화면 evidence/meshy-create, [M4]|create 익명 입력 UI 존재; 운영 생성 off/최신Preview보호|홍보와 실제 지원 차이|5|OS-01 지원 계약, OWN-04 승인|.5d CPU|P0|
|촬영 범위|Meshy 최대4view/Tripo calibrated multi-view; Polycam/KIRI 많은사진|[M3,T3,P2,K1], 플랜 제한|SV1사례만 검증, MV OOM/대용량품질fail|여러사진/공간 기대 미충족|5|OS-13~15 연구; 지원 확대 금지|각2d spike,4080직렬|P2 연구|
|대상 선택|KIRI auto mask/RealityScan mask|[K3,R1,R2]|SAM2 점/박스·승인/제외 실제 존재|선택 자체는 독점 차별점 아님|3|OS-08 검토/실패 복구|1.5d, 기존GPU|P1|
|촬영 진단|Polycam Object draft/capture guidance|[P2,P6]|sharp/SHA만, blur/nearDup없음|불량입력 낭비|4|OS-07 경고 진단|1.5d boundedCPU|P1|
|생성 상태/실패|Meshy credit실패정책, workflow|[M2,M4]|lease/refund있음, 재접속경계 보강필요|중복 제출/불안|4|OS-03 job재연결|1.5d CPU/API|P0|
|기본 편집|Tripo parts, Polycam crop/measure|[T4,P6]|transform/node삭제/simplify실검증;face crop없음|배경조각 정리 제한|3|OS-06 품질카드,OS-16 UVcrop연구|1.5dCPU+2d후순위|P1/P2|
|UV/PBR/export|Meshy 다형식, KIRI GLB/OBJ등|[M1,K4,P5], 모드조건|GLB UV/texture검증있음;PBR생성/다형식미제공|전문툴호환 선택적 제약|3|GLB품질카드 우선, 변환후순위|CPU2d spike추후|P2|
|시장 탐색|Fab 파일/라이선스·상세viewer|[F2]|category/price/title,일반icon card|실물파악과발견성 부족|3|OS-09 poster,OS-18 filters|1dCPUstorage+2d추후|P1/P2|
|거래 권리|Fab license 구분·publisher거래|[F1,F2]|Toss TEST원장/권한환불검증,license snapshot없음|구매조건 변경 위험|5|OS-04 immutable snapshot|1.5d DB/API/UI|P0|
|가격/결제|Tripo monthlycredits/annual terms|[T1,T2]|가격표준비/TEST만;자동callback최신미검증|구매불가/처리불명 상태|4|OS-10 mock회귀+OWN-02/03|1d CPU;Owner인증|P0|
|보관/삭제|Tripo plan별history제한|[T1];경쟁사의완전삭제보장미확인|pendingcleanup만,판매artifact보존미완|개인파일 잔존/권리손실위험|4|OS-11 tombstone/hold|1.5dDB/storage|P0|
|한국어/모바일|공개 Meshy/Polycam/KIRI 영어surface|이번360/1440화면;서비스전체한국어품질미검증|한국어dark/마스코트/axe이미구현|기존강점유지,대규모리디자인불필요|2|오류·지원문구 회귀 OS-01/12|공통검증|P0|

## 직접 공개 사용의 경계
Meshy: 랜딩에서 **한 번의 CTA 이동**으로 anonymous workspace와 입력/예시 UI를 관찰. 생성 버튼 실행/가입/유료 다운로드는 하지 않았으므로 첫 성공까지 총 단계 수는 미확인. Tripo: Chromium403 challenge로 실제 studio 접근 불가; 우회하지 않았으며 공식 문서만 사용. Polycam: 초기 screenshot이 hydration 전 흰 화면이어서 settled 재캡처를 채택. 앱다운로드 중심 CTA·공간 업무 중심 hierarchy 확인. KIRI: web/app 진입 CTA가 있으나 로그인 이후 생성은 미사용. 각 가입→완료 단계 수·에러복구·지원상담·권한·보관삭제 실제 결과는 미확인.

Polycam Explore/KIRI Community/Meshy Discover를 유료 사용자 판매·정산 marketplace로 자동 분류하지 않는다. 4개사의 실제 구매/환불/판매자 지급은 미검증. Fab만 별도 거래 benchmark로 둔다. 모바일 가로넘침 없음은 공개 랜딩 측정 범위이며 전체앱 접근성 인증이 아니다.

## 공식 근거 목록
- **M1** [Meshy 가격](https://www.meshy.ai/pricing) — 공식 문서/가격, 확인2026-11-12.
- **M2** [Meshy web credit/실패 정책](https://docs.meshy.ai/en/webapp/pricing) — 공식 문서/가격, 확인2026-11-12.
- **M3** [Meshy multi-view 도움말](https://help.meshy.ai/en/articles/12634481-how-to-use-multi-view) — 공식 문서/가격, 확인2026-11-12.
- **M4** [Meshy web workflow](https://docs.meshy.ai/en/webapp/getting-started) — 공식 문서/가격, 확인2026-11-12.
- **M5** [Meshy 최신 task cost](https://help.meshy.ai/en/articles/10000507-how-many-credits-does-each-generation-task-cost) — 공식 문서/가격, 확인2026-11-12.
- **T1** [Tripo Studio 가격](https://www.tripo3d.ai/pricing) — 공식 문서/가격, 확인2026-11-12.
- **T2** [Tripo API billing](https://platform.tripo3d.ai/docs/billing) — 공식 문서/가격, 확인2026-11-12.
- **T3** [Tripo multi-view API](https://developers.tripo3d.ai/en/docs/generation-multiview-to-model) — 공식 문서/가격, 확인2026-11-12.
- **T4** [Tripo Studio 편집 update](https://cf-www.tripo3d.ai/blog/tripo-studio-update-log) — 공식 문서/가격, 확인2026-11-12.
- **P1** [Polycam 가격](https://poly.cam/pricing) — 공식 문서/가격, 확인2026-11-12.
- **P2** [Polycam Object](https://learn.poly.cam/hc/en-us/articles/27425185907348-How-to-Use-Object-Mode) — 공식 문서/가격, 확인2026-11-12.
- **P3** [Polycam AI Capture](https://learn.poly.cam/hc/en-us/articles/40225771390228-How-to-Create-a-3D-Model-with-AI-Capture) — 공식 문서/가격, 확인2026-11-12.
- **P4** [Polycam devices](https://learn.poly.cam/hc/en-us/articles/34419168797972-Which-Devices-Are-Supported-by-Polycam) — 공식 문서/가격, 확인2026-11-12.
- **P5** [Polycam exports](https://learn.poly.cam/hc/en-us/articles/27756102599572-What-File-Types-Can-Polycam-Export) — 공식 문서/가격, 확인2026-11-12.
- **P6** [Polycam workflow](https://learn.poly.cam/hc/en-us/articles/39279656782996-Getting-Started-with-Polycam) — 공식 문서/가격, 확인2026-11-12.
- **K1** [KIRI 가격](https://www.kiriengine.app/pricing) — 공식 문서/가격, 확인2026-11-12.
- **K2** [KIRI 기능](https://www.kiriengine.app/features) — 공식 문서/가격, 확인2026-11-12.
- **K3** [KIRI object mask](https://www.kiriengine.app/faq/photo-scan-framing-requirements) — 공식 문서/가격, 확인2026-11-12.
- **K4** [KIRI exports](https://www.kiriengine.app/faq/what-kind-of-file-formats-can-kiri-engine-export) — 공식 문서/가격, 확인2026-11-12.
- **R1** [RealityScan mobile](https://www.realityscan.com/mobile) — 공식 문서/가격, 확인2026-11-12.
- **R2** [RealityScan mask](https://rshelp.capturingreality.com/en-US/tools/mask.htm) — 공식 문서/가격, 확인2026-11-12.
- **R3** [RealityScan license](https://www.realityscan.com/license?lang=en-US) — 공식 문서/가격, 확인2026-11-12.
- **F1** [Fab publisher](https://www.fab.com/become-a-publisher?lang=en-US) — 공식 문서/가격, 확인2026-11-12.
- **F2** [Fab viewer/market](https://www.fab.com/o/about) — 공식 문서/가격, 확인2026-11-12.
