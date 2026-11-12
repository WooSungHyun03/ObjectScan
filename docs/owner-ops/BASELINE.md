# Owner-local 운영 기준

2026-11-12 KST. 실제 요청 원문은 로컬 첨부의 Owner-Local Operations & Production Launch이다. 이 작업은 티켓 작성이 아닌 실제 구현/운영 검증이다.

- repo: `/home/m4ml/Desktop/ObjectScan/ObjectScan-v2`, 시작 SHA `123b0be`, 작업 branch `feat/owner-local-operations`. 시작 시 미커밋 변경 없음.
- 실제 Worker는 `systemctl --user`의 `objectscan-worker.service`. 시스템 범위에는 같은 unit이 없다. 이전 v6 감사의 inactive 기록은 **잘못된 scope 조회**이며 현재상태로 사용할 수 없다.
- 실제 사용자 unit: `~/.config/systemd/user/objectscan-worker.service`; 환경 `~/.config/objectscan/worker.env`(600), enabled, Linger=yes.
- Worker는 protected v5 Preview를 poll한다. 실제 hosted heartbeat/slot 확인: online, idle, SAM2 + 단일 이미지 검증 모델만. 기존 checkpoint/adapter/추론 파라미터 변경 없음.
- 공개 objectscan-six.vercel.app은 구버전. be-celeb.org는 기존 sw-system에 연결. 교체는 승인됐으며 데이터/메일 레코드 보존 후 웹 연결만 변경한다.
- Vercel MCP 계정 조회는 ObjectScan을 못 찾았지만 기존 인증된 CLI는 정확한 team/project를 조회했다. `npx --yes vercel@59.25.4` 사용.
- 로컬 QA3010 PID1345517은 기존 프로세스이므로 임의 종료하지 않는다. ObjectScan 관리 도구가 새로 만든3000 서버만 별도 PID/프로세스 그룹으로 관리한다.
- Cloudflare 내장 브라우저 로그인 대기. 서비스 인증 값은 문서/Git에 기록하지 않는다.

후속2026-11-12: apex/www의 Vercel 프로젝트 연결을 ObjectScan으로 이전했다. 앞선 Cloudflare 로그인 대기 기록은 전환 전 상태다. DOMAIN_MIGRATION.md의 실제 실행 결과가 우선한다.
