# V6 티켓 인덱스

**SYNCED** — 기존23개갱신,신규8개만추가,연구4개와상위연구#2를not planned종료. Team17개15.5인일(A7.5/B8),버퍼22.5%. Owner10개별도. 기능구현완료가아니며전체서비스실연동미완.

[GitHub Milestone](https://github.com/WooSungHyun03/ObjectScan/milestone/1) · [전수매핑](06_TICKET_MAPPING.md)

## TEAM — 외부키/DB/GPU/배포 작업 없음

|ID·Issue|담당|인일|상태|선행·실연동|
|---|---|---|---|---|
|[OS-01](tickets/OS-01.md) [#8](https://github.com/WooSungHyun03/ObjectScan/issues/8) 현재 지원 범위·실패 이유·차감 안내를 생성 전에 표시|A|0.5|Ready|없음|
|[OS-02](tickets/OS-02.md) [#9](https://github.com/WooSungHyun03/ObjectScan/issues/9) 가입·복구 링크 오류와 메일 대기의 복구 UI|B|1|Ready|없음; Owner OWN-01|
|[OS-03](tickets/OS-03.md) [#10](https://github.com/WooSungHyun03/ObjectScan/issues/10) 통신 단절 뒤 작업 polling 재개와 중복 클릭 방지|A|1.5|Ready after Team PR|OS-01|
|[OS-04](tickets/OS-04.md) [#11](https://github.com/WooSungHyun03/ObjectScan/issues/11) 구매 당시 이용 조건과 legacy 누락값 조회 UI|B|0.5|Ready|없음; Owner OWN-06|
|[OS-06](tickets/OS-06.md) [#13](https://github.com/WooSungHyun03/ObjectScan/issues/13) 기존 편집 정보로 원본·버전 비교와 JSON 내보내기|A|1|Ready|없음|
|[OS-07](tickets/OS-07.md) [#14](https://github.com/WooSungHyun03/ObjectScan/issues/14) 기존 sharp 선명도 경고·중복 안내·사진 순서 정리|B|1.5|Ready after Team PR|OS-01; Owner OWN-04|
|[OS-08](tickets/OS-08.md) [#15](https://github.com/WooSungHyun03/ObjectScan/issues/15) 마스크 실패·재선택·이전 단계 복귀의 안내와 접근성|B|1|Ready after Team PR|OS-01|
|[OS-09](tickets/OS-09.md) [#16](https://github.com/WooSungHyun03/ObjectScan/issues/16) 실제 모델에서 만든 썸네일 확인·마켓 카드 표시|A|1|Ready after Team PR|OS-19; Owner OWN-08|
|[OS-10](tickets/OS-10.md) [#17](https://github.com/WooSungHyun03/ObjectScan/issues/17) TEST 결제 응답 유실·중복 복귀의 상태 복구 UI|B|1|Ready after Team PR|OS-01; Owner OWN-03|
|[OS-11](tickets/OS-11.md) [#18](https://github.com/WooSungHyun03/ObjectScan/issues/18) 삭제 확인·중복 클릭 차단·권리 보존 오류 안내|A|0.5|Ready|없음; Owner OWN-07|
|[OS-12](tickets/OS-12.md) [#19](https://github.com/WooSungHyun03/ObjectScan/issues/19) 키·DB 없는 공통 UI fixture 시작점|B|0.5|Ready|없음|
|[OS-17](tickets/OS-17.md) [#24](https://github.com/WooSungHyun03/ObjectScan/issues/24) 외부 GLB 로컬 편집에서 개인 저장·게시로 이어가기|A|1.5|Ready after Team PR|OS-06; Owner OWN-09|
|[OS-18](tickets/OS-18.md) [#25](https://github.com/WooSungHyun03/ObjectScan/issues/25) 마켓 라이선스·가격 필터와 URL 검색 상태|B|0.5|Ready|없음|
|[OS-19](tickets/OS-19.md) [#32](https://github.com/WooSungHyun03/ObjectScan/issues/32) 결과 뷰어 앞·뒤·좌·우 시점과 재맞춤|B|1|Ready|없음|
|[OS-20](tickets/OS-20.md) [#33](https://github.com/WooSungHyun03/ObjectScan/issues/33) 편집 동작 이력·삭제 확인·저장 오류 복구|A|1.5|Ready after Team PR|OS-06|
|[OS-21](tickets/OS-21.md) [#34](https://github.com/WooSungHyun03/ObjectScan/issues/34) 구매 내역의 한국어 상태와 에셋 재다운로드 연결|B|0.5|Ready|없음|
|[OS-22](tickets/OS-22.md) [#35](https://github.com/WooSungHyun03/ObjectScan/issues/35) 팀원 fixture 통합 회귀와 Owner 인계 리포트|B|0.5|Ready after Team PR|OS-01, OS-02, OS-03, OS-04, OS-06, OS-07, OS-08, OS-09, OS-10, OS-11, OS-12, OS-17, OS-18, OS-19, OS-20, OS-21|

## OWNER-LOCAL — 이 컴퓨터 Codex 전용

|ID·Issue|담당|인일|상태|선행·실연동|
|---|---|---|---|---|
|[OS-05](tickets/OS-05.md) [#12](https://github.com/WooSungHyun03/ObjectScan/issues/12) 기존 추론 운영 smoke·취소·오류 안내 확인|OWNER-LOCAL|0.5|로컬준비 가능 / 실연동대기|없음|
|[OWN-01](tickets/OWN-01.md) [#26](https://github.com/WooSungHyun03/ObjectScan/issues/26) SMTP·인증 콜백 연결과 외부 메일 확인|OWNER-LOCAL|0.5|로컬준비 가능 / 실연동대기|OS-02|
|[OWN-02](tickets/OWN-02.md) [#27](https://github.com/WooSungHyun03/ObjectScan/issues/27) 모델·에셋 권리와 TEST 요금·보관 정책 확정|OWNER-LOCAL|0.5|로컬준비 가능 / 실연동대기|없음|
|[OWN-03](tickets/OWN-03.md) [#28](https://github.com/WooSungHyun03/ObjectScan/issues/28) Toss TEST 서버 복귀·webhook·환불 실연동|OWNER-LOCAL|0.5|로컬준비 가능 / 실연동대기|OS-10|
|[OWN-04](tickets/OWN-04.md) [#29](https://github.com/WooSungHyun03/ObjectScan/issues/29) 실행 환경·DB 검증·Preview 배포와 운영 승인|OWNER-LOCAL|1|로컬준비 가능 / 실연동대기|OS-22, OS-05, OWN-01, OWN-02, OWN-03, OWN-06|
|[OWN-05](tickets/OWN-05.md) [#30](https://github.com/WooSungHyun03/ObjectScan/issues/30) be-celeb.org ObjectScan 전환·메일 보존·복구|OWNER-LOCAL|1|로컬준비 가능 / 실연동대기|OWN-04|
|[OWN-06](tickets/OWN-06.md) [#36](https://github.com/WooSungHyun03/ObjectScan/issues/36) 구매 라이선스·버전 불변 snapshot 서버·DB 연동|OWNER-LOCAL|1.5|로컬준비 가능 / 실연동대기|OS-04|
|[OWN-07](tickets/OWN-07.md) [#37](https://github.com/WooSungHyun03/ObjectScan/issues/37) 삭제·보관 hold·storage cleanup 서버 정합성|OWNER-LOCAL|1.5|로컬준비 가능 / 실연동대기|OS-11, OWN-06|
|[OWN-08](tickets/OWN-08.md) [#38](https://github.com/WooSungHyun03/ObjectScan/issues/38) poster 저장·검증·공개 미리보기 API 연결|OWNER-LOCAL|1|로컬준비 가능 / 실연동대기|OS-09|
|[OWN-09](tickets/OWN-09.md) [#39](https://github.com/WooSungHyun03/ObjectScan/issues/39) 외부 GLB private 수입 등록·게시 서버 연결|OWNER-LOCAL|2|로컬준비 가능 / 실연동대기|OS-17, OWN-06|

## 폐기 — 완료 아님

- [OS-13](tickets/OS-13.md) [#20](https://github.com/WooSungHyun03/ObjectScan/issues/20): CLOSED / not planned / model research excluded.
- [OS-14](tickets/OS-14.md) [#21](https://github.com/WooSungHyun03/ObjectScan/issues/21): CLOSED / not planned / model research excluded.
- [OS-15](tickets/OS-15.md) [#22](https://github.com/WooSungHyun03/ObjectScan/issues/22): CLOSED / not planned / model research excluded.
- [OS-16](tickets/OS-16.md) [#23](https://github.com/WooSungHyun03/ObjectScan/issues/23): CLOSED / not planned / model research excluded.

기존 [#2](https://github.com/WooSungHyun03/ObjectScan/issues/2)도모델품질연구제외로종료. [#3](https://github.com/WooSungHyun03/ObjectScan/issues/3)는Team추적,[#4](https://github.com/WooSungHyun03/ObjectScan/issues/4)는Owner-local추적으로갱신. 실제GitHub담당계정은미제공이므로dev-A/dev-B/owner-local라벨을사용하며임의assignee를설정하지않음.
