# 통합·권한·완료 게이트

## 브랜치와 공통 fixture
최신코드포함 `docs/product-delivery-v6`에서기준SHA고정→팀공유devbranch→`ticket/os-xx`→상대리뷰→직렬merge. main에직접push/기존stack강제rebase없음. 기존AGENTS Track A/B/C는이번V6배분에적용하지않으며Team은모두제품slice담당이다. 

B의첫Ready **OS-12 .5일**:서버·키·DB없는test-onlyReact/Vite entry/nextnav adapter·공통fixture interface·2개상태smoke를제공한다. A는OS-01view-model/unit을즉시시작하고fixture가나오면browser검증. Next protectedSSR을APIintercept만으로부팅할수있다고가정하지않는다. 각feature가자기fixture를추가하고OS-22 .5일은마지막8과업·세viewport·리포트만통합. 

## 충돌 파일과 순서
- api.ts/server/shared핵심schema/migrations/GPU/env는Team쓰기금지. 새계약은feature adapter/fixture로정의하고Owner가server·SQL적용. 
- generation-checkout:OS-01(A)→OS-03(A)후OS-10(B)는payment-result/checkoutUI중심. 필요공통변경은helperPR선행. 
- reconstruction-wizard:OS-01(A)후OS-07(B)→OS-08(B)직렬. 
- model-viewer:OS-19(B)후OS-09(A)capture확인. 새renderer기능없음. 
- editor:OS-06(A)→OS-17(A)→OS-20(A)직렬. 동일파일동시대수정없음. 
- account-panels:OS-04(B)후OS-21(B);OS-11(A)는asset-library삭제UI helper로분리. 
- contracts export는OS-22직렬통합. OwnerSQL파일번호는Owner만예약/검증. 

## 의존성·버퍼
Team15.5인일/20,22.5%버퍼(A2.5/B2). WIP1,최대2(리뷰대기). D1공통fixture,D3preset,D4poster/진단,D5~7import/편집/결제,D8마감,D9통합,D10새기능금지. Owner대기로Team이2일이상쉬지않게mock개발과실연동을분리한다. 

## 세 가지 완료
1. **TEAM_PASS**:키없는unit/component/APIfixture/360·768·1440/axe/GLBroundtrip과PR리뷰. 
2. **OWNER_INTEGRATION_PASS**:실계정auth·RLS·DBsnapshot·storage·기존GPU1slot·실TEST/환불/타인다운로드거부확인. 원격변경은승인후만. 
3. **SERVICE_RELEASED**:정확SHA Preview검증과운영실행확인후도메인교체·메일보존·rollback검증. 위두단계만으로배포완료라부르지않음. 

매일feature관련unit/type/lint와fixturebrowser. Owner가DB포함full60/Worker26/browser9회귀를수행하며Team에서비스키를넘기지않는다. build/CI/deploy secrets는Owner인계,Team은코드예제/검증리포트만. P0미완이면P1의클라우드연동은flagoff로두고모델연구/P2로시간을채우지않는다. 
