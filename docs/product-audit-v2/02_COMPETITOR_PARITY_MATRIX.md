# 사용자 과업 경쟁 비교
확인일 **2026-11-12 KST**. 공식문서기능은성공품질실측과다르다. 브라우저는익명공개화면만직접방문했다. 유료생성·가입개인정보·카드결제·리뷰작성없음. 가격은이번스프린트구현결정에필요한플랜경계만사용하며고정원화비용을발명하지않는다.

**이전감사정정:** 이번CLI Chromium에서Meshy `/ko`,Tripo `/ko` 모두200과한국어UI를직접확인했다. 과거Tripo403은현재접근차단으로재사용하지않는다. 한국어지원자체는독점차별점이아니다. 전체로그인앱의번역품질은미확인.

|사용자 과업|경쟁사 실제 확인·제한·근거|ObjectScan|UX 손실·구현 결정|기술/공수·권한|
|---|---|---|---|---|
|15초기능이해·첫입력|Meshy/Tripo한국어landing+사진입력CTA직접확인[1,3],workspace익명예시직접확인|있음:한국어mascot/익명선택;지원안내늦음|OS-01가용범위먼저,속도보장금지|기존health/quote UI .5d Team|
|가입/메일대기복구|Meshy계정/크레딧공식순서[2];실제인증복구미사용|로컬확인/복구있음,외부미검증|OS-02 fixture,OWN-01메일연동|UI1d/Owner설정|
|사진upload/선택/촬영안내|KIRI auto-mask·사진선택FAQ[5],Polycamcaptureguide[4] 공식|정규화/SHA중복·제외있음;품질사전경고부분|OS-07advisory·키보드순서,coverage점수금지|sharp.stats순수helper/UI1.5dTeam,연결OWN-04|
|여러각도/공간|MeshyMV유료·최대추가3장[7];Polycamdevice/mode조건[4];KIRI photo/GS플랜[6]|2~20/21+/scene미자격|추가모델연구없이지원불가안내|OS-01;연구일감없음|
|작업이탈/재시도/환급|Meshyworkflow[2],Tripo history/retry플랜차이[3];실제실패복구미사용|서버lease/환급있음,poll예외중단위험|OS-03기존job재연결|fetch/타이머1.5d Team|
|대상mask·이전단계|KIRI auto-mask[5],RealityScan촬영feedback/mask[9] 공식|점/박스·검토/revision있음|OS-08복구·focus만,brush/AI개선없음|기존API1d Team|
|모델회전/방향/PNG|Fab viewerInspector[8]공식,Meshyworkspace실물예시직접|orbit/fit초기/PNG/조명/배경있음;방향preset없음|OS-19카메라축방향·맞춤|Drei1d Team|
|편집→undo→저장|Tripo편집/이력플랜[3],Polycamedit/share[4]공식|변환/node삭제/simplify/undo/dirty/버전있음|OS-20동작목록·삭제확인,OS-06버전비교|기존ops1.5d+1d Team|
|외부GLB활용|Tripo자산/편집toolkit[3]공식;모든플랜수입보장미확인|로컬import/edit/export있음;개인등록없음|OS-17클라이언트bridge/OWN-09서버분리|1.5dTeam,2dOwner|
|export/정보/재다운로드|KIRI다형식플랜[6],Fabformatviewer[8]|GLB/기본정보있음,다형식없음|OS-06/21우선;OBJ/STL은후속사용가치검증|기존GLB,추가변환알고리즘없음|
|시장검색/필터/썸네일|Fabmedia/formatlicensefilter[8]공식;비교4사gallery≠유료개인판매입증|category/title/sort·신고있음;일반icon|OS-18필터.5d,OS-09poster1d|Team;posterstorageOWN-08|
|게시·가격·권리|Fablicense별상품과거래[8],실제판매미사용|게시초안/검토·license·TESTprice있음|OS-04snapshot조회,OWN-06immutableDB|.5dTeam/1.5dOwner|
|주문/크레딧·환불|Meshy가격/credits[10],Tripo무료/유료/기간조건[3]|TEST구매환불사례·UI있음;raw상태|OS-10복귀1d,OS-21내역.5d|Teammock;PG OWN-03|
|모바일/키보드|4사공개360/768/1440직접화면;전체앱a11y미측정|9기존browser회귀pass|기존dark유지,기능별세viewport검증|OS-12/22각.5d|
|보관/개인정보|Tripo무료history제한/Pro7day/Max영구[3];전면계정삭제미검증|budget/pendingcleanup/삭제검토있음|Team OS-11오류안내;정책/cleanupOwner|.5dTeam/1.5dOwner|

## 공식 출처 (확인/유료/미확인 구분)
1. [Meshy 공개서비스](https://www.meshy.ai/ko) / [workspace](https://www.meshy.ai/ko/workspace) — 직접공개UI,생성미실행. 
2. [Meshy 첫작업 안내](https://docs.meshy.ai/en/webapp/getting-started) — 공식,Generate→결과→후처리→다운로드;일부기능유료. 
3. [Tripo 가격·도구·history](https://www.tripo3d.ai/pricing) — 공식;Free200monthly/publicnoncommercial,Pro연간결제환산$20월($240년),advancedtoolkit유료. [한국어landing](https://www.tripo3d.ai/ko)은직접200;Studio로그인후기능미사용. 
4. [Polycam 시작·library·edit/share](https://learn.poly.cam/hc/en-us/articles/39279656782996-Getting-Started-with-Polycam) — 공식;mode/device/plan별,모바일실기기미사용. [공개페이지](https://poly.cam/)직접200. 
5. [KIRI 객체mask·촬영FAQ](https://www.kiriengine.app/faq/photo-scan-framing-requirements) — 공식;자동mask권장,실제마스크품질미측정. 
6. [KIRI features](https://www.kiriengine.app/features) / [가격](https://www.kiriengine.app/pricing) — 공식;Basic150사진2GB,advanced500/GS300사진5GB등기능별제한. 고급PBR/quad등을기본무료로해석하지않음. [공개화면](https://www.kiriengine.app/)직접200. 
7. [Meshy MV 조건](https://help.meshy.ai/en/articles/12634481-how-to-use-multi-view) — 공식,Pro이상·지원버전제한,SmartTopology병용불가. 
8. [Fab viewer/검색/market](https://www.fab.com/o/about) — 공식추가benchmark,생성경쟁사가아닌거래·자산탐색과업비교,실제구매미사용. 
9. [RealityScan mobile](https://www.realityscan.com/mobile) — 공식추가benchmark,촬영/목록/내보내기.모바일이므로웹동등성가정금지. 
10. [Meshy 가격](https://www.meshy.ai/pricing) — 공식,Free100credits,플랜/모델/지역통화차이;고정생성단가비교안함. 

주요경쟁사한국어가있어도ObjectScan은고객에게내부모델선택을요구하지않는**과업일관성**을가설로검증한다. 생성속도/정확도/판매성과/전환율우위는실측없음. 
