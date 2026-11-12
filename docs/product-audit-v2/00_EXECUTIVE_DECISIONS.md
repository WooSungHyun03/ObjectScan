# V6 제품 전달 재감사 — 2026-11-12 KST

**새로운 AI 연구는 전부 제외하고, 기존 모델·기능을 사용하는 제품 개선만 배정한다.** Team17개 15.5인일(A7.5/B8), 통합·문제 해결 버퍼4.5인일(22.5%)이다. Owner-local10개는 별도10인일 추정이며 외부 대기 시간은 추가다. 이 합계를 숨기고 전체 공개 서비스가 두주 안에 무조건 완성된다고 약속하지 않는다.

1. 실제 repo는 `ObjectScan-v2`, 검토HEAD `e411f87`, 앱 소스 `debc1f7`. main `a67a0c1`은 최신앱이 아니다. 새 작업 branch `docs/product-delivery-v6`는 기존감사 branch에서 분기했다. 기존 제품코드와 v1 문서는 보존했다.
2. 현재 웹3010은 실행 중이지만 Worker systemd는 **inactive/dead, ExecMainStatus0**. 과거 실제SV 성공 기록을 현재 실행 가능 판정으로 재사용하지 않는다. 설정 변경/재시작/모델실행은 OS-05 Owner-local 게이트다. 이번 새실GPU추론은 하지 않았다.
3. OS-13/14/15 모델품질연구와 OS-16 face-crop알고리즘 연구는 폐기(not planned). 단순히 이름을 제품기능으로 바꾸어 남기지 않는다. 기존 MV/OAL/GW 제한은 알려진 제약으로만 남긴다.
4. 기존 viewer 스크린샷/조명/배경/reset, mask revision gate, editor undo/dirty이탈확인, marketplace 신고, 프로젝트 검색, 구매·환불권한을 중복 구현하지 않는다. 세부 신규 가치는 아래 티켓으로 한정한다.
5. Team은 키·실계정·GPU·DB설정/migration·민감관리자·PG·DNS·배포에 접근하지 않는다. OS-04/09/11/17은 Team UI/mock과 Owner schema/server 연결을 분리. Service완료는 두쪽검증 후만 가능하다.
6. `be-celeb.org`는 ObjectScan으로 **교체 결정 완료**. OWN-05는 사용여부 결정이 아닌 backup→preview검증→web라우팅전환→메일보존→rollback 실행작업이다. 이번엔 운영DNS/alias/데이터를 변경하지 않았다.
7. V6 첫 착수는 **A OS-01**, **B OS-12**. B가 첫날0.5인일에 키없는 fixture entry를 제공하고 각티켓이 이를 확장한다. OS-22는 마지막 통합 리포트만 담당한다.

## 반드시 해결할 P0 묶음
- 가용범위/작업상태: OS-01/03 + Owner OS-05.
- 가입 확인·복구: OS-02 + OWN-01.
- 구매조건 불변성: OS-04 + OWN-06.
- TEST 결제 복귀·중복·권한: OS-10 + OWN-03.
- 기준SHA·키없는회귀·실연동 인계: OS-12/22 + OWN-04.

이번 산출물은 감사·티켓 재구성과 허용된 Owner-local 진단/검증 스크립트다. Team의 제품 기능 구현은 시작하지 않았다. 과거13개라벨research를그대로유지하거나전체를완료로닫지않는다.
