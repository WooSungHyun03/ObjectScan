# 과업별 마찰·문제 Top10
현재상태/실측/코드관찰/가설을구분한다. 경쟁사참조번호는02문서에있다. 단일근거를실제장애통계로확대하지않는다.

|순위·심각도|현재문제·재현근거|경쟁사과업|해결·Team공수|
|---|---|---|---|
|1·5|Workerinactive,새제작 end-to-end현재가용미확인(preflight)|Meshy/Tripo생성entry|OS-05Owner운영smoke.5d;모델연구없음|
|2·5|실제지원SV한정과scene/MV기대차이,create지원안내늦음|Meshy입력조건/Polycam모드안내|OS-01 .5d|
|3·5|외부signup메일미검증;로컬만통과|Meshy첫작업에계정필수|OS-02 1d+OWN-01|
|4·5|구매license/version snapshot없음(코드/SQL)|Fab이용조건별구매|OS-04 .5d+OWN-06|
|5·4|JobTracker.poll예외뒤재예약없음;응답유실불명|Meshyworkflow/Tripohistory|OS-03 1.5d|
|6·4|최신PG자동복귀/webhook실전달미확인,raw내역|명확한크레딧/기간조건|OS-10 1d,OS-21 .5d+OWN-03|
|7·3|흐림/중복안내·업로드전키보드순서없음;mask오류다음행동약함|KIRI촬영/RealityScanfeedback|OS-07 1.5d,OS-08 1d|
|8·3|방향preset/편집동작목록/삭제전확인없음|Fab뷰어/Tripo편집이력|OS-19 1d,OS-20 1.5d|
|9·3|외부GLB는로컬편집만,서버개인저장→게시끊김|자산툴의입출력연결|OS-17 1.5d+OWN-09|
|10·3|marketicon·license/price필터/검색복귀부족|Fab검색/미디어|OS-09 1d,OS-18 .5d+OWN-08|

## 별도 보안·완결성 항목
기존에셋삭제는구매pending/confirming/paid참조차단이있다. 이를없다고하지않는다. 정상파일정리/원장hold/보관정책은OWN-07;TeamOS-11은중복삭제차단·409/503복구만(.5d). 프로젝트title검색과신고·이탈보호는이미있으므로새기능티켓에서제외했다.

## 반응형·접근성 관찰
360px local-demo에서기존viewer툴바는wrap하며PNG/조명/배경을노출한다. 기존9browser회귀와axe검증은통과했다. 새preset은좁은화면에버튼을추가하므로focus/disabled/44px터치타깃/줄바꿈을다시검증해야한다. 마스코트를늘리거나랜딩전면재디자인하는일감은넣지않는다. empty/loading/error/retry는기존스타일토큰과customer-copy를재사용한다.

## 클릭 수·가치 검증
현재세션에서는경쟁사로그인후전체성공단계수는미측정. TeamOS-19는정의된앞/뒤카메라전환이1행동,OS-21은주문에서내에셋1이동,OS-06은원본/버전1전환이AC목표다. 기존대비사용성향상은고정fixture태스크와클릭로그로비교하고아직실측개선율로광고하지않는다.
