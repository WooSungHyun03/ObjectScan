# ObjectScan 서버 운영

저장소 루트에서 실행한다. 실제 Worker는 user systemd 서비스다. Vercel 공개 사이트는 systemd가 아니다.

```bash
./scripts/objectscanctl status
./scripts/objectscanctl doctor
./scripts/objectscanctl start worker
./scripts/objectscanctl stop worker --timeout 60
./scripts/objectscanctl restart worker --timeout 60
./scripts/objectscanctl logs worker
./scripts/objectscanctl enable worker
./scripts/objectscanctl disable worker
./scripts/objectscanctl start web
./scripts/objectscanctl stop web
```

위 status/worker start-stop-restart/web start-stop은 실제 실행 검증했다. autostart는 현재 enabled+Linger=yes를 확인했으며 disable은 운영 방침을 바꾸므로 검증을 위해 끄지 않았다. root sudo는 필요 없다.

기본 start/stop/restart의 all은 Worker와 이 도구가 만든 web만 관리한다. 기존 QA3010은 unmanaged로 보존한다. 관리 web은127.0.0.1:3000, PID/로그는 ~/.local/state/objectscan. PID의cwd/명령/root를 검증한 뒤 전용 process group만 종료한다.

DB는 별도 명시적 대상이다: `start db`, `stop db`. 저장소의 supabase/config.toml만 사용하고 reset/no-backup을 제공하지 않는다. 기존 DB는 테스트를 위해 중지하지 않았다. 이 두 명령은 코드 경로만 구현돼 있으며 실제 start/stop 회귀는 아직 미실행이다. 다른 Docker 프로젝트에 대한 global stop은 없다.

public 대상 start/stop은 명시적으로 거부한다. Worker 종료는 공개 웹 점검 모드가 아니다. 공개 점검 모드는 별도 서버 계약 검증 후 제공해야 하며 현재 도구로 지원한다고 주장하지 않는다.

중지 timeout은 drain 요청을 유지하며 강제 종료하지 않는다. 상태를 확인하고 재시도하거나 `start worker`로 drain을 해제한다. SIGKILL/pkill/killall/nvidia 전체프로세스 종료는 사용하지 않는다.
