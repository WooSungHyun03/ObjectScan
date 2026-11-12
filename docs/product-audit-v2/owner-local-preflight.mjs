// OWNER-LOCAL read-only inventory. Never print environment values or invoke mutations.
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
const root=resolve(process.argv[2]??process.cwd());
if(!existsSync(resolve(root,'packages/mesh-editor/package.json')))throw Error('Run with ObjectScan-v2 repository root');
const run=(cmd,args)=>{try{return execFileSync(cmd,args,{cwd:root,encoding:'utf8',timeout:10000,stdio:['ignore','pipe','ignore']}).trim();}catch(e){return typeof e.stdout==='string'&&e.stdout.trim()?e.stdout.trim():'unavailable';}};
const names=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','SUPABASE_SERVICE_ROLE_KEY','NEXT_PUBLIC_TOSS_CLIENT_KEY','TOSS_SECRET_KEY','PAYMENTS_MODE'];
const envPath=resolve(root,'apps/web/.env.local');const raw=existsSync(envPath)?readFileSync(envPath,'utf8'):'';
const envPresence=Object.fromEntries(names.map(n=>[n,new RegExp('^'+n+'=.+','m').test(raw)]));
const out={checkedAt:new Date().toISOString(),mode:'READ_ONLY_NO_REMOTE_MUTATION',source:run('git',['rev-parse','HEAD']),node:process.version,envPresence,migrationFiles:readdirSync(resolve(root,'supabase/migrations')).filter(n=>n.endsWith('.sql')).length,workerActive:run('systemctl',['is-active','objectscan-worker.service']),gpu:run('nvidia-smi',['--query-gpu=name,memory.total,memory.used','--format=csv,noheader']),pythonPresent:existsSync(resolve(root,'gpu-worker/.venv/bin/python')),services:[],notice:'Presence is not credential validity. GPU inventory is not inference qualification. No auth, DNS, DB, payment or deployment writes.'};
for(const url of ['http://127.0.0.1:3010/api/health','http://127.0.0.1:56321/auth/v1/health','https://objectscan-six.vercel.app/','https://objectscan-qz44npios-sunghyuns-projects-da008879.vercel.app/','https://be-celeb.org/']){
 try{const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(12000)});const text=await r.text();out.services.push({url,status:r.status,title:text.match(/<title>([^<]*)<\/title>/i)?.[1]});}catch{out.services.push({url,status:'unreachable'});}
}
console.log(JSON.stringify(out,null,2));
