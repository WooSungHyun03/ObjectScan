# Owner 전용 작업
외부인증·키·계정설정·운영정책·DNS·실배포는모두본인전용이다. A/B는env.example·mock·검증체크리스트까지만. 키는Issue/채팅/Git에기록하지않는다. 공수는개발15인일에산입하지않으며현재미완료다.

|ID|Owner 수행|개발 선행|검증/차단|
|---|---|---|---|
|[OWN-01](tickets/OWN-01.md)|외부 가입 SMTP·콜백 설정과 실제 신규 사용자 확인|OS-02|메일 발송 계정/도메인 인증·Supabase 설정을 본인이 수행. 정상·만료·복구 링크를 새 이메일로 확인. 외부 가입 성공 증거 전 공개 모집 보류.|
|[OWN-02](tickets/OWN-02.md)|모델·체크포인트·판매 권리 및 가격 정책 승인|OS-04, OS-05|Pixal 체크포인트/전이 의존성과 OAL/GW 비상업 제한 검토. 학교 프로젝트라는 이유로 상업 권리를 추정하지 않음. 크레딧 가격·수수료·보관 정책 승인; 미승인 시 paid package 비활성 유지.|
|[OWN-03](tickets/OWN-03.md)|Toss TEST 실제 인증·복귀·webhook 전달 재검증|OS-10|기존 TEST 키는 본인만 관리. 서울 Preview에서 새 실제 TEST 인증→자동복귀→provider 재조회→환불 확인; SSO 보호와 webhook 경로 충돌 확인. 실결제와 실제 송금은 제외.|
|[OWN-04](tickets/OWN-04.md)|Preview 구성·최종 배포 승인 및 운영 권한|OS-12|본인 계정으로 Supabase/Vercel/Worker 설정·비밀 키·모니터링 확인. 정확한 SHA Preview에서 GPU end-to-end와 롤백 검증 후 별도 운영 승인. 개발자는 로컬 mock·설정 예제만 전달.|
|[OWN-05](tickets/OWN-05.md)|be-celeb.org 기존 서비스 충돌 결정과 DNS|OWN-04|기존 BE CELEB 서비스가 존재하므로 소유자 승인·이전 계획·기존 DNS/MX 보존·롤백 시점을 본인이 결정. 승인 전 DNS·alias 수정 금지. 별도 Preview를 사용.|

OWN-01/02는D1부터병행,OWN-03은OS-10후,OWN-04는OS-12후;OWN-05는OWN-04와기존도메인소유자의명시승인후다. 이감사에서는외부설정·실과금·DNS·배포변경을수행하지않았다. 테스트키등록과과거인증완료는새로운자동복귀/정책승인을대체하지않는다.
