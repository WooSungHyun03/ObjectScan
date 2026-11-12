# 기존 기술로 만들 제품 차별화
평가치는사용자영향/구현가능성/경쟁대비부족/의존위험 각각1~5의제품판단이며실측경쟁력점수가아니다. 아래후속은제품기능후속만이며모델연구백로그는없다.

|후보·사용자과업|영향/가능/부족/위험|구현·비용|측정·선정|
|---|---|---|---|
|1 끊겨도이어서:느린작업기다리는초보|5/5/4/2|기존job/fetch복구 OS-03 1.5d|503후동일job복구·추가생성0;Top5|
|2 촬영전교정:사진고르는사용자|4/4/4/2|기존sharp진단+advisory/선택순서 OS-07 1.5d|fixture경고/사용자override/입력보존;Top5|
|3 쉬운확인·되돌리기:처음편집하는사용자|4/5/4/1|Drei카메라+기존ops이력 OS-19/20 2.5d분할|방향1클릭/선택이력복원·roundtrip;Top5|
|4 내파일→개인작업→게시:외부GLB보유자|4/4/4/4|기존validator/adapter OS-17 1.5d+OWN-09|mock저장완결·실연동은별도;Top5|
|5 구매한모델을다시찾기:재방문구매자|4/5/3/2|기존billing/assets OS-21 .5d|내역→에셋/환불404·TEST구분;Top5|
|6 원본/편집비교·보고서:외부툴사용자|4/5/3/1|MeshReport OS-06 1d|삼각형/UV정확·JSON비밀0;선정|
|7 실제poster·licensefilter:시장탐색자|4/4/4/3|capture/filter OS-09/18 1.5d분할+OWN-08|이미지실물일치·뒤로가기복원;선정|
|8 지원조건·차감·안전한복구:신규가입자|5/5/4/3|기존health/auth OS-01/02 1.5d|잘못된제출차단·만료링크복구;P0|
|9 마스코트온보딩확장:첫방문자|2/5/2/1|기존mascot/help카피·약.5d후속|기존제작진입이이미있어추가화면가치미검증;후속|
|10 다형식내보내기:STL필요사용자|3/3/3/3|기존Threeexporter가능성검토,약1~2d제품slice견적조건부|STLtexture손실/단위미확정안내필요;현재GLB우선,미배정|

한국어그자체나자동mask그자체는경쟁사에도있어고유기술로주장하지않는다. **선택→복구→확인→파일활용을내부모델명없이이해하는한국어워크플로**가검증할제품가설이다. 자동카메라coverage·AI복구·리깅·품질최적화·facecrop자체알고리즘은범위밖이다.

## 라이브러리 재사용·유지보수
현재설치증거는v1 evidence/installed.json이며이번manifest/소스재확인:Three0.183.2,R3F9.8.2,Drei10.7.9,glTF-Transform4.5.1,meshoptimizer1.0.1,sharp0.35.5. 이는최신버전추천이아니다. 라이선스와현재NOTICE를유지하고새런타임의존성추가는기본금지한다.
- [Drei TransformControls 공식](https://drei.docs.pmnd.rs/gizmos/transform-controls):기존변환기능재사용,Orbit충돌방지;새기하알고리즘아님(확인2026-11-12).
- [glTF-Transform simplify 공식](https://gltf-transform.dev/modules/functions/functions/simplify):현재간소화는meshoptimizer기반이며hole-filling/retopology가아님(확인2026-11-12).
- Three/Drei카메라조작과glTF-Transform파일재처리는CPU/WebGL편집이며신규AI학습없음. sharp.stats의기존sharpness/entropy를순수Node helper에서재사용하고UI는typedfixture로진단표시. 실제upload응답연결은OWN-04. browserbundle에sharp를넣거나새진단알고리즘을만들지않음.
- GLB64MiB/외부URI거부/텍스처예산/애니메이션제한을보존한다. Node삭제는face삭제가아니다. 제품범위에없는Blender/Open3D파이프라인이나새렌더러를추가하지않는다.
