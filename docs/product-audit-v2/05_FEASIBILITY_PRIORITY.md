# 우선순위·가능성·예산
P0 7개, P1 10개 = Team17개15.5인일. P2/연구작업은Sprint에없다. Owner-local10개추정10인일은별도이며본인이코딩10일을한다는뜻이아니라**Owner컴퓨터Codex실행량의별도위험예산**이다. 계정인증·운영승인대기로추가경과시간이생길수있다.

|ID|P|Member|인일|선행|Owner실연동|최소범위|
|---|---|---|---|---|---|---|
|[OS-01](tickets/OS-01.md)|P0|A|0.5|없음|없음|현재 지원 범위·실패 이유·차감 안내를 생성 전에 표시|
|[OS-02](tickets/OS-02.md)|P0|B|1|없음|OWN-01|가입·복구 링크 오류와 메일 대기의 복구 UI|
|[OS-03](tickets/OS-03.md)|P0|A|1.5|OS-01|없음|통신 단절 뒤 작업 polling 재개와 중복 클릭 방지|
|[OS-04](tickets/OS-04.md)|P0|B|0.5|없음|OWN-06|구매 당시 이용 조건과 legacy 누락값 조회 UI|
|[OS-06](tickets/OS-06.md)|P1|A|1|없음|없음|기존 편집 정보로 원본·버전 비교와 JSON 내보내기|
|[OS-07](tickets/OS-07.md)|P1|B|1.5|OS-01|없음|업로드 전 사진 품질 경고와 선택 순서 정리|
|[OS-08](tickets/OS-08.md)|P1|B|1|OS-01|없음|마스크 실패·재선택·이전 단계 복귀의 안내와 접근성|
|[OS-09](tickets/OS-09.md)|P1|A|1|OS-19|OWN-08|실제 모델에서 만든 썸네일 확인·마켓 카드 표시|
|[OS-10](tickets/OS-10.md)|P0|B|1|OS-01|OWN-03|TEST 결제 응답 유실·중복 복귀의 상태 복구 UI|
|[OS-11](tickets/OS-11.md)|P1|A|0.5|없음|OWN-07|삭제 확인·중복 클릭 차단·권리 보존 오류 안내|
|[OS-12](tickets/OS-12.md)|P0|B|0.5|없음|없음|키·DB 없는 공통 UI fixture 시작점|
|[OS-17](tickets/OS-17.md)|P1|A|1.5|OS-06|OWN-09|외부 GLB 로컬 편집에서 개인 저장·게시로 이어가기|
|[OS-18](tickets/OS-18.md)|P1|B|0.5|없음|없음|마켓 라이선스·가격 필터와 URL 검색 상태|
|[OS-19](tickets/OS-19.md)|P1|B|1|없음|없음|결과 뷰어 앞·뒤·좌·우 시점과 재맞춤|
|[OS-20](tickets/OS-20.md)|P1|A|1.5|OS-06|없음|편집 동작 이력·삭제 확인·저장 오류 복구|
|[OS-21](tickets/OS-21.md)|P1|B|0.5|없음|없음|구매 내역의 한국어 상태와 에셋 재다운로드 연결|
|[OS-22](tickets/OS-22.md)|P0|B|0.5|OS-01, OS-02, OS-03, OS-04, OS-06, OS-07, OS-08, OS-09, OS-10, OS-11, OS-12, OS-17, OS-18, OS-19, OS-20, OS-21|없음|팀원 fixture 통합 회귀와 Owner 인계 리포트|

TEAM경계에DB/GPU/키작업은0개. 새계약이필요한기능은UI/mock을독립완료하고Owner미연동상태를명시한다. protected SSR은API인터셉트만으로우회할수없으므로OS-12가키없는test-onlyReactfixture진입점를제공한다. 실제Supabase/PG/GPU검증은Owner가수행하며Team에비밀키를배포하지않는다.

## 현실적 서비스 완료
Team UI완료만으로가입→실GPU생성→거래전체완료가되지않는다. 현행workerinactive·외부SMTP·최신PG복귀·snapshot서버연동은Owner게이트다. P0가막히면OS-17/09같은Owner의존P1을featureflag off로유지하고핵심SV경로를우선한다. 남은시간에모델연구나P2를끌어오지않는다.

후속제품백로그:판매자기존게시물prefill/상태조회,내에셋정렬/이름검색(프로젝트검색과구분),파일형식추가의사용가치확인,도움말정리. 임의추정으로개발완료로잡지않고별도0.5~2일slice와AC를작성할때만착수. 계정전체삭제/실송금/자동추천/고급brush는미배정이다.
