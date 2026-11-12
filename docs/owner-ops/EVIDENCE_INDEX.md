# 실행 증거 — 2026-11-12

| 검증                                                                                  | 이번 결과                           | 한계                                                                              |
| ------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| `npm test`                                                                            | 60 passed, 1 skipped                | localhost DB만 사용. 구매 snapshot 불변 assertion 포함. 선택 GPU 파일 테스트 skip |
| `gpu-worker/.venv/bin/python -m pytest gpu-worker/tests -q`                           | 32 passed                           | 28 Worker + 4 CLI 경계. 실제 inference 아님                                       |
| `npm run typecheck`                                                                   | exit0                               | 정적 타입                                                                         |
| `npm run lint`                                                                        | exit0, 0 errors/8 existing warnings | img 경고 등 기존 항목                                                             |
| `OBJECTSCAN_DIST_DIR=.next-owner-check npm run build`                                 | exit0                               | 운영 배포 아님. 기존 QA 빌드 보존                                                 |
| `npx playwright test --config docs/product-audit-v2/owner-local-playwright.config.ts` | 1 passed                            | 실제 로컬 login + MOCK 게시/구매/provider/download/delete. 외부 PG/GPU 미실행     |
| `python3 docs/product-audit-v2/validate-plan.py`                                      | PASS                                | 31 ID/Issue,17TEAM+10OWNER+4폐기, A7.5/B8, 버퍼22.5%, DAG/AC/프롬프트             |
| `python3 -m py_compile scripts/objectscanctl scripts/objectscan-web-launch.py`        | exit0                               | 문법                                                                              |
| `git diff --check`                                                                    | exit0                               | 공백 오류 없음                                                                    |
| Worker stop/start/restart; managed web start/stop                                     | 실행 확인                           | idle drain 기준. 다른 서버 보존                                                   |
| hosted DB schema/data dump                                                            | 각 exit0                            | Storage blob 자체 백업 아님. 운영 migration 미적용                                |

원시 로그는 gitignored `artifacts/owner-ops/`에 비공개 저장한다. 백업·환경 파일·키를 Git이나 Issue에 첨부하지 않는다. 초기 lint는 격리 build 출력 디렉터리를 스캔해 실패했으나 `.next-*`를 Git/ESLint 제외 대상으로 추가한 뒤 재검증해 위 결과를 얻었다. 초기 단위테스트 오류는 수정 후 재실행했다.

## 코드·서비스 복구

코드 롤백은 이 체크포인트 commit의 `git revert`로 검토하고 검증 후 push한다. 강제 reset/force push는 하지 않는다. Worker는 drain으로 idle 확인 후 기존 private backup unit/env를 복원하고 `systemctl --user daemon-reload` 및 `restart`한다. `.env` 원문을 출력하지 않는다. migration22는 hosted 미적용이므로 운영 DB 복구가 필요 없다. 이미 로컬 적용한 추가 컬럼/trigger는 데이터 보존한 상태로 둔다. 향후 hosted 반영 후에는 down/drop보다 검증된 forward fix를 우선한다. DNS/alias는 이번 회차 변경하지 않았다.
