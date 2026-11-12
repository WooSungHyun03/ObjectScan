"""Read-only V6 document/plan validation, no credentials or external services."""
from pathlib import Path
import json,re
D=Path(__file__).resolve().parent;R=D.parent.parent
b=json.loads((D/'backlog.json').read_text());m=json.loads((D/'issue-map.json').read_text())
team=b['team'];owners=b['owner'];obsolete=b['obsolete'];ids=[x['id']for x in team+owners]+obsolete
assert len(ids)==len(set(ids))==31
assert len(team)==17 and len(owners)==10 and len(obsolete)==4
sums={a:sum(x['days']for x in team if x['member']==a)for a in ['A','B']}
assert sums=={'A':7.5,'B':8.0} and abs(sums['A']-sums['B'])<=.5
assert .20<=(20-sum(sums.values()))/20<=.25
assert len(m)==31 and len(set(x['number']for x in m.values()))==31
nodes={x['id']:x for x in team+owners};done=set();visiting=set()
def visit(id):
 if id in done:return
 assert id not in visiting,('cycle',id)
 visiting.add(id)
 for dep in nodes[id]['dependencies']:assert dep in nodes;visit(dep)
 visiting.remove(id);done.add(id)
for id in nodes:visit(id)
for t in team:
 assert .5<=t['days']<=2 and t['days']*2==int(t['days']*2)
 assert t['priority']in['P0','P1']
 for f in t['files']:
  assert (R/f).exists(),f
  assert not f.startswith(('supabase/','gpu-worker/','apps/web/src/lib/server/','apps/web/src/lib/supabase/'))
 p=D/'tickets'/f'{t["id"]}.md';s=p.read_text();assert s.count('Given')>=3
 for token in ['Codex','Owner','Rollback','360','768','1440','키','범위','계약']:assert token in s,(p,token)
 assert '모델연구/새알고리즘을시작하지말라' in s
 assert all(o in {x['id']for x in owners}for o in t['owner'])
for a in ['A','B']:assert any(x['member']==a and not x['dependencies']for x in team)
for p in D.rglob('*.md'):
 for link in re.findall(r'\]\(([^)]+)\)',p.read_text()):
  if '://'not in link and not link.startswith('#'):
   assert (p.parent/link.split('#')[0]).exists(),(p,link)
for p in D.rglob('*.json'):
 assert not re.search(r'(?:test_sk_|live_sk_|sb_secret_|eyJ[a-zA-Z0-9_-]{30,}\.)',p.read_text()),p
print('PASS:31 unique IDs/Issues;17TEAM+10OWNER+4obsolete;A7.5/B8;22.5%buffer;dependencyDAG;Ready A/B;AC/prompts/paths/links;no protected Team write path;no key patterns in JSON')
