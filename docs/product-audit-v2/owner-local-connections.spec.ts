// OWNER-LOCAL audit harness: real local login + mocked project/market/provider APIs.
// It never calls a GPU runner, payment provider or hosted database.
import {test,expect} from '@playwright/test';
import{createClient}from'@supabase/supabase-js';
import{randomUUID}from'node:crypto';
process.loadEnvFile('.env.test.local');
test('v6 audit: publish/search/report/order/callback/download/delete UI connections with explicit fixtures',async({page,baseURL})=>{
 test.setTimeout(120000);
 const u=new URL(process.env.TEST_SUPABASE_URL!);if(!['localhost','127.0.0.1'].includes(u.hostname))throw Error('Local fixtures only');
 const admin=createClient(u.href,process.env.TEST_SERVICE_KEY!,{auth:{persistSession:false}});
 const email=`audit-v6-${randomUUID()}@objectscan.test`,password=`Fixture-${randomUUID()}!`;
 const r=await admin.auth.admin.createUser({email,password,email_confirm:true});if(r.error)throw r.error;const uid=r.data.user!.id;
 const pid=randomUUID(),aid=randomUUID(),lid=randomUUID(),oid=randomUUID();let paid=false,removed=false;const calls:string[]=[];
 const asset={id:aid,name:'로컬 연결 검증 예제 · 생성 결과 아님',project_id:pid,quality:{triangles:22700},can_publish:true,created_at:new Date().toISOString()};
 const listing={id:lid,title:'로컬 연결 검증 상품',description:'모의 API 계약 전용, 실제 판매 상품 아님',category:'objects',license:'standard',price:1000,currency:'KRW',preview_url:baseURL+'/demo/shoe.glb',test_mode:true,seller_badge:'로컬 fixture'};
 try{
 await page.goto('/login');await page.getByRole('textbox',{name:'이메일'}).fill(email);await page.getByLabel('비밀번호',{exact:true}).fill(password);await page.getByRole('button',{name:'로그인',exact:true}).click();await page.waitForURL('**/dashboard');
 await page.route('**/api/**',async route=>{const req=route.request(),p=new URL(req.url()).pathname.slice(5),m=req.method();calls.push(m+' '+p);let json:unknown,status=200;
 if(p==='health')json={payments_mode:'test',models:[]};
 else if(p===`projects/${pid}`)json={id:pid,name:asset.name,mode:'object',status:'completed',input_image_count:1,capture_mode:'orbit',images:[],jobs:[],artifacts:[asset]};
 else if(p===`assets/${aid}/download`){if(paid||!removed)json={url:baseURL+'/demo/shoe.glb',expires_in:120};else{status=404;json={code:'ASSET_NOT_FOUND',error:'에셋을 찾을 수 없습니다.'};}}
 else if(p===`assets/${aid}/publish`){expect(req.postDataJSON().consent).toBe(true);json={id:lid,status:'sandbox_pending'};}
 else if(p==='listings')json=[listing];
 else if(p===`listings/${lid}`)json=listing;
 else if(p===`listings/${lid}/report`)json={ok:true};
 else if(p==='orders'&&m==='POST')json={id:oid,status:'pending',amount:1000,currency:'KRW',kind:'marketplace'};
 else if(p===`orders/${oid}`)json={id:oid,status:paid?'paid':'pending',amount:1000,kind:'marketplace',expires_at:new Date(Date.now()+3600000).toISOString()};
 else if(p==='payments/confirm'){paid=true;json={status:'paid'};}
 else if(p==='assets')json=removed?[]:[asset];
 else if(p===`assets/${aid}`&&m==='DELETE'){removed=true;paid=false;json={ok:true};}
 else if(p==='billing')json={ledger:[],balance:{available:0,reserved:0},payouts:[],orders:[{id:oid,kind:'marketplace',amount:1000,status:paid?'paid':'refunded',created_at:new Date().toISOString()}],payments_mode:'test'};
 else return route.continue();
 await route.fulfill({status,json});});
 await page.goto(`/projects/${pid}`);await expect(page.getByRole('button',{name:'GLB 다운로드',exact:true})).toBeEnabled();await page.getByRole('button',{name:'에셋 마켓 게시 신청',exact:true}).click();await page.getByLabel('제목',{exact:true}).fill(listing.title);await page.getByLabel('테스트 판매 가격 (원)').fill('1000');await page.locator('input[name=rightsConsent]').check();await page.getByRole('button',{name:'검토 요청',exact:true}).click();await expect(page.getByRole('heading',{name:'에셋 게시 신청',exact:true})).toHaveCount(0);
 await page.goto('/marketplace');await page.getByRole('textbox',{name:'에셋 검색'}).fill('로컬');await page.getByRole('link').filter({hasText:listing.title}).click();await expect(page.getByRole('heading',{name:listing.title,exact:true})).toBeVisible();await page.getByRole('button',{name:'콘텐츠 신고',exact:true}).click();await page.getByLabel('신고 사유').fill('로컬 fixture 신고 연결 검증');await page.getByRole('button',{name:'신고 제출'}).click();await expect(page.getByRole('status')).toContainText('신고가 등록');
 await page.getByRole('button',{name:'에셋 테스트 구매',exact:true}).click();await page.waitForURL('**/checkout/'+oid);await expect(page.getByText('₩1,000',{exact:false}).first()).toBeVisible();
 // Provider authentication is deliberately not invoked. Simulate only callback response.
 await page.goto(`/payments/success?paymentKey=local-fixture-only&orderId=${oid}&amount=1000`);await expect(page.getByRole('heading',{name:'결제 확인 완료',exact:true})).toBeVisible();await page.getByRole('link',{name:'내 에셋 확인',exact:true}).click();await expect(page.getByRole('heading',{name:asset.name,exact:true})).toBeVisible();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'다운로드',exact:true}).click();await download;
 for(const width of[360,768,1440]){await page.setViewportSize({width,height:900});await page.screenshot({path:`docs/product-audit-v2/evidence/fixture-assets-${width}.png`});}
 await page.getByRole('button',{name:asset.name+' 삭제',exact:true}).click();await page.getByRole('button',{name:'삭제 확인',exact:true}).click();await expect(page.getByText('아직 보관된 에셋이 없습니다.',{exact:true})).toBeVisible();
 expect(calls).toContain(`POST assets/${aid}/publish`);expect(calls).toContain(`POST listings/${lid}/report`);expect(calls).toContain('POST orders');expect(calls).toContain('POST payments/confirm');console.log('AUDIT PASS: actual local login; MOCK project output/publish/search/report/order/provider/download/delete; no GPU/PG execution');
 }finally{await admin.auth.admin.deleteUser(uid);}
});
