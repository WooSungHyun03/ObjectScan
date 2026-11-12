// Public read-only DNS snapshot; NOT a full Cloudflare zone backup.
import {spawnSync} from 'node:child_process';
const records=[];for(const host of ['be-celeb.org','www.be-celeb.org'])for(const type of ['A','AAAA','CNAME','MX','TXT','CAA','NS']){const r=spawnSync('dig',['+short',host,type],{encoding:'utf8',timeout:10000});records.push({host,type,status:r.status===0?'queried':'unavailable',answers:r.status===0?r.stdout.trim().split('\n').filter(Boolean):[]});}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),mode:'PUBLIC_DNS_READ_ONLY',records,limitations:'No account auth, record IDs, proxy flags, full zone, private redirects or alias ownership. Before cutover OWNER must back up Cloudflare zone and exact Vercel alias. No records modified.'},null,2));
