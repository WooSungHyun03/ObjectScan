# Owner-local Codex 실행 큐
**모든AI환경/키/DB설정·migration/PG/배포/Cloudflare/운영관리자는Owner컴퓨터Codex전용이다.** Team은각featureUI/typedmock만. Owner10개추정합10인일,외부대기추가;Team15.5인일에포함하지않는다. 추정일수는Owner가손으로코딩할일정이아니며이컴퓨터Codex수행량이다.

## 이번 실제 자동 수행
- 전용 `owner-local-preflight.mjs` 작성·syntax검사·실행:키는변수존재boolean만,21개migration파일/로컬서비스/GPU/Workerinactive/공개서비스/보호Preview확인.
- 기존Node/DB60,Worker26,TypeScript,lint(0error/8warning),browser9회귀실행.
- `owner-local-connections.spec.ts` 및전용config작성·실행:실제로컬로그인+게시/검색/신고/주문/PGcallback/download/delete **mock**연결1개통과. 외부PG/새GPU실행없음.
- Team기능구현,Worker재기동,운영DBmigration,DNS/alias/배포는수행하지않음. V6는로컬안전검사까지허용하며실운영변경은별도확인을요구한다.

|순서|작업|Codex로컬자동수행|사용자필수한단계|개발의존|
|---|---|---|---|---|
|1|[OS-05 기존 추론 운영 smoke·취소·오류 안내 확인](tickets/OS-05.md)|티켓의read-only→fixture→backup/diff→실연동체크|티켓에명시한인증또는실운영반영확인|없음|
|2|[OWN-01 SMTP·인증 콜백 연결과 외부 메일 확인](tickets/OWN-01.md)|티켓의read-only→fixture→backup/diff→실연동체크|티켓에명시한인증또는실운영반영확인|OS-02|
|3|[OWN-02 모델·에셋 권리와 TEST 요금·보관 정책 확정](tickets/OWN-02.md)|티켓의read-only→fixture→backup/diff→실연동체크|티켓에명시한인증또는실운영반영확인|없음|
|4|[OWN-03 Toss TEST 서버 복귀·webhook·환불 실연동](tickets/OWN-03.md)|티켓의read-only→fixture→backup/diff→실연동체크|티켓에명시한인증또는실운영반영확인|OS-10|
|5|[OWN-04 실행 환경·DB 검증·Preview 배포와 운영 승인](tickets/OWN-04.md)|티켓의read-only→fixture→backup/diff→실연동체크|티켓에명시한인증또는실운영반영확인|OS-22|
|6|[OWN-05 be-celeb.org ObjectScan 전환·메일 보존·복구](tickets/OWN-05.md)|티켓의read-only→fixture→backup/diff→실연동체크|외부로그인/2FA·실제전환시각실행확인|없음|
|7|[OWN-06 구매 라이선스·버전 불변 snapshot 서버·DB 연동](tickets/OWN-06.md)|티켓의read-only→fixture→backup/diff→실연동체크|티켓에명시한인증또는실운영반영확인|OS-04|
|8|[OWN-07 삭제·보관 hold·storage cleanup 서버 정합성](tickets/OWN-07.md)|티켓의read-only→fixture→backup/diff→실연동체크|티켓에명시한인증또는실운영반영확인|OS-11, OWN-06|
|9|[OWN-08 poster 저장·검증·공개 미리보기 API 연결](tickets/OWN-08.md)|티켓의read-only→fixture→backup/diff→실연동체크|티켓에명시한인증또는실운영반영확인|OS-09|
|10|[OWN-09 외부 GLB private 수입 등록·게시 서버 연결](tickets/OWN-09.md)|티켓의read-only→fixture→backup/diff→실연동체크|티켓에명시한인증또는실운영반영확인|OS-17, OWN-06|

## 실행 순서와 우선순위
**지금안전진단→OWN-01/02정책·메일/OS-05기존운영상태→OWN-06권리snapshot→OWN-03TEST실인증→OWN-04정확SHA Preview→OWN-05도메인전환**. OS-05는현재환경read-only진단을먼저실행하고실추론은대상확인후수행한다. OWN-07/08/09는각P1실연동시별도순차추진한다. 이들이미완이면해당UI는연동대기로남긴다.

운영의존DAG는Team→Owner실연동→릴리스게이트이다. TeamOS-04/09/11/17이Owner를기다리는것은**서비스통합**대기이며UI/mock착수/완료의선행이아니므로순환이없다. 실제운영릴리스는Owner연동테스트를추가통과해야한다.

## 도메인 전환 절차 (결정 완료)
1. private600경로에현재Cloudflarezone의apex/www관련A/AAAA/CNAME·TTL·proxied·redirect·CAA·MX/TXT·Vercelalias/project/deploymentID를백업한다. 토큰을기록하지않는다.
2. ObjectScan의검증된Preview·SSL·canonical·www정책,authredirect/Toss반환URL/CSP/CORS를현재플랫폼문서와실제inspect값으로확정한다. Vercel권장DNS값을추측하지않는다.
3. 웹라우팅만변경할diff/실행시각/복구명령을준비하고마지막실행확인. 메일MX/SPF/DKIM/DMARC·기존DB·기존서비스자산은수정하지않는다.
4. 적용후HTTPS/apex/www리다이렉트/가입복구/upload/GLB/TESTcallback/구매권한을검증. 실패시백업한웹레코드와기존alias로복구하고전파상태를확인한다.
5. 교체완료후에도무관한기존서비스데이터/메일/배포아카이브를삭제하지않는다.

실제키/backup원문은Git/Issue첨부금지. 필요한인증이아직발생하지않았으므로이번보고에서새키/로그인을다시요청하지않는다.

## 추가로 수행한 DNS 준비
`node docs/product-audit-v2/owner-local-domain-inventory.mjs`로공개A/AAAA/CNAME/MX/TXT/CAA/NS를읽기전용스냅샷했다. 이는Cloudflare전체zone backup이아니며recordID/proxy/redirect/alias권한정보는미확인이다. [공식Vercel Domains](https://vercel.com/docs/cli/domains)와domains스킬의기존도메인진단원칙을따라실제expected레코드를조회한뒤변경해야하며보편A/CNAME을하드코딩하지않는다. `vercel domains inspect be-celeb.org --scope <확인된팀>`는향후Owner인증후read-only확인명령이다. 실제mutation명령은대상프로젝트와backup/diff를확정한뒤작성한다.
