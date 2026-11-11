# Gap·UX 감사
확인2026-11-12. UI UX Pro Max의 task recovery/error guidance와 최신 Vercel Web Interface Guidelines를 실제 참고했다. 아래는 관찰/위험/새 실패 재현 필요를 구분한다. 모든 항목이 현재 발생한 장애라는 뜻은 아니다.

|순위|문제·심각도|재현·근거|영향·티켓|
|---|---|---|---|
|1|지원 약속과 실제 가용범위 불일치 5|랜딩 “물체 하나부터 공간 전체”; create/pricing capability 준비. screenshot objectscan/local-create|미검증 공간·MV 기대. OS-01,OWN-04|
|2|다중뷰16GB OOM 5|docs/validation/pixal-mv-oom.json;512진단과 실촬영입력 차이|여러 장 지원 불가. OS-13|
|3|객체21+/장면 시각품질 탈락 5|oal-object21/gw-scene32 validation|Mesh 파일 생성≠쓸만한 복원. OS-14/15|
|4|외부 신규가입 SMTP 미확인 5|로컬 Mailpit만 freshpass; 외부 email authgate 미사용|신규유입이 시작 못할 위험. OS-02,OWN-01|
|5|구매 license/version 불변 snapshot 없음 5|migration license_snapshot 검색없음,listing mutable|조건 변경/분쟁위험. OS-04|
|6|공개/Preview/main 서로 다름 4|배포 readonly JSON,gitPR분기|개발자가 잘못된 기준에서 시작. OS-12,OWN-04|
|7|완료 불명/브라우저 종료 복구 전체 경계 미검증 4|기존job-tracker와 lease테스트는 있음; 종료/재접속fresh전체E2E없음|중복제출·과금 불안. OS-03|
|8|입력 blur/nearDuplicate 설명 없음 4|files.ts SHA exactdedup만;create촬영안내정적|실패후 재촬영 근거부족. OS-07/08|
|9|정상 산출물 삭제·거래 hold 정책 미완 4|maintenance cleanup pending/rejected 중심|개인파일 잔존/거래손실. OS-11|
|10|실물 market poster/구매 후조건 탐색부족 3|asset-card generic icon,publish-form;현재빈마켓 screenshot|상품구분·신뢰부족. OS-09/18|

## 화면별 관찰
- 랜딩 1440/360: 마스코트·teal CTA·읽기 쉬운 한국어와 실제 회전 가능한 예시. 전면 디자인 폐기 대상이 아니라 **지원 범위·예시 provenance의 일관성**이 우선이다. 파란 신발은 licensed example, 실GPU pink shoe와 구분; 공간 이미지도 design illustration이다.
- create: 익명 파일 선택과 object/scene 분리 있음. 외부 모델명 고객노출 회귀는 기존 visual.spec가 검사한다. 사진선택 전에 현재 가능한 모드를 짧게 안내하는 것이 OS-01 핵심.
- pricing: 상품 “준비 중” 상태는 실제 운영값을 반영. 임의가격/가짜 판매는 넣지 않는다. Owner 정책 후 계약값만 표시한다.
- marketplace: 현재 빈 상태와 예시 편집 분리 안내가 정확하다. fake inventory를 채워 디자인을 평가하지 않는다. 기존 카드 결함은 code관찰이고 실제 유료재고에서 측정한 전환율은 없다.
- editor: 이번 실제 변환/undo/간소화/버전복원/39MB파일 export 통과. node deletion을 crop으로 이름붙이지 않는다. face crop은 UV 보간 spike 후 별도 결정.
- 로그인/가입·보호workspace·업로드·편집·결제결과는 이번9개 browser regression에서 확인. 실계정 SMTP/카드인증은 재실행 안함.

## 검수 규칙
불확실한 대기시간은 보장 ETA 대신 단계·갱신 시각·재접속 가능 여부. 오류에는 다음 행동·입력 보존·재시도 조건. 키보드 focus·label·reduced motion·터치타깃·empty/error/loading을 검사한다. axe통과는 사용성 전체 보증이 아니며 수동검수와 구분한다. 360/768/1440 screenshots는 EVIDENCE_INDEX에 있다.
