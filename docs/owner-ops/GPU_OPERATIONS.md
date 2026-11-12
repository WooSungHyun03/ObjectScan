# GPU Worker 운영

실제 user unit에 drain 및 graceful signal 처리를 적용했다. 대기/실행 상태를 work-root의 비밀 없는 worker-state.json에 기록한다. drain.request 존재 시 새 job을 claim하지 않는다. 중지 명령은 동일 MainPID의 fresh drained 상태를 확인한 뒤 systemctl --user stop을 실행한다. 실행 중인 job은 완료까지 기다리며 timeout이면 강제 종료하지 않는다.

SIGTERM/SIGINT는 프로세스 종료 후 서버 failure/fenced finalization을 요청한다. 기존 취소 상태·환급·lease 검증을 재사용한다. 단절/lease 상실에서는 임의 슬롯 해제나 중복 환급을 하지 않는다. KillMode=mixed, TimeoutStopSec=60으로 주 프로세스가 자식 그룹을 정리할 시간을 보장한다.

실제 idle/queued0 확인 후 unit을 백업하고 코드 적용을 위한 1회 재기동을 수행했다. 이후 관리 도구 stop/start/restart를 실제 실행했다. Python32개 통과(기존26+drain/idle stop2+관리 CLI 안전 경계4). 실제 새 모델 추론은 아직 검증 대기이며 과거 성공과 구분한다. source/checkpoint/정밀도/지원모드는 변경하지 않았다.

복구: idle 확인 후 artifacts/owner-ops/worker-unit-before.service 및 worker-before.env(비공개)를 복원, user daemon-reload/start. 코드 rollback도 idle 상태에서 수행한다. 다른 Node/Python/GPU 프로세스는 종료하지 않는다.
