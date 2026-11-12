# 도메인 이전

2026-11-12 Owner-local 체크포인트.

be-celeb.org 교체는 사용자 승인 완료다. Vercel CLI inspect에서 현재 sw-system 연결을 확인했다. Cloudflare DNS 관리이며 사용자 로그인·2FA를 기다리고 있다. 현재 기존 사이트를 유지했고 DNS/alias 변경은 아직 없다. 로그인 후 전체 zone(메일·서브도메인 포함)과 Vercel alias/project/deployment를 비공개 백업하고 검증된 ObjectScan Preview에 웹 라우팅만 옮긴다. 실제 expected DNS 값을 조회하며 일반 IP를 가정하지 않는다. 실패 시 백업한 apex/www 레코드·proxy/TTL·이전 sw-system alias로 복원하고 HTTPS/메일 레코드 불변을 확인한다. 기존 프로젝트·DB·메일은 삭제하지 않는다.
