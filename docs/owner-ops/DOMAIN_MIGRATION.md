# be-celeb.org 전환 실행 결과

2026-11-12 11:20~11:23 KST. 사용자 요청에 따라 **실제 도메인 연결을 ObjectScan으로 이전 완료**했다.

## 원인과 수정

기존 apex는 Vercel `sw-system`에 연결돼 이지마케팅을 제공했다. DNS는 이미 Vercel을 가리켜 **Cloudflare 로그인·DNS 수정 없이 프로젝트 연결만 이전할 수 있었다**. 앞선 Cloudflare 인증 대기 때문에 전체 전환이 막혔다는 판단은 정정한다.

- `be-celeb.org`: `sw-system` → `objectscan` (`domains add ... --force`)
- `www.be-celeb.org`: `objectscan`에 추가, apex로308 redirect 설정
- 기존 `sw-system.vercel.app`, 저장소, DB, 사용자 데이터는 보존했다.
- Cloudflare zone/네임서버/A/AAAA/CNAME/MX/TXT/SPF/DKIM/DMARC는 변경하지 않았다.

## 실제 검증

- Vercel `domains verify` apex/www 모두 `configured-correctly`, verified=true.
- HTTPS apex HTTP200, title `ObjectScan | 사진으로 시작하는 3D 제작`; EasyMarketing 문자열 없음.
- 실제 브라우저에서 ObjectScan 랜딩 확인. www 입력 후 주소가 `https://be-celeb.org/`로 이동함을 확인.
- www의 `/login?domain-check=1`은308, `Location: https://be-celeb.org/login?domain-check=1`로 경로·query 보존.
- `/login` HTTP200, `/api/health` 정상 응답.
- 이 작업은 **기존 ObjectScan Production 배포의 도메인 이전**이다. 새 main 빌드를 배포하거나 GPU/결제를 새로 활성화하지 않았다. 현재 공개 health의 real_gpu_validated=false/payments_mode=disabled는 기존 Production 설정이다. 외부 회원가입 메일·새 PG/GPU 전체 흐름은 별도 미완료 게이트로 유지한다.

## 비공개 백업·복구

`artifacts/owner-ops/domain-sw-before.json`, `domain-objectscan-before.json`, `dns-before-cutover.txt`에 변경 전 연결 및 공개 DNS를 보존했다. `domains-after.json`, `domain-www-after.json`, `be-celeb-objectscan.png`에 결과를 남겼다. 비밀 값은 Git에 넣지 않는다.

도메인만 복구해야 한다면 소유 팀/프로젝트와 백업을 재확인하고 `npx --yes vercel@59.25.4 domains add be-celeb.org sw-system --force --scope sunghyuns-projects-da008879`로 이전 연결을 복원한다. www는 이번에 새로 추가했으므로 복구 시 백업의 부재 상태를 확인한 뒤 해당 프로젝트 연결만 제거한다. 도메인 소유권·등록 자체를 삭제하는 `domains rm`이나 기존 DB 삭제는 사용하지 않는다.

참고: [Vercel 프로젝트 도메인 redirect API](https://vercel.com/docs/rest-api/projects/update-a-project-domain).
