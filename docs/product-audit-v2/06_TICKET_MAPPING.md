# 기존23개 전수 재심사
v1원문은 docs/product-audit 에그대로보존한다. 실행권위는v2다. 수정된Issue본문에서v1원문링크와변경이유를유지하며삭제하지않는다. 닫는이슈는완료가아니라**not planned**다.

|기존ID·Issue|조치|근거·새 대응|
|---|---|---|
|[OS-01](https://github.com/WooSungHyun03/ObjectScan/issues/8)|keep|지원/오류UI만간결화|
|[OS-02](https://github.com/WooSungHyun03/ObjectScan/issues/9)|split|Team복구UI와OWN-01메일설정분리|
|[OS-03](https://github.com/WooSungHyun03/ObjectScan/issues/10)|update|poll예외복구·기존API와clientkey유지,Worker/정산수정제외|
|[OS-04](https://github.com/WooSungHyun03/ObjectScan/issues/11)|split|Team조회fixture .5d;DB불변snapshot은OWN-06|
|[OS-05](https://github.com/WooSungHyun03/ObjectScan/issues/12)|owner-local|3샘플품질/메모리실험폐기,기존추론운영smoke만|
|[OS-06](https://github.com/WooSungHyun03/ObjectScan/issues/13)|update|기본정보이미있음;한canvas버전비교·JSON만|
|[OS-07](https://github.com/WooSungHyun03/ObjectScan/issues/14)|update|CPUadvisory+upload전로컬순서,서버schema없음|
|[OS-08](https://github.com/WooSungHyun03/ObjectScan/issues/15)|update|revisiongate이미있음;UI복구/접근성만|
|[OS-09](https://github.com/WooSungHyun03/ObjectScan/issues/16)|split|capture이미있음;posterUI와OWN-08storage연동분리|
|[OS-10](https://github.com/WooSungHyun03/ObjectScan/issues/17)|split|UI/mock만Team;PG설정/실인증OWN-03|
|[OS-11](https://github.com/WooSungHyun03/ObjectScan/issues/18)|split|기존에셋삭제busy/오류UI;DB/storage정합성OWN-07|
|[OS-12](https://github.com/WooSungHyun03/ObjectScan/issues/19)|split|첫날키없는fixture .5d와OS-22최종회귀 .5d분리|
|[OS-13](https://github.com/WooSungHyun03/ObjectScan/issues/20)|obsolete|모델품질/VRAM연구제외|
|[OS-14](https://github.com/WooSungHyun03/ObjectScan/issues/21)|obsolete|21+품질실험제외|
|[OS-15](https://github.com/WooSungHyun03/ObjectScan/issues/22)|obsolete|새GS/scene품질실험제외|
|[OS-16](https://github.com/WooSungHyun03/ObjectScan/issues/23)|obsolete|facecrop자체알고리즘연구제외;기존편집OS-20만|
|[OS-17](https://github.com/WooSungHyun03/ObjectScan/issues/24)|split|P1실기능UI승격;서버등록DB는OWN-09|
|[OS-18](https://github.com/WooSungHyun03/ObjectScan/issues/25)|split|신고이미있음;filter .5d와주문내역OS-21 .5d분리|
|[OWN-01](https://github.com/WooSungHyun03/ObjectScan/issues/26)|update / OWNER-LOCAL|Codex로컬자동절차와본인인증/승인한단계분리|
|[OWN-02](https://github.com/WooSungHyun03/ObjectScan/issues/27)|update / OWNER-LOCAL|Codex로컬자동절차와본인인증/승인한단계분리|
|[OWN-03](https://github.com/WooSungHyun03/ObjectScan/issues/28)|update / OWNER-LOCAL|Codex로컬자동절차와본인인증/승인한단계분리|
|[OWN-04](https://github.com/WooSungHyun03/ObjectScan/issues/29)|update / OWNER-LOCAL|Codex로컬자동절차와본인인증/승인한단계분리|
|[OWN-05](https://github.com/WooSungHyun03/ObjectScan/issues/30)|update / OWNER-LOCAL|도메인교체결정완료.실제전환·메일보존·rollback으로교체|

신규제품은OS-19(방향preset),OS-20(동작이력/삭제확인),OS-21(구매내역연결),OS-22(최종통합)뿐. 신규Owner는OWN-06(snapshot),07(cleanup),08(poster),09(import서버)다. 기존Issue번호를재활용하고분할후속만신규등록한다. OS-13~16과상위모델연구#2는obsolete사유로not planned종료. #3는고정Track A명칭을제거한제품전달epic,#4는Owner-local연동epic으로갱신한다.

keep1/update4/split8/owner-local1/obsolete4 + 기존OWN update5 = **기존23개전부매핑**. 새티켓8개가추가되어총31개(Team17/Owner10/obsolete4)이며폐기된연구는미래일감에남지않는다.
