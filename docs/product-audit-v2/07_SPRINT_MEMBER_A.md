# Member A — 7.5인일

프론트/백엔드/AI고정역할없음. 이목록은독립제품티켓묶음이다. 테스트·수정·문서포함; 1인일8시간가정. 첫Ready티켓 **OS-01**. API/DB/키/실인증없이typedfixture로시작한다. A/B차이0.5인일,총15.5/20인일로버퍼22.5%다.

|순서|티켓|인일|시작조건|완료조건|
|---|---|---|---|---|
|1|[OS-01 현재 지원 범위·실패 이유·차감 안내를 생성 전에 표시](tickets/OS-01.md)|0.5|즉시Ready|AC·mock/파일테스트·세viewport·상대리뷰|
|2|[OS-03 통신 단절 뒤 작업 polling 재개와 중복 클릭 방지](tickets/OS-03.md)|1.5|OS-01|AC·mock/파일테스트·세viewport·상대리뷰|
|3|[OS-06 기존 편집 정보로 원본·버전 비교와 JSON 내보내기](tickets/OS-06.md)|1|즉시Ready|AC·mock/파일테스트·세viewport·상대리뷰|
|4|[OS-09 실제 모델에서 만든 썸네일 확인·마켓 카드 표시](tickets/OS-09.md)|1|OS-19|AC·mock/파일테스트·세viewport·상대리뷰|
|5|[OS-11 삭제 확인·중복 클릭 차단·권리 보존 오류 안내](tickets/OS-11.md)|0.5|즉시Ready|AC·mock/파일테스트·세viewport·상대리뷰|
|6|[OS-17 외부 GLB 로컬 편집에서 개인 저장·게시로 이어가기](tickets/OS-17.md)|1.5|OS-06|AC·mock/파일테스트·세viewport·상대리뷰|
|7|[OS-20 편집 동작 이력·삭제 확인·저장 오류 복구](tickets/OS-20.md)|1.5|OS-06|AC·mock/파일테스트·세viewport·상대리뷰|

## D1~D10
|일|개발·버퍼|
|---|---|
|D1|OS-01 .5 + OS-03 .5|
|D2|OS-03 1|
|D3|OS-06 1|
|D4|OS-09 1|
|D5|OS-17 1|
|D6|OS-17 .5 + OS-20 .5|
|D7|OS-20 1|
|D8|OS-11 .5 + 버퍼 .5|
|D9|버퍼1|
|D10|버퍼1|

개인버퍼2.5인일. WIP1(리뷰대기포함최대2),매일작은PR과smoke. OS-12fixture가첫날준비되기전에는순수view-model/unit을진행하고완료후browser를확인한다. OS-09는OS-19의capture/카메라helper후,OS-20은OS-06의editor파일후직렬작업. OS-22는모든TeamPR후. Owner연동대기중에도mock을개발하지만서비스실연동완료로표시하지않는다.
