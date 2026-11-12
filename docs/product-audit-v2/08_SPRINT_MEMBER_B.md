# Member B — 8인일

프론트/백엔드/AI고정역할없음. 이목록은독립제품티켓묶음이다. 테스트·수정·문서포함; 1인일8시간가정. 첫Ready티켓 **OS-12**. API/DB/키/실인증없이typedfixture로시작한다. A/B차이0.5인일,총15.5/20인일로버퍼22.5%다.

|순서|티켓|인일|시작조건|완료조건|
|---|---|---|---|---|
|1|[OS-02 가입·복구 링크 오류와 메일 대기의 복구 UI](tickets/OS-02.md)|1|즉시Ready|AC·mock/파일테스트·세viewport·상대리뷰|
|2|[OS-04 구매 당시 이용 조건과 legacy 누락값 조회 UI](tickets/OS-04.md)|0.5|즉시Ready|AC·mock/파일테스트·세viewport·상대리뷰|
|3|[OS-07 업로드 전 사진 품질 경고와 선택 순서 정리](tickets/OS-07.md)|1.5|OS-01|AC·mock/파일테스트·세viewport·상대리뷰|
|4|[OS-08 마스크 실패·재선택·이전 단계 복귀의 안내와 접근성](tickets/OS-08.md)|1|OS-01|AC·mock/파일테스트·세viewport·상대리뷰|
|5|[OS-10 TEST 결제 응답 유실·중복 복귀의 상태 복구 UI](tickets/OS-10.md)|1|OS-01|AC·mock/파일테스트·세viewport·상대리뷰|
|6|[OS-12 키·DB 없는 공통 UI fixture 시작점](tickets/OS-12.md)|0.5|즉시Ready|AC·mock/파일테스트·세viewport·상대리뷰|
|7|[OS-18 마켓 라이선스·가격 필터와 URL 검색 상태](tickets/OS-18.md)|0.5|즉시Ready|AC·mock/파일테스트·세viewport·상대리뷰|
|8|[OS-19 결과 뷰어 앞·뒤·좌·우 시점과 재맞춤](tickets/OS-19.md)|1|즉시Ready|AC·mock/파일테스트·세viewport·상대리뷰|
|9|[OS-21 구매 내역의 한국어 상태와 에셋 재다운로드 연결](tickets/OS-21.md)|0.5|즉시Ready|AC·mock/파일테스트·세viewport·상대리뷰|
|10|[OS-22 팀원 fixture 통합 회귀와 Owner 인계 리포트](tickets/OS-22.md)|0.5|OS-01, OS-02, OS-03, OS-04, OS-06, OS-07, OS-08, OS-09, OS-10, OS-11, OS-12, OS-17, OS-18, OS-19, OS-20, OS-21|AC·mock/파일테스트·세viewport·상대리뷰|

## D1~D10
|일|개발·버퍼|
|---|---|
|D1|OS-12 .5 + OS-02 .5|
|D2|OS-02 .5 + OS-04 .5|
|D3|OS-19 1|
|D4|OS-07 1|
|D5|OS-07 .5 + OS-08 .5|
|D6|OS-08 .5 + OS-10 .5|
|D7|OS-10 .5 + OS-18 .5|
|D8|OS-21 .5 + 버퍼 .5|
|D9|OS-22 .5 + 버퍼 .5|
|D10|버퍼1|

개인버퍼2인일. WIP1(리뷰대기포함최대2),매일작은PR과smoke. OS-12fixture가첫날준비되기전에는순수view-model/unit을진행하고완료후browser를확인한다. OS-09는OS-19의capture/카메라helper후,OS-20은OS-06의editor파일후직렬작업. OS-22는모든TeamPR후. Owner연동대기중에도mock을개발하지만서비스실연동완료로표시하지않는다.
